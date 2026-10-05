-- CTMD-202: Retire the standalone EnrollmentDemographics table. Planned cells now
-- live on StudyProfile (migration 005) and actual cells on StudySites (migration
-- 006); the per-study demographics API reads from those (CTMD-200). The standalone
-- Patient Demographics upload card and its template are removed in the same ticket.
--
-- Prod data was already cleared (the single REACT-AF seed row was deleted
-- 2026-10-02), so there is nothing to migrate. Idempotent.
DROP TABLE IF EXISTS "EnrollmentDemographics";
