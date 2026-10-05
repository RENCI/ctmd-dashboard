-- CTMD-199: Actual (cumulative enrolled) enrollment demographics move onto
-- StudySites (PER SITE), entered via the "Upload Study Sites" flow — replacing
-- the actual* half of the standalone EnrollmentDemographics table. Study-level
-- Actual is the SUM across the study's sites (see the demographics API, CTMD-200).
--
-- The generic upload endpoint (_update_column in server.py) already upserts
-- StudySites by the (ProposalID, siteId) PAIR when both columns are present — the
-- Study Sites template carries both — so per-site cells land correctly without
-- clobbering a site's rows in other studies. 14 actual cells. StudySites is
-- CSV-managed (not in loader.REDCAP_TABLES). Idempotent.
ALTER TABLE "StudySites"
    ADD COLUMN IF NOT EXISTS "actualHispanicFemale"     BIGINT,
    ADD COLUMN IF NOT EXISTS "actualHispanicMale"       BIGINT,
    ADD COLUMN IF NOT EXISTS "actualNonHispanicFemale"  BIGINT,
    ADD COLUMN IF NOT EXISTS "actualNonHispanicMale"    BIGINT,
    ADD COLUMN IF NOT EXISTS "actualAIANFemale"         BIGINT,
    ADD COLUMN IF NOT EXISTS "actualAIANMale"           BIGINT,
    ADD COLUMN IF NOT EXISTS "actualAsianFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "actualAsianMale"          BIGINT,
    ADD COLUMN IF NOT EXISTS "actualNHPIFemale"         BIGINT,
    ADD COLUMN IF NOT EXISTS "actualNHPIMale"           BIGINT,
    ADD COLUMN IF NOT EXISTS "actualBlackFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "actualBlackMale"          BIGINT,
    ADD COLUMN IF NOT EXISTS "actualWhiteFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "actualWhiteMale"          BIGINT;
