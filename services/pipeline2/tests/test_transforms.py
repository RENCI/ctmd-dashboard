"""Tests for transformer/transforms.py."""

import hashlib
import pytest
from transformer.transforms import (
    _coalesce,
    _parse_name,
    _generate_id,
    _checkbox_rows,
    transform_all,
)


# ---------------------------------------------------------------------------
# Minimal synthetic record that covers all REDCap fields used in transforms
# ---------------------------------------------------------------------------

FULL_RECORD = {
    "proposal_id": "42",
    "prop_submit": "2024-01-15",
    "protocol_status": "100",
    "heal_study": "1",
    "covid": "0",
    "info_share_question": "1",
    "funding": "0",
    "proposal_title2": "A Study of Things",
    "short_name": "StudyThings",
    "study_vumc_ric1ase": "Phase II",
    "study_description": "Short description",
    "study_design_initial": "RCT",
    "objectives": "Primary objective",
    "prop_summary_describe2_42d": "Endpoint text",
    "study_population": "Adults",
    "prop_summary_describe2_054": "Inclusion criteria",
    "prop_summary_describe2_110": "10 sites",
    "prop_summary_describe2_5f5": "Intervention desc",
    "study_duration_comments2": "24 months",
    "prop_summary_describe2_35c": "6 months",
    "prop_summary_describe2_b32": "No conflicts",
    "prop_summary_describe2_b45": "Statistical plan",
    "prop_summary_describe2_a3f": "Enrollment plan",
    "pi_firstname": "Jane",
    "pi_lastname": "Smith",
    "pi_name": "Jane Smith",
    "pi_name_2": "",
    "staff_status": "1",
    "submitters_contact_email": "jane@example.com",
    "phone_number": "555-1234",
    "org_name": "Duke University",
    "other_organization": "",
    "theraputic_area": "Oncology",
    "rare_disease": "0",
    "number_subjects": "200",
    "number_sites": "10",
    "non_us_sites": "2",
    "city_list": "Paris, London",
    "number_csta_sites": "5",
    "new_funding_source": "NIH",
    "nih_funding": "1",
    "updated_funding_status": "Active",
    "sources_1": "1",
    "funding_source": "Federal",
    "funding_source_2": "",
    "funding_source_3": "",
    "other_funding": "",
    "other_funding_2": "",
    "other_funding_3": "",
    "funding_source_4": "",
    "other_funding_4": "",
    "funding_source_5": "",
    "other_funding_5": "",
    "funding_mechanism": "R01",
    "funding_other": "",
    "funding_mechanism_2": "",
    "funding_other_2": "",
    "funding_mechanism_3": "",
    "funding_other_3": "",
    "institute_center": "NCI",
    "institute_center_2": "",
    "institute_center_3": "",
    "grant_app_no": "1R01CA123456",
    "funding_opp_announcement": "PA-20-001",
    "more_than_500000": "0",
    "amount_award": "500000",
    "anticipated_budget": "500000",
    "anticipated_budget_int": "500000",
    "funding_duration": "4 years",
    "fund_duration": "",
    "release_of_funds_2": "2024-06-01",
    "bo_submission": "2024-05-01",
    "funding_nih": "1",
    "po_name": "Dr. Jones",
    "partnership": "0",
    "scientific_review": "Peer reviewed",
    "cfs_2": "Confirmed",
    "tic_ric_assign_v2": "CTSA Hub",
    "tic_ric_assign": "",
    "tic_poc_v2_2": "Dr. TIC",
    "tic_poc_2": "",
    "ric_poc_v2_2": "Dr. RIC",
    "ric_poc_2": "",
    "ncats_poc_2": "Dr. NCATS",
    "ncats_poc_3": "",
    "ncats_poc_v2_2": "",
    "ncats_poc_v2_3": "",
    "revewed_in_consult": "1",
    "review": "1",
    "discussed1": "1",
    "discussed2": "0",
    "discussed3": "1",
    "discussed4": "0",
    "discussed5": "1",
    "discussed6boolean": "1",
    "discussed7": "0",
    "other_comments": "No comments",
    "protocol_final_start": "2024-03-01",
    "pro_time_date_5": "2024-04-01",
    "site_active_date": "",
    "planned_submission_date": "2024-02-01",
    "grant_sub_deadline": "2024-02-15",
    "tgs_date_2": "",
    "actual_date": "2024-03-10",
    "tgs_date_3": "",
    "grant_re_submission_date": "",
    "projected_funding_date": "2024-07-01",
    "project_funding_date": "",
    "pro_time_date_4": "2024-03-05",
    "pat_funds_diff": "30",
    "project_budget1": "100000",
    "project_budget5": "50000",
    "project_budget6": "500000",
    "notes4": "Budget notes",
    "summary_of_recomendatio": "Proceed",
    "tic_budget_changes": "1",
    "fund_assessmemt": "Feasible",
    "recommendations1": "Approve",
    "recommendations2": "Approve SA",
    "recommendations": "Approve",
    "service_recommended": "Full service",
    "review_discuss": "1",
    "pi": "1",
    "issues": "None",
    "header_8b": "Feasible",
    "header_8d": "Yes",
    "header_8e": "Yes",
    "header_8f": "Yes",
    "consult_options___1": "1",
    "consult_options___2": "0",
    "consult_options___3": "1",
    "new_service_selection___1": "1",
    "new_service_selection___2": "1",
    "new_service_selection___3": "0",
    "services_approved___1": "1",
    "services_approved___2": "0",
    "app_services_pat_outcome___1": "1",
    "add_service_post_outcome___1": "1",
    "removed_services___1": "0",
    "removed_services___2": "1",
    "redcap_repeat_instrument": "",
    "redcap_repeat_instance": None,
}


