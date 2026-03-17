-- Add missing columns to AdminIncident table

ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "client" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "additionalContacts" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "applicationCategory" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "applicationSubCategory" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "isMajor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "isReleaseManagement" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "eta" TIMESTAMP(3);
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "followers" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "internalFollowers" TEXT;
ALTER TABLE "AdminIncident" ADD COLUMN IF NOT EXISTS "draftExpiresAt" TIMESTAMP(3);

-- Relax NOT NULL constraints added in initial migration
ALTER TABLE "AdminIncident" ALTER COLUMN "shortDescription" DROP NOT NULL;
ALTER TABLE "AdminIncident" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "AdminIncident" ALTER COLUMN "impact" DROP NOT NULL;
ALTER TABLE "AdminIncident" ALTER COLUMN "urgency" DROP NOT NULL;
ALTER TABLE "AdminIncident" ALTER COLUMN "priority" DROP NOT NULL;
ALTER TABLE "AdminIncident" ALTER COLUMN "channel" DROP NOT NULL;
