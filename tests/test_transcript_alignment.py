"""Pure aligner checks: no model import, audio processing, downloads or file writes."""
import ast
import copy
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import Mock


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/align-transcript.py"
spec = importlib.util.spec_from_file_location("transcript_alignment", SCRIPT)
align = importlib.util.module_from_spec(spec)
spec.loader.exec_module(align)


class TranscriptAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.segment = {"text": "Bonjour, le monde.", "startSeconds": 1, "endSeconds": 4}
        self.model = {"name": "small", "revision": "cached", "weightsSha256": "weights"}
        self.expected = align.provenance("audio-sha", "fr", self.model, self.segment)
        self.record = {
            "cacheKey": align.fingerprint(self.expected),
            "provenance": copy.deepcopy(self.expected),
            "verification": "raw-forced-alignment-candidates-not-accepted",
            "sourceDurationSeconds": 5,
            "textTokens": [11, 12],
            "alignmentIssues": [],
            "words": align.raw_candidates([
                {"word": "Bonjour,", "tokens": [11], "start": .1, "end": .6, "probability": .99},
                {"word": "monde.", "tokens": [12], "start": .8, "end": 1.2, "probability": .95},
            ], 1, 4),
        }
        self.seal(self.record)

    @staticmethod
    def seal(record):
        record["recordSha256"] = align.fingerprint({key: value for key, value in record.items() if key != "recordSha256"})

    def test_directory_boundary_does_not_accept_a_neighbor_with_the_same_prefix(self):
        boundary = Path("allowed") / "alignment"
        self.assertTrue(align.inside(boundary / "nested" / "result.json", boundary))
        self.assertFalse(align.inside(Path("allowed") / "alignment-other" / "result.json", boundary))
        self.assertFalse(align.inside((boundary / ".." / "elsewhere").resolve(), boundary.resolve()))

    def test_supplied_text_and_valid_windows_are_preserved_without_interpolation(self):
        supplied = {"text": "  L’été — KIEFFER, 177.\n", "startSeconds": .25, "endSeconds": 30.25, "source": "not rewritten"}
        expected = {key: supplied[key] for key in ("text", "startSeconds", "endSeconds")}
        self.assertEqual(align.parse_segments([supplied]), [expected])
        self.assertEqual(align.parse_segments({"segments": [supplied]}), [expected])
        self.assertEqual(supplied["text"], "  L’été — KIEFFER, 177.\n")
        self.assertEqual(align.parse_segments([{**self.segment, "startSeconds": 0, "endSeconds": .02}])[0]["endSeconds"], .02)

    def test_invalid_text_and_nonfinite_or_artificially_large_windows_are_rejected(self):
        for document in (None, {}, [], {"segments": []}, {"segments": "words"}, [None], [{"text": " "}]):
            with self.subTest(document=document), self.assertRaises(ValueError):
                align.parse_segments(document)
        for start, end in ((-1, 4), (1, 1), (2, 1), (0, .019), (0, 30.001), (False, 4), (0, True), (float("nan"), 4), (0, float("inf")), ("1", 4)):
            with self.subTest(start=start, end=end), self.assertRaises(ValueError):
                align.parse_segments([{**self.segment, "startSeconds": start, "endSeconds": end}])

    def test_source_text_window_language_audio_and_model_changes_invalidate_the_cache_key(self):
        original = align.fingerprint(self.expected)
        changes = (
            align.provenance("new-audio", "fr", self.model, self.segment),
            align.provenance("audio-sha", "en", self.model, self.segment),
            align.provenance("audio-sha", "fr", {**self.model, "weightsSha256": "new-weights"}, self.segment),
            align.provenance("audio-sha", "fr", self.model, {**self.segment, "text": "Different source text."}),
            align.provenance("audio-sha", "fr", self.model, {**self.segment, "startSeconds": 1.1}),
            align.provenance("audio-sha", "fr", self.model, {**self.segment, "endSeconds": 4.1}),
        )
        for changed in changes:
            self.assertNotEqual(align.fingerprint(changed), original)
            with self.assertRaises(ValueError):
                align.validate_cached(self.record, changed)
        changed_configuration = copy.deepcopy(self.expected)
        changed_configuration["configuration"]["toolRevision"] = "different-tokenization"
        self.assertNotEqual(align.fingerprint(changed_configuration), original)

    def test_only_integrity_checked_raw_candidates_are_accepted_as_cache(self):
        align.validate_cached(self.record, self.expected)
        for field, value in (("cacheKey", "other"), ("recordSha256", "other"), ("verification", "accepted"), ("sourceDurationSeconds", 3), ("sourceDurationSeconds", float("nan")), ("words", None), ("textTokens", None), ("alignmentIssues", None)):
            with self.subTest(field=field), self.assertRaises(ValueError):
                align.validate_cached({**self.record, field: value}, self.expected)
        modified = copy.deepcopy(self.record)
        modified["words"][0]["startSeconds"] += .01
        with self.assertRaises(ValueError):
            align.validate_cached(modified, self.expected)
        for field, value in (("accepted", True), ("accepted", 0), ("probability", float("nan")), ("startSeconds", True), ("issues", "low confidence")):
            modified = copy.deepcopy(self.record)
            modified["words"][0][field] = value
            if not isinstance(value, float) or value == value:
                self.seal(modified)
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                align.validate_cached(modified, self.expected)

    def test_candidates_keep_real_offsets_and_remain_unaccepted_even_when_confident(self):
        words = align.raw_candidates([
            {"word": "Mot", "tokens": [3], "start": .12, "end": .4, "probability": .99},
            {"word": "absent", "tokens": [4], "start": .5, "end": .5, "probability": .2},
        ], 10, 13)
        self.assertEqual((words[0]["startSeconds"], words[0]["endSeconds"]), (10.12, 10.4))
        self.assertEqual(words[0]["windowRelativeStartSeconds"], .12)
        self.assertFalse(words[0]["accepted"])
        self.assertEqual(words[0]["issues"], [])
        self.assertFalse(words[1]["accepted"])
        self.assertEqual(words[1]["startSeconds"], words[1]["endSeconds"], "zero-length words must not receive fabricated durations")
        self.assertIn("non-positive-duration", words[1]["issues"])
        self.assertIn("low-model-probability", words[1]["issues"])

    def test_suspicious_bounds_are_flagged_and_nonfinite_model_output_aborts(self):
        words = align.raw_candidates([
            {"word": "before", "start": -.1, "end": .2, "probability": .99},
            {"word": "overlap", "start": .1, "end": 3.1, "probability": .99},
        ], 10, 12)
        self.assertIn("outside-supplied-window", words[0]["issues"])
        self.assertIn("outside-supplied-window", words[1]["issues"])
        self.assertIn("overlapping-previous-candidate", words[1]["issues"])
        self.assertIn("long-duration-requires-review", words[1]["issues"])
        for key in ("start", "end", "probability"):
            with self.subTest(key=key), self.assertRaises(ValueError):
                align.raw_candidates([{**{"word": "invalid", "start": .1, "end": .2, "probability": .9}, key: float("nan")}], 0, 1)

    def test_publish_uses_exclusive_creation_and_never_overwrites_an_existing_file(self):
        path = Mock()
        path.open.side_effect = FileExistsError("existing candidate evidence")
        with self.assertRaises(FileExistsError):
            align.publish_exclusive(path, self.record)
        path.open.assert_called_once_with("x", encoding="utf-8", newline="\n")

    def test_whisper_tokenization_has_one_leading_space_without_rewriting_source(self):
        # Exercise the actual tokenizer call in main with a pure recording stub.
        # No faster-whisper import or model execution is needed for this regression.
        tree = ast.parse(SCRIPT.read_text(encoding="utf-8"))
        assignments = [node for node in ast.walk(tree) if isinstance(node, ast.Assign)
                       and any(isinstance(target, ast.Name) and target.id == "tokens" for target in node.targets)]
        self.assertEqual(len(assignments), 1)
        tokenizer = Mock()
        for text in ("Bonjour", "   Bonjour", "\nBonjour", "L’été — KIEFFER"):
            segment = {"text": text}
            namespace = {"tokenizer": tokenizer, "segment": segment}
            module = ast.fix_missing_locations(ast.Module(body=[assignments[0]], type_ignores=[]))
            exec(compile(module, str(SCRIPT), "exec"), namespace)
            tokenizer.encode.assert_called_with(" " + text.lstrip())
            self.assertEqual(segment["text"], text)
        self.assertEqual(align.CONFIGURATION["toolRevision"], "raw-attention-dtw-v2")


if __name__ == "__main__":
    unittest.main()
