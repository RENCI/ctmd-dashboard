"""Tests for the PATMeeting and InitialConsultationDates transform builders
(CTMD-195). These tables feed the Timeline Metrics; they were previously never
built by the transformer, so the intervals showed NaN.
"""
from transformer.transforms import (
    _transform_pat_meeting,
    _transform_initial_consultation_dates,
)


class TestPatMeeting:
    def test_meeting_date_prefers_meeting_date_2(self):
        row = _transform_pat_meeting({"proposal_id": "42", "meeting_date_2": "2024-03-01", "meeting_date": "2024-01-01"})
        assert row["meetingDate"] == "2024-03-01"

    def test_meeting_date_falls_back_to_meeting_date(self):
        row = _transform_pat_meeting({"proposal_id": "42", "meeting_date_2": "", "meeting_date": "2024-01-01"})
        assert row["meetingDate"] == "2024-01-01"

    def test_comments_coalesce(self):
        row = _transform_pat_meeting({"proposal_id": "42", "vote_comments": "", "vote_comments_2": "ok"})
        assert row["comments"] == "ok"

    def test_no_proposal_id_skips_row(self):
        assert _transform_pat_meeting({"meeting_date": "2024-01-01"}) is None

    def test_columns_match_schema(self):
        row = _transform_pat_meeting({"proposal_id": "42"})
        assert set(row) == {"ProposalID", "meetingDate", "meetingNumber", "comments"}


class TestInitialConsultationDates:
    def test_first_contact_from_intro_call(self):
        row = _transform_initial_consultation_dates({"proposal_id": "42", "intro_call": "2024-02-02"})
        assert row["FirstContact"] == "2024-02-02"

    def test_kickoff_occurs_gated_on_flag(self):
        yes = _transform_initial_consultation_dates({"proposal_id": "42", "ko_occured": "1", "kick_off": "2024-04-04"})
        no = _transform_initial_consultation_dates({"proposal_id": "42", "ko_occured": "0", "kick_off": "2024-04-04"})
        assert yes["kickOffDateOccurs"] == "2024-04-04"
        # NULL (not "N/A") when the flag isn't set — else new Date("N/A") = NaN downstream.
        assert no["kickOffDateOccurs"] is None

    def test_kickoff_scheduled_gated_on_flag(self):
        yes = _transform_initial_consultation_dates({"proposal_id": "42", "ko_meeting": "1", "kick_off_scheduled": "2024-03-03"})
        no = _transform_initial_consultation_dates({"proposal_id": "42", "ko_meeting": "0", "kick_off_scheduled": "2024-03-03"})
        assert yes["kickOffScheduled"] == "2024-03-03"
        assert no["kickOffScheduled"] is None

    def test_no_proposal_id_skips_row(self):
        assert _transform_initial_consultation_dates({"intro_call": "2024-01-01"}) is None

    def test_columns_match_schema(self):
        row = _transform_initial_consultation_dates({"proposal_id": "42"})
        assert set(row) == {
            "ProposalID", "FirstContact", "kickOffNeeded", "kickOffScheduled",
            "kickOffDateOccurs", "workComplete", "reportSentToPI",
        }
