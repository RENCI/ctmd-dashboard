"""Regression guard: every REDCap-mapped table must be loaded by the sync.

Catches the bug class where a table is defined in mapping.json with a REDCap
source but omitted from loader.REDCAP_TABLES, so the sync computes it and then
silently drops it at load time — leaving it empty. That's what left PATMeeting
and InitialConsultationDates empty and the Timeline Metrics showing NaN
(CTMD-195).
"""
import json
import os

from loader.loader import REDCAP_TABLES

# Resolves to repo-root data/mapping.json locally and to the mounted
# /data/mapping.json in the test image (same trick as test_mapping.py).
MAPPING_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "data", "mapping.json"
)

# Tables mapped in mapping.json but intentionally absent from REDCAP_TABLES.
# Managed by manual CSV upload (data entered via upload, not REDCap):
CSV_ONLY_TABLES = {
    "Sites",
    "CTSAs",
    "StudySites",
    "StudyProfile",
    "EnrollmentInformation",
    "EnrollmentDemographics",
}
# Mapped but not queried by any API controller — i.e. unused by the dashboard, so
# leaving them unloaded is harmless (audited 2026-09 via grep of
# services/api/controllers). If one of these ever gets wired into an endpoint,
# it must move into REDCAP_TABLES (and out of here).
UNUSED_TABLES = {
    "ConsultationRequest",
    "LettersAndSurvey",
    "ServicesAdditionalInfo",
    "SuggestedChanges",
    "TIC_RICAssessment",
    "TINuser",
    "User",
    "Voter",
}
ALLOWED_UNLOADED = CSV_ONLY_TABLES | UNUSED_TABLES


def _redcap_sourced_tables():
    """Tables in mapping.json with a REDCap source on a non-key field."""
    with open(MAPPING_PATH) as f:
        data = json.load(f)
    rows = data if isinstance(data, list) else data.get("fields", data.get("mapping", []))
    tables = set()
    for r in rows:
        table = (r.get("Table_CTMD") or "").strip()
        field = (r.get("Fieldname_CTMD") or "").strip()
        src = (r.get("Fieldname_redcap") or "").strip()
        if not table or field == "ProposalID":
            continue
        if src and src.lower() != "n/a":
            tables.add(table)
    return tables


def test_all_redcap_mapped_tables_are_loaded():
    sourced = _redcap_sourced_tables()
    missing = sorted(t for t in sourced if t not in REDCAP_TABLES and t not in ALLOWED_UNLOADED)
    assert not missing, (
        "Tables mapped from REDCap but absent from loader.REDCAP_TABLES — they "
        f"will silently stay empty after a sync: {missing}"
    )
