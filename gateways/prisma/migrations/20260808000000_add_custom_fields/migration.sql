-- Add customFields column to AdminTicketType (stores JSON array of ICustomField)
ALTER TABLE "admin_ticket_type" ADD COLUMN IF NOT EXISTS "customFields" TEXT DEFAULT '[]';

-- Add customFieldValues column to AdminTicket (stores JSON map of fieldKey -> value)
ALTER TABLE "AdminTicket" ADD COLUMN IF NOT EXISTS "customFieldValues" TEXT DEFAULT '[]';
