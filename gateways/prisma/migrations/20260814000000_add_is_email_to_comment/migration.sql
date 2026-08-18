-- Add isEmail column to AdminTicketComment (marks email-sent entries)
ALTER TABLE "admin_ticket_comment" ADD COLUMN IF NOT EXISTS "isEmail" BOOLEAN NOT NULL DEFAULT false;