# ---------------------------------------------------------------------------
# Helper unit tests
# ---------------------------------------------------------------------------

class TestCoalesce:
    def test_returns_first_nonempty(self):
        rec = {"a": "", "b": None, "c": "found", "d": "also"}
        assert _coalesce(rec, "a", "b", "c", "d") == "found"

    def test_all_empty_returns_none(self):
        rec = {"a": "", "b": None}
        assert _coalesce(rec, "a", "b") is None

    def test_first_field_wins(self):
        rec = {"a": "first", "b": "second"}
        assert _coalesce(rec, "a", "b") == "first"

    def test_missing_key_treated_as_none(self):
        assert _coalesce({}, "x") is None


class TestParseName:
    def test_first_last(self):
        rec = {"pi_name": "John Doe", "pi_name_2": ""}
        first, last = _parse_name(rec, "pi_name", "pi_name_2")
        assert first == "John"
        assert last == "Doe"

    def test_falls_back_to_second_field(self):
        rec = {"pi_name": "", "pi_name_2": "Alice Brown"}
        first, last = _parse_name(rec, "pi_name", "pi_name_2")
        assert first == "Alice"
        assert last == "Brown"

    def test_empty_fields_returns_none_none(self):
        rec = {"pi_name": "", "pi_name_2": ""}
        assert _parse_name(rec, "pi_name", "pi_name_2") == (None, None)

    def test_dr_prefix_stripped(self):
        rec = {"pi_name": "Dr. Jane Smith"}
        first, last = _parse_name(rec, "pi_name")
        assert first == "Jane"
        assert last == "Smith"


class TestGenerateId:
    def test_deterministic(self):
        rec = {"pi_firstname": "Jane", "pi_lastname": "Smith"}
        assert _generate_id(rec, "pi_firstname", "pi_lastname") == \
               _generate_id(rec, "pi_firstname", "pi_lastname")

    def test_different_values_different_ids(self):
        rec1 = {"pi_firstname": "Jane", "pi_lastname": "Smith"}
        rec2 = {"pi_firstname": "John", "pi_lastname": "Doe"}
        assert _generate_id(rec1, "pi_firstname", "pi_lastname") != \
               _generate_id(rec2, "pi_firstname", "pi_lastname")

    def test_returns_int(self):
        rec = {"pi_firstname": "Jane", "pi_lastname": "Smith"}
        assert isinstance(_generate_id(rec, "pi_firstname", "pi_lastname"), int)

    def test_empty_fields_still_deterministic(self):
        rec = {"pi_firstname": "", "pi_lastname": ""}
        id1 = _generate_id(rec, "pi_firstname", "pi_lastname")
        id2 = _generate_id(rec, "pi_firstname", "pi_lastname")
        assert id1 == id2


class TestCheckboxRows:
    def test_checked_options_produce_rows(self):
        rec = {"field___1": "1", "field___2": "0", "field___3": "1"}
        rows = _checkbox_rows(rec, "pid42", "field", "myCol")
        assert len(rows) == 2
        assert {"ProposalID": "pid42", "myCol": "1"} in rows
        assert {"ProposalID": "pid42", "myCol": "3"} in rows

    def test_no_checked_returns_empty(self):
        rec = {"field___1": "0", "field___2": "0"}
        assert _checkbox_rows(rec, "pid", "field", "col") == []

    def test_unrelated_keys_ignored(self):
        rec = {"other___1": "1", "field___1": "1"}
        rows = _checkbox_rows(rec, "pid", "field", "col")
        assert len(rows) == 1


# ---------------------------------------------------------------------------
# transform_all integration tests
# ---------------------------------------------------------------------------

