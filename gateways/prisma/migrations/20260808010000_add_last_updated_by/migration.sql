-- Add lastUpdatedBy column to AdminTicketType (stores the name of the user who last updated the ticket type)
ALTER TABLE "admin_ticket_type" ADD COLUMN IF NOT EXISTS "lastUpdatedBy" TEXT DEFAULT '';

-- Add lastUpdatedAt column to AdminTicketType (stores the timestamp of the last update)
ALTER TABLE "admin_ticket_type" ADD COLUMN IF NOT EXISTS "lastUpdatedAt" TIMESTAMP DEFAULT now();
