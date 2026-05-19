-- Add shortDescription and displayOrder columns to AdminTicketType
ALTER TABLE "AdminTicketType" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AdminTicketType" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;