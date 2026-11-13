-- Timesheet week sheets + lines (My Timesheet page dynamic data)

CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekStart" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billableHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nonBillableHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "externalNote" TEXT,
    "internalNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TimesheetLine" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "project" TEXT,
    "task" TEXT NOT NULL,
    "externalNote" TEXT,
    "internalNote" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "monday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tuesday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wednesday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thursday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "friday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saturday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sunday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "favourited" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimesheetLine_pkey" PRIMARY KEY ("id")
);

-- One timesheet per user per week
CREATE UNIQUE INDEX "Timesheet_userId_weekStart_key" ON "Timesheet"("userId", "weekStart");

ALTER TABLE "TimesheetLine" ADD CONSTRAINT "TimesheetLine_timesheetId_fkey"
    FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "TimesheetLine_timesheetId_idx" ON "TimesheetLine"("timesheetId");
