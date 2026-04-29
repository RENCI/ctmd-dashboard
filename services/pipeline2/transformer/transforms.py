"""
Direct field mapping from REDCap record dicts to per-table row dicts.

No dynamic expression parsing. Each table has an explicit transform function
mapping REDCap field names to CTMD database column names, derived from
mapping.json.

Covers the 18 pure REDCap-sourced tables (all columns come from REDCap).
Mixed tables (some columns from CSV uploads) are managed by the CSV upload
API and are not written during the automated sync.

Pure REDCap tables:
    Proposal, Submitter, ProposalDetails, ProposalFunding, AssignProposal,
    InitialConsultationSummary, ProtocolTimelines_estimated, BudgetBreakOut,
    RecommendationsForPI, FinalRecommendation, CTSA, StudyPI,
    Proposal_ConsultOptions, Proposal_NewServiceSelection,
    Proposal_ServicesApproved, Proposal_ServicesPatOutcome,
    Proposal_ServicesPostOutcome, Proposal_RemovedServices
"""

import hashlib
from nameparser import HumanName


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _coalesce(record: dict, *fields: str):
    """Return the first non-None, non-empty-string value from the given fields."""
    for f in fields:
        val = record.get(f)
        if val is not None and val != "":
            return val
    return None


def _to_bool(val):
    """
    Convert a REDCap field value to a Python bool for boolean DB columns.
    REDCap boolean fields use "1" (True) and "0" (False). Any other value
    (including "2" for radio buttons, "", or None) maps to NULL.
    """
    if val == "1":
        return True
    if val == "0":
        return False
    return None


def _to_int(val):
    """
    Convert a REDCap field value to an integer for bigint/integer DB columns.
    Non-numeric values (e.g. "3-4" ranges, free text) map to NULL.
    """
    if val is None or val == "":
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _parse_name(record: dict, *fields: str) -> tuple:
    """
    Parse a PI name from the first non-empty field using nameparser.
    Returns (first_name, last_name).
    Falls back to (None, raw_value) if parsing fails.
    """
    raw = _coalesce(record, *fields)
    if not raw:
        return None, None
    try:
        name = HumanName(raw)
        return name.first or None, name.last or None
    except Exception:
        return None, raw


def _generate_id(record: dict, *fields: str) -> int:
    """
    Deterministic integer ID derived from a combination of field values.
    Same field values always produce the same ID. Used for userId columns
    where no natural key exists (e.g. PI name combination).
    """
    key = "|".join(str(record.get(f) or "") for f in fields)
    return int(hashlib.md5(key.encode()).hexdigest()[:8], 16)


def _checkbox_rows(record: dict, proposal_id, base_field: str, col_name: str) -> list:
    """
    REDCap exports checkbox fields as base_field___N where N is the option code
    and the value is "1" (checked) or "0" (unchecked).
    Returns one row dict per checked option, storing the full REDCap field name
    (e.g. "consult_options___2") to match the legacy pipeline's output format.
    """
    rows = []
    prefix = f"{base_field}___"
    for key, val in record.items():
        if key.startswith(prefix) and str(val) == "1":
            rows.append({"ProposalID": proposal_id, col_name: key})
    return rows


# ---------------------------------------------------------------------------
# Per-table transform functions
# Each returns a dict (single row) or list[dict] (junction/checkbox tables).
# Returns None (single-row) or [] (junction) if ProposalID is missing.
# ---------------------------------------------------------------------------