class TestTransformAll:
    @pytest.fixture(scope="class")
    def result(self):
        return transform_all([FULL_RECORD])

    def test_returns_all_18_tables(self, result):
        expected = {
            "Proposal", "Submitter", "ProposalDetails", "ProposalFunding",
            "AssignProposal", "InitialConsultationSummary",
            "ProtocolTimelines_estimated", "BudgetBreakOut",
            "RecommendationsForPI", "FinalRecommendation", "CTSA", "StudyPI",
            "Proposal_ConsultOptions", "Proposal_NewServiceSelection",
            "Proposal_ServicesApproved", "Proposal_ServicesPatOutcome",
            "Proposal_ServicesPostOutcome", "Proposal_RemovedServices",
        }
        assert set(result.keys()) == expected

    def test_proposal_row(self, result):
        row = result["Proposal"][0]
        assert row["ProposalID"] == "42"
        assert row["FullTitle"] == "A Study of Things"
        assert row["proposalStatus"] == "100"

    def test_share_this_info_from_direct_field(self, result):
        # info_share_question = "1" should win over the conditional
        assert result["Proposal"][0]["ShareThisInfo"] == "1"

    def test_share_this_info_fallback_to_conditional(self):
        rec = {**FULL_RECORD, "info_share_question": "", "funding": "1"}
        row = transform_all([rec])["Proposal"][0]
        assert row["ShareThisInfo"] == "1"

    def test_share_this_info_conditional_false(self):
        rec = {**FULL_RECORD, "info_share_question": "", "funding": "0"}
        row = transform_all([rec])["Proposal"][0]
        assert row["ShareThisInfo"] == "0"

    def test_planning_grant_conditional(self):
        rec = {**FULL_RECORD, "protocol_status": "119"}
        row = transform_all([rec])["ProposalFunding"][0]
        assert row["planningGrant"] == "1"

    def test_planning_grant_conditional_false(self, result):
        row = result["ProposalFunding"][0]
        assert row["planningGrant"] == "0"

    def test_coalesce_assign_institution(self, result):
        row = result["AssignProposal"][0]
        assert row["assignToInstitution"] == "CTSA Hub"

    def test_coalesce_falls_back(self):
        rec = {**FULL_RECORD, "tic_ric_assign_v2": "", "tic_ric_assign": "Fallback"}
        row = transform_all([rec])["AssignProposal"][0]
        assert row["assignToInstitution"] == "Fallback"

    def test_name_parsing_ctsa(self, result):
        row = result["CTSA"][0]
        assert row["CTSAhubPIFirstName"] == "Jane"
        assert row["CTSAhubPILastName"] == "Smith"

    def test_generate_id_submitter(self, result):
        row = result["Submitter"][0]
        assert isinstance(row["userId"], str)
        assert len(row["userId"]) > 0

    def test_generate_id_study_pi(self, result):
        row = result["StudyPI"][0]
        assert isinstance(row["userId"], int)

    def test_generate_id_consistent_across_tables(self, result):
        # Submitter userId (str) and StudyPI userId (int) derived from same fields
        submitter_id = int(result["Submitter"][0]["userId"])
        study_pi_id = result["StudyPI"][0]["userId"]
        assert submitter_id == study_pi_id

    def test_checkbox_consult_options(self, result):
        rows = result["Proposal_ConsultOptions"]
        options = {r["consultOptions"] for r in rows}
        assert "1" in options
        assert "3" in options
        assert "2" not in options  # was "0"

    def test_checkbox_new_service_selection(self, result):
        rows = result["Proposal_NewServiceSelection"]
        assert len(rows) == 2

    def test_checkbox_removed_services(self, result):
        rows = result["Proposal_RemovedServices"]
        options = {r["removedServices"] for r in rows}
        assert "2" in options
        assert "1" not in options  # was "0"

    def test_missing_proposal_id_skipped(self):
        rec = {**FULL_RECORD, "proposal_id": ""}
        result = transform_all([rec])
        assert result["Proposal"] == []
        assert result["Proposal_NewServiceSelection"] == []

    def test_empty_records_list(self):
        result = transform_all([])
        for rows in result.values():
            assert rows == []

    def test_funding_period_coalesce(self, result):
        row = result["ProposalFunding"][0]
        assert row["fundingPeriod"] == "4 years"

    def test_funding_period_fallback(self):
        rec = {**FULL_RECORD, "funding_duration": "", "fund_duration": "3 years"}
        row = transform_all([rec])["ProposalFunding"][0]
        assert row["fundingPeriod"] == "3 years"

    def test_protocol_timelines_coalesce(self, result):
        row = result["ProtocolTimelines_estimated"][0]
        assert row["plannedFirstSiteActivated"] == "2024-04-01"
        assert row["actualGrantSubmissionDate"] == "2024-03-10"
