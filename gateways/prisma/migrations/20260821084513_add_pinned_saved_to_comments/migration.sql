-- Add isPinned and isSaved columns to comment tables that exist in the DB

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_advisory_request_comment') THEN
    ALTER TABLE "admin_advisory_request_comment" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE "admin_advisory_request_comment" ADD COLUMN IF NOT EXISTS "isSaved" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_incident_comment') THEN
    ALTER TABLE "admin_incident_comment" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE "admin_incident_comment" ADD COLUMN IF NOT EXISTS "isSaved" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_service_request_comment') THEN
    ALTER TABLE "admin_service_request_comment" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE "admin_service_request_comment" ADD COLUMN IF NOT EXISTS "isSaved" BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_ticket_comment') THEN
    ALTER TABLE "admin_ticket_comment" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE "admin_ticket_comment" ADD COLUMN IF NOT EXISTS "isSaved" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