def _transform_proposal(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "dateSubmitted": record.get("prop_submit"),
        "proposalStatus": record.get("protocol_status"),
        "HEALnetwork": _to_bool(record.get("heal_study")),
        "covidStudy": _to_bool(record.get("covid")),
        # coalesce: info_share_question first, else evaluate conditional on funding
        "ShareThisInfo": _to_bool(
            _coalesce(record, "info_share_question") or (
                "1" if record.get("funding") == "1" else "0"
            )
        ),
        "FullTitle": record.get("proposal_title2"),
        "ShortTitle": record.get("short_name"),
        "PhaseOfStudy": record.get("study_vumc_ric1ase"),
        "ShortDescription": record.get("study_description"),
        "ProtocolDesign": record.get("study_design_initial"),
        "Objectives": record.get("objectives"),
        "Endpoints": record.get("prop_summary_describe2_42d"),
        "StudyPopulation": record.get("study_population"),
        "MainEntryCriteria": record.get("prop_summary_describe2_054"),
        "PlannedSitesEnrollingParticipants": record.get("prop_summary_describe2_110"),
        "DescriptionOfStudyIntervention": record.get("prop_summary_describe2_5f5"),
        "StudyDuration": record.get("study_duration_comments2"),
        "ParticipantDuration": record.get("prop_summary_describe2_35c"),
        "DisclosureConflicts": record.get("prop_summary_describe2_b32"),
        "optStatisticalPlan": record.get("prop_summary_describe2_b45"),
        "optEnrollmentPlan": record.get("prop_summary_describe2_a3f"),
    }


def _transform_submitter(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "userId": str(_generate_id(record, "pi_firstname", "pi_lastname")),
        "ProposalID": pid,
        "submitterFirstName": record.get("pi_firstname"),
        "submitterLastName": record.get("pi_lastname"),
        "submitterFacultyStatus": record.get("staff_status"),
        "submitterEmail": record.get("submitters_contact_email"),
        "submitterPhone": record.get("phone_number"),
        "submitterInstitution": record.get("org_name"),
        "submitterInstitutionOther": record.get("other_organization"),
    }


def _transform_proposal_details(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "therapeuticArea": record.get("theraputic_area"),
        "rareDisease": _to_bool(record.get("rare_disease")),
        "numberSubjects": _to_int(record.get("number_subjects")),
        "numberSites": _to_int(record.get("number_sites")),
        "numberNonUSsites": _to_int(record.get("non_us_sites")),
        "listCountries": record.get("city_list"),
        "numberCTSAprogHubSites": _to_int(record.get("number_csta_sites")),
        "notableRisk": None,
    }


def _transform_proposal_funding(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "newFundingSource": record.get("new_funding_source"),
        "submittedToNIH": _to_bool(record.get("nih_funding")),
        "currentFunding": record.get("funding"),
        "newFundingStatus": _coalesce(
            record, "updated_funding_status", "new_funding_source", "funding"
        ),
        "numberFundingSource": _to_int(record.get("sources_1")),
        "fundingSource": _coalesce(
            record, "funding_source", "funding_source_2", "funding_source_3"
        ),
        "fundingSourceOther": _coalesce(
            record, "other_funding", "other_funding_2", "other_funding_3"
        ),
        "fundingSource2": record.get("funding_source_4"),
        "fundingSourceOther2": record.get("other_funding_4"),
        "fundingSource3": record.get("funding_source_5"),
        "fundingSourceOther3": record.get("other_funding_5"),
        "fundingMechanism": record.get("funding_mechanism"),
        "fundingMechanismOther": record.get("funding_other"),
        "fundingMechanism2": record.get("funding_mechanism_2"),
        "fundingMechanismOther2": record.get("funding_other_2"),
        "fundingMechanism3": record.get("funding_mechanism_3"),
        "fundingMechanismOther3": record.get("funding_other_3"),
        "instituteCenter": record.get("institute_center"),
        "instituteCenter2": record.get("institute_center_2"),
        "instituteCenter3": record.get("institute_center_3"),
        "grantApplicationNumber": record.get("grant_app_no"),
        "FOAnumber": record.get("funding_opp_announcement"),
        "planningGrant": record.get("protocol_status") == "119",
        "largerThan500K": _to_bool(record.get("more_than_500000")),
        "amountAward": record.get("amount_award"),
        "totalBudget": record.get("anticipated_budget"),
        "totalBudgetInt": record.get("anticipated_budget_int"),
        "fundingPeriod": _coalesce(record, "funding_duration", "fund_duration"),
        "fundingStart": record.get("release_of_funds_2"),
        "applicationToInstituteBusinessOfficeDate": record.get("bo_submission"),
        "discussWithPO": _to_bool(record.get("funding_nih")),
        "POsName": record.get("po_name"),
        "NewOrExistingNetwork": _to_bool(record.get("partnership")),
        "peerReviewDone": record.get("scientific_review"),
        "fundingSourceConfirmation": record.get("cfs_2"),
    }


