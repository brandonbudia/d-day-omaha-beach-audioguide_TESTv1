"""Offline attention/DTW alignment of supplied text against existing audio.

Run with the existing external faster-whisper environment. This script neither
recognizes/replaces the supplied transcript nor accepts word timings for the app.
Each input segment must already have a real, reviewed audio window of <=30 s.
Outputs are provisional raw candidates; forced alignment cannot prove that a
supplied word is actually spoken. Independent recognition/listening is required.
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
PROJECT = Path(__file__).resolve().parents[1]
ARTIFACT_BOUNDARY = Path("C:/Users/brand/.codex/visualizations/2026/10/30/01a18a71-0798-7bd2-8114-5567c885946a")
CONFIGURATION = {
    "toolRevision": "raw-attention-dtw-v2",
    "method": "faster-whisper.find_alignment/attention-DTW",
    "device": "cpu", "compute_type": "int8", "cpu_threads": 4,
    "samplingRate": 16000, "maximumClipSeconds": 30,
    "medianFilterWidth": 7, "tokenization": "Whisper leading-space prefix; source text preserved verbatim",
    "interpolation": "none", "timestampPostprocessing": "none",
}


def emit(event: str, **fields) -> None:
    print(json.dumps({"event": event, **fields}, ensure_ascii=True, allow_nan=False), flush=True)


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def fingerprint(value: object) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(",", ":"), allow_nan=False).encode("utf-8")).hexdigest()


def inside(path: Path, directory: Path) -> bool:
    try:
        path.relative_to(directory)
        return True
    except ValueError:
        return False


def finite_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def parse_segments(document: object) -> list[dict]:
    entries = document.get("segments") if isinstance(document, dict) else document
    if not isinstance(entries, list) or not entries:
        raise ValueError("input must contain a nonempty segments list")
    result = []
    for index, segment in enumerate(entries):
        if not isinstance(segment, dict) or not isinstance(segment.get("text"), str) or not segment["text"].strip():
            raise ValueError(f"segment {index}: nonempty supplied text is required")
        start, end = segment.get("startSeconds"), segment.get("endSeconds")
        if not finite_number(start) or not finite_number(end) or start < 0 or end <= start:
            raise ValueError(f"segment {index}: invalid audio window")
        if end - start > CONFIGURATION["maximumClipSeconds"] or end - start < 0.02:
            raise ValueError(f"segment {index}: window must be between 0.02 and 30 seconds; supply real smaller windows, not interpolated text")
        result.append({"text": segment["text"], "startSeconds": start, "endSeconds": end})
    return result


def local_model(model_cache: Path) -> tuple[Path, dict]:
    """Resolve a local small CTranslate2 snapshot, never a remote model name."""
    model_cache = model_cache.resolve(strict=True)
    if (model_cache / "model.bin").is_file():
        snapshot = model_cache
        revision = snapshot.name if snapshot.parent.name == "snapshots" else "local-files"
    else:
        repository = model_cache if model_cache.name == "models--Systran--faster-whisper-small" else model_cache / "models--Systran--faster-whisper-small"
        reference = repository / "refs/main"
        if not reference.is_file():
            raise ValueError("local small model revision is missing; downloading is forbidden")
        revision = reference.read_text(encoding="utf-8").strip()
        if not revision or any(character not in "0123456789abcdef" for character in revision):
            raise ValueError("invalid local model revision")
        snapshot = (repository / "snapshots" / revision).resolve(strict=True)
    for name in ("model.bin", "config.json", "tokenizer.json"):
        if not (snapshot / name).is_file():
            raise ValueError(f"local model incomplete ({name}); downloading is forbidden")
    identity = {
        "family": "faster-whisper", "name": "small" if "models--Systran--faster-whisper-small" in snapshot.parts else "local-whisper-snapshot", "revision": revision,
        "weightsSha256": digest(snapshot / "model.bin"),
        "configSha256": digest(snapshot / "config.json"),
        "tokenizerSha256": digest(snapshot / "tokenizer.json"),
        "preprocessorSha256": digest(snapshot / "preprocessor_config.json") if (snapshot / "preprocessor_config.json").is_file() else None,
        "packageVersion": importlib.metadata.version("faster-whisper"),
        "ctranslate2Version": importlib.metadata.version("ctranslate2"),
    }
    return snapshot, identity


def provenance(audio_sha: str, language: str, model: dict, segment: dict) -> dict:
    return {"schemaVersion": 1, "audioSha256": audio_sha, "language": language,
            "model": model, "configuration": CONFIGURATION, "segment": segment}


def validate_cached(record: dict, expected: dict) -> None:
    if (not isinstance(record, dict) or record.get("provenance") != expected
            or record.get("cacheKey") != fingerprint(expected)
            or record.get("verification") != "raw-forced-alignment-candidates-not-accepted"
            or record.get("recordSha256") != fingerprint({key: value for key, value in record.items() if key != "recordSha256"})
            or not isinstance(record.get("words"), list)
            or not finite_number(record.get("sourceDurationSeconds"))
            or record["sourceDurationSeconds"] < expected["segment"]["endSeconds"]
            or not isinstance(record.get("alignmentIssues"), list) or not isinstance(record.get("textTokens"), list)):
        raise ValueError("existing alignment cache does not match; refusing to overwrite it")
    for word in record["words"]:
        if (not isinstance(word, dict) or not isinstance(word.get("word"), str)
                or not all(finite_number(word.get(key)) for key in ("startSeconds", "endSeconds", "probability"))
                or word.get("accepted") is not False or not isinstance(word.get("issues"), list)):
            raise ValueError("existing alignment cache has invalid candidates")


def publish_exclusive(path: Path, record: dict) -> None:
    # A partial pre-existing file is an explicit error, never silently discarded.
    with path.open("x", encoding="utf-8", newline="\n") as target:
        json.dump(record, target, ensure_ascii=False, indent=2, allow_nan=False)
        target.write("\n")


def raw_candidates(alignment: list[dict], offset: float, window_end: float) -> list[dict]:
    words = []
    previous_end = offset
    for candidate in alignment:
        start, end, probability = (float(candidate[key]) for key in ("start", "end", "probability"))
        if not all(math.isfinite(value) for value in (start, end, probability)):
            raise ValueError("alignment returned a non-finite candidate; no valid timing is substituted")
        absolute_start, absolute_end = offset + start, offset + end
        issues = []
        if absolute_end <= absolute_start:
            issues.append("non-positive-duration")
        if absolute_start < offset or absolute_end > window_end:
            issues.append("outside-supplied-window")
        if absolute_start < previous_end:
            issues.append("overlapping-previous-candidate")
        if absolute_end - absolute_start > 2.5:
            issues.append("long-duration-requires-review")
        if probability < 0.7:
            issues.append("low-model-probability")
        words.append({"word": str(candidate["word"]), "tokens": [int(token) for token in candidate.get("tokens", [])],
                      "startSeconds": absolute_start, "endSeconds": absolute_end,
                      "windowRelativeStartSeconds": start, "windowRelativeEndSeconds": end,
                      "probability": probability, "accepted": False, "issues": issues})
        previous_end = absolute_end
    return words


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--audio-sha256", required=True, help="expected SHA256; mismatch aborts before model processing")
    parser.add_argument("--input", required=True, type=Path, help="JSON list or {segments:[{text,startSeconds,endSeconds}]}")
    parser.add_argument("--language", required=True, choices=LANGUAGES)
    parser.add_argument("--model-cache", required=True, type=Path, help="existing local small snapshot or Hugging Face cache root")
    parser.add_argument("--output", required=True, type=Path, help="artifact directory outside TESTv1; output files are content addressed")
    args = parser.parse_args()
    audio_path, input_path = args.audio.resolve(strict=True), args.input.resolve(strict=True)
    output, model_cache = args.output.resolve(), args.model_cache.resolve(strict=True)
    boundary = ARTIFACT_BOUNDARY.resolve(strict=True)
    if not inside(output, boundary) or output == boundary or inside(output, PROJECT):
        raise ValueError("output must be a separate directory inside the authorized artifact boundary, outside the project")
    if inside(output, model_cache) or inside(model_cache, output):
        raise ValueError("output must not overlap the local model cache")
    if not audio_path.is_file() or not input_path.is_file() or audio_path.suffix.lower() not in (".mp3", ".wav", ".flac", ".ogg", ".m4a"):
        raise ValueError("audio and input must be existing files; unsupported audio extension")
    expected_sha = args.audio_sha256.lower()
    if len(expected_sha) != 64 or any(character not in "0123456789abcdef" for character in expected_sha):
        raise ValueError("expected audio SHA256 must have 64 hexadecimal characters")
    actual_sha = digest(audio_path)
    if actual_sha != expected_sha:
        raise ValueError("audio SHA256 mismatch; no alignment or audio replacement performed")
    input_bytes = input_path.read_bytes()
    input_sha = hashlib.sha256(input_bytes).hexdigest()
    document = json.loads(input_bytes.decode("utf-8-sig"))
    if isinstance(document, dict) and document.get("audioSha256", expected_sha) != expected_sha:
        raise ValueError("input document targets another audio SHA256")
    segments = parse_segments(document)
    snapshot, model_identity = local_model(model_cache)
    input_identity = {"audioSha256": actual_sha, "language": args.language, "segments": segments,
                      "model": model_identity, "configuration": CONFIGURATION}
    job_key = fingerprint(input_identity)
    bundle_path = output / f"{args.language}-alignment-{job_key}.json"
    if bundle_path.exists():
        existing = json.loads(bundle_path.read_text(encoding="utf-8"))
        if (existing.get("cacheKey") != job_key or existing.get("inputIdentity") != input_identity
                or existing.get("recordSha256") != fingerprint({key: value for key, value in existing.items() if key != "recordSha256"})
                or not isinstance(existing.get("segments"), list) or len(existing["segments"]) != len(segments)):
            raise ValueError("existing bundle is invalid; refusing to overwrite it")
        for segment, record in zip(segments, existing["segments"]):
            validate_cached(record, provenance(actual_sha, args.language, model_identity, segment))
        emit("alignment_complete", cache=str(bundle_path), reused=True, segments=len(segments), acceptedWords=0)
        return 0
    output.mkdir(parents=True, exist_ok=True)
    model = None
    decoded = None
    duration = None
    records = []
    started = time.monotonic()
    for index, segment in enumerate(segments):
        expected = provenance(actual_sha, args.language, model_identity, segment)
        key = fingerprint(expected)
        cache_file = output / f"segment-{key}.json"
        if cache_file.exists():
            record = json.loads(cache_file.read_text(encoding="utf-8"))
            validate_cached(record, expected)
            duration = record["sourceDurationSeconds"]
            reused = True
        else:
            from faster_whisper import WhisperModel
            from faster_whisper.audio import decode_audio, pad_or_trim
            from faster_whisper.tokenizer import Tokenizer
            if model is None:
                model = WhisperModel(str(snapshot), device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
                if args.language not in model.supported_languages:
                    raise ValueError("local model does not support the requested language")
                if model.feature_extractor.sampling_rate != CONFIGURATION["samplingRate"]:
                    raise ValueError("local model sample rate differs from the explicitly configured 16kHz")
            if decoded is None:
                decoded = decode_audio(str(audio_path), sampling_rate=CONFIGURATION["samplingRate"])
                duration = len(decoded) / CONFIGURATION["samplingRate"]
            if segment["endSeconds"] > duration:
                raise ValueError(f"segment {index} ends after decoded audio ({duration}s); no clamping performed")
            tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task="transcribe", language=args.language)
            # Whisper's BPE uses the leading space as part of a word token.
            # This changes model input only, never the stored/displayed source.
            tokens = tokenizer.encode(" " + segment["text"].lstrip())
            if len(tokens) + len(tokenizer.sot_sequence) + 1 > model.max_length:
                raise ValueError(f"segment {index} exceeds model text context; provide a smaller real audio/text segment")
            first = round(segment["startSeconds"] * CONFIGURATION["samplingRate"])
            last = round(segment["endSeconds"] * CONFIGURATION["samplingRate"])
            clip = decoded[first:last]
            offset = first / CONFIGURATION["samplingRate"]
            features = model.feature_extractor(clip)
            frames = min(features.shape[-1], model.feature_extractor.nb_max_frames)
            encoded = model.encode(pad_or_trim(features, length=model.feature_extractor.nb_max_frames))
            aligned = model.find_alignment(tokenizer, [tokens], encoded, frames, median_filter_width=CONFIGURATION["medianFilterWidth"])
            if len(aligned) != 1:
                raise ValueError("unexpected alignment response; no candidate timing substituted")
            if digest(audio_path) != actual_sha:
                raise ValueError("audio changed during alignment; refusing to publish candidates")
            alignment_issues = []
            if not aligned[0]:
                alignment_issues.append("no-candidates-returned")
            if [int(token) for word in aligned[0] for token in word.get("tokens", [])] != tokens:
                alignment_issues.append("token-coverage-mismatch")
            record = {"cacheKey": key, "provenance": expected, "createdAt": datetime.now(timezone.utc).isoformat(),
                      "verification": "raw-forced-alignment-candidates-not-accepted", "sourceDurationSeconds": duration,
                      "textTokens": tokens, "alignmentIssues": alignment_issues,
                      "decodedWindow": {"firstSample": first, "lastSampleExclusive": last, "sampleRate": CONFIGURATION["samplingRate"]},
                      "words": raw_candidates(aligned[0], offset, last / CONFIGURATION["samplingRate"])}
            record["recordSha256"] = fingerprint(record)
            validate_cached(record, expected)
            publish_exclusive(cache_file, record)
            reused = False
        records.append(record)
        emit("segment_complete", segment=index, words=len(record["words"]), reused=reused, cache=str(cache_file), acceptedWords=0)
    if digest(audio_path) != actual_sha:
        raise ValueError("audio changed before completion; refusing to publish bundle")
    if digest(input_path) != input_sha:
        raise ValueError("input text changed during alignment; refusing to misidentify the bundle source")
    bundle = {"schemaVersion": 1, "cacheKey": job_key, "inputIdentity": input_identity,
              "createdAt": datetime.now(timezone.utc).isoformat(), "source": {"path": str(audio_path), "sha256": actual_sha, "bytes": audio_path.stat().st_size, "durationSeconds": duration},
              "input": {"path": str(input_path), "fileSha256": input_sha, "segmentsSha256": fingerprint(segments)},
              "verification": "raw-forced-alignment-candidates-not-accepted", "acceptedWords": 0,
              "warning": "Forced alignment can assign timings to absent words. Compare independent recognition and listen; never import these candidates automatically.",
              "processingSeconds": round(time.monotonic() - started, 3), "segments": records}
    bundle["recordSha256"] = fingerprint(bundle)
    publish_exclusive(bundle_path, bundle)
    emit("alignment_complete", cache=str(bundle_path), reused=False, segments=len(segments), acceptedWords=0)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        emit("alignment_failed", errorType=type(error).__name__, message=str(error))
        sys.exit(1)
