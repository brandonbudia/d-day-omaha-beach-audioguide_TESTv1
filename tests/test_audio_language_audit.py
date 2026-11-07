"""Pure validation checks: no audio/model loading and no file writes."""
import copy
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("audio_language_audit", Path(__file__).resolve().parents[1] / "scripts/audit-audio-language.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AudioLanguageAuditTests(unittest.TestCase):
    def setUp(self):
        self.model = {"name": "small", "revision": "a", "weightsSha256": "b"}
        self.key = audit.fingerprint("audio-sha", self.model)
        self.record = {"schemaVersion": 1, "cacheKey": self.key,
                       "source": {"sha256": "audio-sha", "relativePath": "public/audio/en/stop-01.mp3", "durationSeconds": 10},
                       "model": self.model, "configuration": copy.deepcopy(audit.CONFIGURATION),
                       "segments": [{"words": [{"word": "Hello", "start": 1, "end": 1.5, "probability": 0.99}]}]}

    def validate(self, record):
        audit.validate_record(record, self.key, "audio-sha", self.model, "public/audio/en/stop-01.mp3")

    def test_directory_boundary_rejects_neighbor_with_same_prefix(self):
        root = Path("allowed") / "audit"
        self.assertTrue(audit.inside(root / "nested" / "result.json", root))
        self.assertFalse(audit.inside(Path("allowed") / "audit-other" / "result.json", root))

    def test_station_ids_cannot_escape_the_source_directory(self):
        for value in ("01", "22"):
            self.assertEqual(audit.station(value), value)
        for value in ("1", "00", "23", "../01", "01.mp3", "０１"):
            with self.assertRaises(audit.argparse.ArgumentTypeError):
                audit.station(value)

    def test_source_model_and_configuration_changes_invalidate_the_cache(self):
        self.assertNotEqual(self.key, audit.fingerprint("different-audio", self.model))
        self.assertNotEqual(self.key, audit.fingerprint("audio-sha", {**self.model, "revision": "changed"}))
        self.assertNotEqual(self.key, audit.fingerprint("audio-sha", {**self.model, "weightsSha256": "changed"}))
        original = audit.CONFIGURATION
        try:
            audit.CONFIGURATION = {**original, "beam_size": 6}
            self.assertNotEqual(self.key, audit.fingerprint("audio-sha", self.model))
        finally:
            audit.CONFIGURATION = original

    def test_cache_is_accepted_only_for_matching_provenance_and_configuration(self):
        self.validate(self.record)
        for field, value in (("cacheKey", "other"), ("schemaVersion", 2), ("configuration", {}), ("model", {})):
            with self.assertRaises(ValueError):
                self.validate({**self.record, field: value})
        for field, value in (("relativePath", "public/audio/fr/stop-01.mp3"), ("sha256", "other")):
            with self.assertRaises(ValueError):
                self.validate({**self.record, "source": {**self.record["source"], field: value}})

    def test_nonfinite_or_out_of_audio_word_bounds_are_rejected(self):
        for key, value in (("start", -1), ("end", 12), ("probability", float("nan"))):
            bad = copy.deepcopy(self.record)
            bad["segments"][0]["words"][0][key] = value
            with self.assertRaises(ValueError):
                self.validate(bad)


if __name__ == "__main__":
    unittest.main()