def _transform_assign_proposal(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "assignToInstitution": _coalesce(
            record, "tic_ric_assign_v2", "tic_ric_assign"
        ),
        "ticPOC": _coalesce(record, "tic_poc_v2_2", "tic_poc_2"),
        "ricPOC": _coalesce(record, "ric_poc_v2_2", "ric_poc_2"),
        "ncatsPOC": _coalesce(
            record, "ncats_poc_2", "ncats_poc_3", "ncats_poc_v2_2", "ncats_poc_v2_3"
        ),
    }


def _transform_initial_consultation_summary(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "protocolReviewed": _to_bool(record.get("revewed_in_consult")),
        "budgetReviewed": _to_bool(record.get("review")),
        "fundingReviewed": _to_bool(record.get("review")),
        "CIRBdiscussed": _to_bool(record.get("discussed1")),
        "SAdiscussed": _to_bool(record.get("discussed2")),
        "EHRdiscussed": _to_bool(record.get("discussed3")),
        "CommunityEngagementDiscuss": _to_bool(record.get("discussed4")),
        "RecruitmentPlanDiscussed": _to_bool(record.get("discussed5")),
        "recruitmentMaterialsDiscussed": _to_bool(record.get("discussed6boolean")),
        "FeasibilityAssessmentDiscussed": _to_bool(record.get("discussed7")),
        "OtherComments": record.get("other_comments"),
    }


def _transform_protocol_timelines(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "plannedFinalProtocol": record.get("protocol_final_start"),
        "plannedFirstSiteActivated": _coalesce(
            record, "pro_time_date_5", "site_active_date"
        ),
        "plannedSubmissionDate": record.get("planned_submission_date"),
        "grantSubDeadline": record.get("grant_sub_deadline"),
        "plannedGrantSubmissionDate": _coalesce(
            record,
            "grant_sub_deadline",
            "tgs_date_2",
            "actual_date",
            "tgs_date_3",
            "grant_re_submission_date",
        ),
        "actualGrantSubmissionDate": _coalesce(
            record, "actual_date", "grant_re_submission_date"
        ),
        "plannedGrantAwardDate": _coalesce(
            record, "projected_funding_date", "project_funding_date"
        ),
        "actualGrantAwardDate": record.get("release_of_funds_2"),
        "estimatedStartDateOfFunding": _coalesce(
            record, "project_funding_date", "projected_funding_date"
        ),
        "actualProtocolFinalDate": record.get("pro_time_date_4"),
        "approvalReleaseDiff": _to_int(record.get("pat_funds_diff")),
    }


def _transform_budget_breakout(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "siteBudget": record.get("project_budget1"),
        "recruitmentBudget": record.get("project_budget5"),
        "overallBudget": record.get("project_budget6"),
        "budgetNotes": record.get("notes4"),
    }


