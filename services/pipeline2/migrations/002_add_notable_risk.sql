-- Adds notableRisk column to ProposalDetails if it does not already exist.
-- This is a no-op if the column was already created by 001_initial_schema.sql
-- (i.e. on a fresh database). Safe to run against the existing prod schema.
ALTER TABLE "ProposalDetails"
    ADD COLUMN IF NOT EXISTS "notableRisk" VARCHAR;
