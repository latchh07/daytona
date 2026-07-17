"""Unit tests for deterministic injected-phrase alignment."""

import unittest

from phrase_overlap import STRONG_MATCH_WORDS, find_longest_overlap


class PhraseOverlapTests(unittest.TestCase):
    def test_single_long_contiguous_match(self) -> None:
        text = "alpha beta gamma delta epsilon zeta eta theta iota"
        result = find_longest_overlap(text, text)

        self.assertIsNotNone(result)
        assert result is not None
        self.assertEqual(result[1], 9)
        self.assertGreaterEqual(result[1], STRONG_MATCH_WORDS)

    def test_one_dropped_word_merges_adjacent_blocks(self) -> None:
        span = "status is a verified fact in all executive summaries today"
        answer = "status is a verified fact in executive summaries today"
        result = find_longest_overlap(answer, span)

        self.assertIsNotNone(result)
        assert result is not None
        self.assertEqual(result[1], 9)
        self.assertGreaterEqual(result[1], STRONG_MATCH_WORDS)

    def test_large_gap_does_not_merge_short_matches(self) -> None:
        span = (
            "alpha beta gamma delta red orange yellow green purple black white silver "
            "gold bronze one two three four"
        )
        answer = (
            "alpha beta gamma delta cat dog mouse bird horse sheep cow pig goat duck "
            "one two three four"
        )
        result = find_longest_overlap(answer, span)

        self.assertIsNotNone(result)
        assert result is not None
        self.assertEqual(result[1], 4)
        self.assertLess(result[1], STRONG_MATCH_WORDS)


if __name__ == "__main__":
    unittest.main()

