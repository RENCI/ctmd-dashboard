"""
Tests for redcap_importer/mapping.py

Validates that get_redcap_fields correctly derives the authoritative list of
raw REDCap field names from mapping.json, covering all expression forms.
"""

import os
import pytest

from redcap_importer.mapping import get_redcap_fields, _parse_expression

# Path to the real mapping.json, relative to the repo root
MAPPING_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "data", "mapping.json"
)


# ---------------------------------------------------------------------------
# Unit tests — expression parser
# ---------------------------------------------------------------------------

class TestParseExpression:
    def test_simple_field(self):
        assert _parse_expression("proposal_id") == {"proposal_id"}

    def test_slash_alternatives(self):
        result = _parse_expression("funding_source/funding_source_2/funding_source_3")
        assert result == {"funding_source", "funding_source_2", "funding_source_3"}

    def test_function_wrapper_slash(self):
        result = _parse_expression("extract_first_name(pi_name/pi_name_2)")
        assert result == {"pi_name", "pi_name_2"}

    def test_function_wrapper_comma(self):
        result = _parse_expression("generate_ID(pi_firstname,pi_lastname)")
        assert result == {"pi_firstname", "pi_lastname"}

    def test_conditional_standalone(self):
        result = _parse_expression('if ko_meeting="1" then kick_off_scheduled else "N/A"')
        assert "kick_off_scheduled" in result
        assert "ko_meeting" in result
        assert "then" not in result
        assert "else" not in result
        assert "if" not in result

    def test_conditional_as_slash_suffix(self):
        # e.g. 'info_share_question/if funding="1" then "1" else "0"'
        result = _parse_expression('info_share_question/if funding="1" then "1" else "0"')
        assert "info_share_question" in result
        assert "funding" in result
        assert "then" not in result
        assert "else" not in result

    def test_no_noise_words(self):
        result = _parse_expression('if ko_occured="1" then kick_off else "N/A"')
        noise = {"then", "else", "if", "or", "and", "not"}
        assert result.isdisjoint(noise)


# ---------------------------------------------------------------------------
# Integration tests — against the real mapping.json
# ---------------------------------------------------------------------------

class TestGetRedcapFields:
    @pytest.fixture(scope="class")
    def fields(self):
        return get_redcap_fields(MAPPING_PATH)

    def test_returns_list(self, fields):
        assert isinstance(fields, list)

    def test_sorted(self, fields):
        assert fields == sorted(fields)

    def test_no_duplicates(self, fields):
        assert len(fields) == len(set(fields))

    def test_expected_count(self, fields):
        assert len(fields) == 149

    def test_no_noise_words(self, fields):
        noise = {"then", "else", "if", "or", "and", "not", "n/a"}
        assert not any(f in noise for f in fields)

    def test_no_raw_conditional_expressions(self, fields):
        assert not any(f.startswith("if ") for f in fields)

    def test_no_function_wrappers(self, fields):
        assert not any("(" in f for f in fields)

    def test_no_slash_expressions(self, fields):
        assert not any("/" in f for f in fields)

    # Spot-check key fields from each major instrument
    def test_contains_core_proposal_fields(self, fields):
        assert "proposal_id" in fields
        assert "prop_submit" in fields
        assert "protocol_status" in fields
        assert "proposal_title2" in fields

    def test_contains_pi_fields(self, fields):
        assert "pi_firstname" in fields
        assert "pi_lastname" in fields
        assert "pi_name" in fields
        assert "pi_name_2" in fields

    def test_contains_conditional_source_fields(self, fields):
        # Fields referenced inside conditional expressions
        assert "ko_meeting" in fields
        assert "ko_occured" in fields
        assert "kick_off_scheduled" in fields
        assert "kick_off" in fields
        assert "info_share_question" in fields
        assert "funding" in fields

    def test_contains_funding_fields(self, fields):
        assert "funding_source" in fields
        assert "funding_source_2" in fields
        assert "funding_source_3" in fields
        assert "funding_mechanism" in fields

    def test_contains_discussed_fields(self, fields):
        # Verify discussed6boolean (not discussed6)
        assert "discussed6boolean" in fields
        assert "discussed6" not in fields

    def test_excludes_na_entries(self, fields):
        assert "n/a" not in fields
        assert "" not in fields