def _transform_recommendations_for_pi(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    return {
        "ProposalID": pid,
        "protocolRecommendation": record.get("summary_of_recomendatio"),
        "budgetRecommendation": _to_bool(record.get("tic_budget_changes")),
        "fundingAssessment": record.get("fund_assessmemt"),
        "CIRBrecommendation": record.get("recommendations1"),
        "SArecommendation": record.get("recommendations2"),
    }


def _transform_final_recommendation(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    recommendation = record.get("recommendations")
    service_recommended = record.get("service_recommended")
    # Match old pipeline: skip row if all meaningful fields are empty
    if not recommendation and not service_recommended:
        return None
    return {
        "ProposalID": pid,
        "recommendation": recommendation,
        "serviceRecommended": service_recommended,
    }


def _transform_ctsa(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    first, last = _parse_name(record, "pi_name", "pi_name_2")
    return {
        "ProposalID": pid,
        "CTSAhubPIFirstName": first,
        "CTSAhubPILastName": last,
        "approvalfromCTSA": _to_bool(record.get("review_discuss")),
    }


def _transform_study_pi(record: dict):
    pid = record.get("proposal_id")
    if not pid:
        return None
    are_you_pi = _to_bool(record.get("pi"))
    user_id = _generate_id(record, "pi_firstname", "pi_lastname") if (
        record.get("pi_firstname") or record.get("pi_lastname")
    ) else None
    # Match old pipeline: skip row if all meaningful fields are empty
    if are_you_pi is None and user_id is None:
        return None
    return {
        "AreYouStudyPI": are_you_pi,
        "userId": user_id,
    }


# ---------------------------------------------------------------------------
# Junction / checkbox tables — return list[dict]
# ---------------------------------------------------------------------------

def _transform_proposal_consult_options(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "consult_options", "consultOptions")


def _transform_proposal_new_service_selection(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "new_service_selection", "serviceSelection")


def _transform_proposal_services_approved(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "services_approved", "servicesApproved")


def _transform_proposal_services_pat_outcome(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "app_services_pat_outcome", "servicesPatOutcome")


def _transform_proposal_services_post_outcome(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "add_service_post_outcome", "servicesPostOutcome")


def _transform_proposal_removed_services(record: dict) -> list:
    pid = record.get("proposal_id")
    if not pid:
        return []
    return _checkbox_rows(record, pid, "removed_services", "removedServices")


# ---------------------------------------------------------------------------
# Top-level entry point
# ---------------------------------------------------------------------------

# Maps each table name to its transform function.
# Single-row functions return dict | None.
# Junction functions return list[dict].
_SINGLE_ROW_TABLES = {
    "Proposal": _transform_proposal,
    "Submitter": _transform_submitter,
    "ProposalDetails": _transform_proposal_details,
    "ProposalFunding": _transform_proposal_funding,
    "AssignProposal": _transform_assign_proposal,
    "InitialConsultationSummary": _transform_initial_consultation_summary,
    "ProtocolTimelines_estimated": _transform_protocol_timelines,
    "BudgetBreakOut": _transform_budget_breakout,
    "RecommendationsForPI": _transform_recommendations_for_pi,
    "FinalRecommendation": _transform_final_recommendation,
    "CTSA": _transform_ctsa,
    "StudyPI": _transform_study_pi,
}

_JUNCTION_TABLES = {
    "Proposal_ConsultOptions": _transform_proposal_consult_options,
    "Proposal_NewServiceSelection": _transform_proposal_new_service_selection,
    "Proposal_ServicesApproved": _transform_proposal_services_approved,
    "Proposal_ServicesPatOutcome": _transform_proposal_services_pat_outcome,
    "Proposal_ServicesPostOutcome": _transform_proposal_services_post_outcome,
    "Proposal_RemovedServices": _transform_proposal_removed_services,
}


def transform_all(records: list) -> dict:
    """
    Transform a list of REDCap record dicts into a dict of table_name → list[row_dict].

    Args:
        records: Raw record dicts from the REDCap API downloader.

    Returns:
        Dict mapping each table name to its list of row dicts, ready for bulk loading.
        All 18 pure REDCap-sourced tables are included (empty list if no rows produced).
    """
    result = {table: [] for table in list(_SINGLE_ROW_TABLES) + list(_JUNCTION_TABLES)}

    for record in records:
        for table, fn in _SINGLE_ROW_TABLES.items():
            row = fn(record)
            if row is not None:
                result[table].append(row)

        for table, fn in _JUNCTION_TABLES.items():
            result[table].extend(fn(record))

    return result
