-- Per-study enrollment demographics in the NIH "Targeted/Planned Enrollment"
-- structure. Two independent axes, each a breakdown of the SAME people:
--   * Ethnicity x Sex : {Hispanic, NonHispanic} x {Female, Male}   (4 cells)
--   * Race x Sex      : {AIAN, Asian, NHPI, Black, White} x {F, M} (10 cells)
-- Stored for BOTH planned (target) and actual (cumulative enrolled) = 28 cells.
--
-- Per NIH, the ethnicity totals and race totals must reconcile (they count the
-- same subjects two ways) — enforced at upload/UI time, not in the schema.
--
-- One row per study (ProposalID). CSV-managed only: this table is NOT in
-- loader.py REDCAP_TABLES, so the REDCap sync never touches it. Following the
-- prod convention (see migration 003), no single-column ProposalID PK — uploads
-- upsert by deleting rows for a ProposalID then re-inserting.
CREATE TABLE IF NOT EXISTS "EnrollmentDemographics" (
    "ProposalID" BIGINT,

    -- ── Planned (target) ────────────────────────────────────────────────
    -- Ethnicity x Sex
    "plannedHispanicFemale"      BIGINT,
    "plannedHispanicMale"        BIGINT,
    "plannedNonHispanicFemale"   BIGINT,
    "plannedNonHispanicMale"     BIGINT,
    -- Race x Sex
    "plannedAIANFemale"          BIGINT,
    "plannedAIANMale"            BIGINT,
    "plannedAsianFemale"         BIGINT,
    "plannedAsianMale"           BIGINT,
    "plannedNHPIFemale"          BIGINT,
    "plannedNHPIMale"            BIGINT,
    "plannedBlackFemale"         BIGINT,
    "plannedBlackMale"           BIGINT,
    "plannedWhiteFemale"         BIGINT,
    "plannedWhiteMale"           BIGINT,

    -- ── Actual (cumulative enrolled) ────────────────────────────────────
    -- Ethnicity x Sex
    "actualHispanicFemale"       BIGINT,
    "actualHispanicMale"         BIGINT,
    "actualNonHispanicFemale"    BIGINT,
    "actualNonHispanicMale"      BIGINT,
    -- Race x Sex
    "actualAIANFemale"           BIGINT,
    "actualAIANMale"             BIGINT,
    "actualAsianFemale"          BIGINT,
    "actualAsianMale"            BIGINT,
    "actualNHPIFemale"           BIGINT,
    "actualNHPIMale"             BIGINT,
    "actualBlackFemale"          BIGINT,
    "actualBlackMale"            BIGINT,
    "actualWhiteFemale"          BIGINT,
    "actualWhiteMale"            BIGINT
);
