"""Audit existing MP3 language/speech using an existing offline Whisper model.

Audio and application data are read only. Raw recognition is provisional evidence,
not an approved transcript or a set of accepted forced-alignment timestamps.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True

LANGUAGES = ("fr", "en", "de", "it", "pl", "nl", "es")
ARTIFACT_BOUNDARY = Path("C:/Users/brand/.codex/visualizations/2026/10/30/01a18a71-0798-7bd2-8114-5567c885946a")
CONFIGURATION = {
    "device": "cpu", "compute_type": "int8", "cpu_threads": 4,
    "language": None, "task": "transcribe", "beam_size": 5,
    "temperature": 0, "word_timestamps": True, "vad_filter": False,
    "condition_on_previous_text": False,
}


def emit(event: str, **fields) -> None:
    print(json.dumps({"event": event, **fields}, ensure_ascii=True, allow_nan=False), flush=True)


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def inside(path: Path, directory: Path) -> bool:
    try:
        path.relative_to(directory)
        return True
    except ValueError:
        return False


def station(value: str) -> str:
    if len(value) != 2 or not value.isascii() or not value.isdigit() or not 1 <= int(value) <= 22:
        raise argparse.ArgumentTypeError("station must be an exact two-digit ID from 01 to 22")
    return value


def validate_paths(project: Path, output: Path, model_cache: Path) -> tuple[Path, Path, Path]:
    project, output, model_cache = project.resolve(strict=True), output.resolve(), model_cache.resolve(strict=True)
    boundary = ARTIFACT_BOUNDARY.resolve(strict=True)
    if project.name != "d-day-omaha-beach-audioguide_TESTv1" or not (project / ".git").exists():
        raise ValueError("only the TESTv1 checkout is permitted")
    if not inside(output, boundary) or output == boundary or inside(output, project):
        raise ValueError("output must be a separate directory inside the authorized artifact boundary")
    if inside(model_cache, output) or inside(output, model_cache):
        raise ValueError("output must not overlap the existing model cache")
    if output.exists() and not output.is_dir():
        raise ValueError("output is not a directory")
    return project, output, model_cache


def find_model(model_cache: Path, name: str) -> tuple[Path, dict]:
    model = model_cache / f"models--Systran--faster-whisper-{name}"
    reference = model / "refs/main"
    if not reference.is_file():
        raise ValueError(f"cached {name} model has no local main revision; downloading is forbidden")
    revision = reference.read_text(encoding="utf-8").strip()
    if not revision or any(character not in "0123456789abcdef" for character in revision):
        raise ValueError("invalid cached model revision")
    snapshot = (model / "snapshots" / revision).resolve(strict=True)
    for filename in ("model.bin", "config.json", "tokenizer.json"):
        if not (snapshot / filename).is_file():
            raise ValueError(f"cached model is incomplete: {filename}")
    identity = {"family": "faster-whisper", "name": name, "revision": revision,
                "weightsSha256": digest(snapshot / "model.bin"),
                "configSha256": digest(snapshot / "config.json"),
                "tokenizerSha256": digest(snapshot / "tokenizer.json"),
                "packageVersion": importlib.metadata.version("faster-whisper")}
    return snapshot, identity


def fingerprint(audio_sha: str, model: dict) -> str:
    data = {"schemaVersion": 1, "audioSha256": audio_sha, "model": model, "configuration": CONFIGURATION}
    return hashlib.sha256(json.dumps(data, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def validate_record(record: dict, cache_key: str, audio_sha: str, model: dict, relative: str) -> None:
    if (record.get("schemaVersion") != 1 or record.get("cacheKey") != cache_key
            or record.get("source", {}).get("sha256") != audio_sha
            or record.get("source", {}).get("relativePath") != relative
            or record.get("model") != model or record.get("configuration") != CONFIGURATION
            or not isinstance(record.get("segments"), list)):
        raise ValueError("existing cache provenance does not match; refusing to overwrite it")
    duration = record["source"].get("durationSeconds")
    if not isinstance(duration, (float, int)) or not math.isfinite(duration) or duration <= 0:
        raise ValueError("cached duration is invalid")
    for segment in record["segments"]:
        for word in segment.get("words", []):
            if not all(isinstance(word.get(key), (float, int)) and math.isfinite(word[key]) for key in ("start", "end", "probability")):
                raise ValueError("cached word has non-finite bounds or probability")
            if not 0 <= word["start"] <= word["end"] <= duration + 0.1:
                raise ValueError("cached word bounds are outside the decoded audio")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--model-cache", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    parser.add_argument("--language-folder", required=True, choices=LANGUAGES)
    parser.add_argument("--stations", required=True, nargs="+", type=station)
    parser.add_argument("--model", choices=("small", "medium"), default="small")
    parser.add_argument("--gate-first-english", action="store_true", help="stop unless station 01 is confidently recognized as English before continuing")
    args = parser.parse_args()
    project, output, model_cache = validate_paths(args.project_root, args.output_root, args.model_cache)
    requested = list(dict.fromkeys(args.stations))
    if args.gate_first_english and (args.language_folder != "en" or requested[0] != "01"):
        raise ValueError("English gating requires folder en and station 01 first")
    snapshot, model_identity = find_model(model_cache, args.model)
    # Resolve every source before creating outputs. No arbitrary output filename or
    # shell command is accepted; neither model output nor input text is executed.
    audio_root = (project / "public/audio" / args.language_folder).resolve(strict=True)
    if not inside(audio_root, project):
        raise ValueError("audio language directory escaped the TESTv1 checkout")
    sources = [(identifier, (audio_root / f"stop-{identifier}.mp3").resolve(strict=True)) for identifier in requested]
    if any(not inside(path, audio_root) or not path.is_file() for _, path in sources):
        raise ValueError("audio source escaped its language directory or is not a file")
    output.mkdir(parents=True, exist_ok=True)
    model = None
    completed = []
    for identifier, audio_path in sources:
        sha = digest(audio_path)
        relative = audio_path.relative_to(project).as_posix()
        cache_key = fingerprint(sha, model_identity)
        cache_file = (output / f"{args.language_folder}-{identifier}-{cache_key}.json").resolve()
        if not inside(cache_file, output) or cache_file == audio_path or cache_file.suffix != ".json":
            raise ValueError("unsafe output path")
        if cache_file.exists():
            record = json.loads(cache_file.read_text(encoding="utf-8"))
            validate_record(record, cache_key, sha, model_identity, relative)
            reused = True
        else:
            from faster_whisper import WhisperModel
            from faster_whisper.audio import decode_audio
            if model is None:
                # Direct local snapshot avoids network lookup or model downloads.
                model = WhisperModel(str(snapshot), device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
            started = time.monotonic()
            audio = decode_audio(str(audio_path), sampling_rate=16000)
            duration = len(audio) / 16000
            segments, info = model.transcribe(audio, **{key: value for key, value in CONFIGURATION.items() if key not in ("device", "compute_type", "cpu_threads")})
            emit("language_detected", station=identifier, language=info.language, probability=info.language_probability,
                 durationSeconds=duration, detectionScope="initial detection window, not a whole-recording language certification")
            entries = []
            for segment in segments:
                entry = {"id": segment.id, "start": segment.start, "end": segment.end, "text": segment.text,
                         "avgLogProbability": segment.avg_logprob, "noSpeechProbability": segment.no_speech_prob,
                         "words": [{"word": word.word, "start": word.start, "end": word.end, "probability": word.probability}
                                   for word in segment.words or []]}
                entries.append(entry)
            if digest(audio_path) != sha:
                raise ValueError("audio changed during recognition; refusing to publish its cache")
            record = {"schemaVersion": 1, "cacheKey": cache_key, "createdAt": datetime.now(timezone.utc).isoformat(),
                      "source": {"relativePath": relative, "sha256": sha, "bytes": audio_path.stat().st_size,
                                 "durationSeconds": duration, "decodedSampleRate": 16000},
                      "model": model_identity, "configuration": CONFIGURATION,
                      "languageDetection": {"language": info.language, "probability": info.language_probability,
                                            "allProbabilities": info.all_language_probs,
                                            "scope": "initial automatic detection window; later code switching is not excluded"},
                      "verification": "automatic-recognition-provisional-human-review-required",
                      "processingSeconds": round(time.monotonic() - started, 3), "segments": entries}
            validate_record(record, cache_key, sha, model_identity, relative)
            # Exclusive creation: never overwrite an existing cache, source or app file.
            # A partial file after interruption causes an explicit error on retry.
            with cache_file.open("x", encoding="utf-8", newline="\n") as target:
                json.dump(record, target, ensure_ascii=False, indent=2, allow_nan=False)
                target.write("\n")
            reused = False
        text = " ".join(segment["text"].strip() for segment in record["segments"])
        word_count = sum(len(segment["words"]) for segment in record["segments"])
        summary = {"station": identifier, "language": record["languageDetection"]["language"],
                   "languageProbability": record["languageDetection"]["probability"],
                   "durationSeconds": record["source"]["durationSeconds"], "words": word_count,
                   "cache": str(cache_file), "reused": reused, "processingSeconds": record["processingSeconds"],
                   "opening": text[:450], "ending": text[-450:]}
        completed.append(summary)
        emit("station_complete", **summary)
        if args.gate_first_english and identifier == "01":
            if summary["language"] != "en" or summary["languageProbability"] < 0.85 or word_count < 30:
                emit("gate_stopped", reason="station 01 did not provide sufficiently clear English evidence")
                return 4
            emit("english_gate_passed", station=identifier, probability=summary["languageProbability"])
    emit("batch_complete", stations=len(completed), cacheFiles=[row["cache"] for row in completed])
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        emit("audit_failed", errorType=type(error).__name__, message=str(error))
        sys.exit(1)
