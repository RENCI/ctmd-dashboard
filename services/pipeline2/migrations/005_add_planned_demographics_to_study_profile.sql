-- CTMD-198: Planned (target) enrollment demographics move onto StudyProfile
-- (per study), entered via the "Upload Study Profile" flow — replacing the
-- planned* half of the standalone EnrollmentDemographics table (retired in a
-- later ticket). Same NIH cross as before: ethnicity x sex (4) + race x sex (10)
-- = 14 planned cells. StudyProfile is CSV-managed (not in loader.REDCAP_TABLES),
-- so the REDCap sync never touches these columns. Idempotent.
ALTER TABLE "StudyProfile"
    ADD COLUMN IF NOT EXISTS "plannedHispanicFemale"     BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedHispanicMale"       BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedNonHispanicFemale"  BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedNonHispanicMale"    BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedAIANFemale"         BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedAIANMale"           BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedAsianFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedAsianMale"          BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedNHPIFemale"         BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedNHPIMale"           BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedBlackFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedBlackMale"          BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedWhiteFemale"        BIGINT,
    ADD COLUMN IF NOT EXISTS "plannedWhiteMale"          BIGINT;
