
-- CreateTable
CREATE TABLE "AdminTicketType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AdminTicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncident" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "caller" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callerLocation" TEXT,
    "callerDepartment" TEXT,
    "businessCategory" TEXT,
    "serviceLine" TEXT,
    "application" TEXT,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT,
    "impact" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignmentGroup" TEXT,
    "primaryResource" TEXT,
    "secondaryResources" TEXT,
    "createdBy" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "relatedRecords" TEXT,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminHeader_key_key" ON "AdminHeader"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AdminTicketType_type_key" ON "AdminTicketType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AdminIncident_number_key" ON "AdminIncident"("number");
