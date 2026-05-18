-- consultationRequestID and changeID are never populated by CSV uploads.
-- The source data (ctmd-db) has all NULLs for these columns.
-- Drop the PK constraints (and resulting NOT NULL checks) so these tables
-- accept CSV uploads without IDs, matching the legacy ctmd-db schema.
ALTER TABLE "ConsultationRequest" DROP CONSTRAINT IF EXISTS "ConsultationRequest_pkey";
ALTER TABLE "ConsultationRequest" ALTER COLUMN "consultationRequestID" DROP NOT NULL;
ALTER TABLE "SuggestedChanges"    DROP CONSTRAINT IF EXISTS "SuggestedChanges_pkey";
ALTER TABLE "SuggestedChanges"    ALTER COLUMN "changeID" DROP NOT NULL;
