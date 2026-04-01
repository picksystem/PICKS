-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "workLocation" TEXT,
    "department" TEXT,
    "reasonForAccess" TEXT,
    "employeeId" TEXT,
    "businessUnit" TEXT,
    "managerName" TEXT,
    "dateOfBirth" TEXT,
    "profilePicture" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "requestedRole" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_approval',
    "source" TEXT NOT NULL DEFAULT 'signup',
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "invitationToken" TEXT,
    "invitationExpiry" TIMESTAMP(3),
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpIsUsed" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "accessFromDate" TIMESTAMP(3),
    "accessToDate" TIMESTAMP(3),
    "firstActivationDate" TIMESTAMP(3),
    "lastDeactivationDate" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "timezone" TEXT,
    "dateFormat" TEXT,
    "timeFormat" TEXT,
    "language" TEXT,
    "consultantProfileUpdated" BOOLEAN NOT NULL DEFAULT false,
    "slaWorkingCalendar" TEXT,
    "slaExceptionGroup" TEXT,
    "application" TEXT,
    "applicationLead" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChangeLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "changeType" TEXT NOT NULL,
    "fieldName" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    "changedBy" INTEGER NOT NULL,
    "changedByName" TEXT NOT NULL,
    "reasonCode" TEXT,
    "reasonNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "application" TEXT NOT NULL,
    "consultantRole" TEXT,
    "slaWorkingCalendar" TEXT,
    "slaExceptionCalendar" TEXT,
    "leadConsultant" TEXT,
    "applicationManager" TEXT,
    "isPocLead" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantRole" (
    "id" SERIAL NOT NULL,
    "application" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultantRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutTime" TIMESTAMP(3),
    "ipAddress" TEXT,
    "device" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminDashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "AdminDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminHeader" (
    "id" SERIAL NOT NULL,
    "ticketType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "app" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AdminHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTicketType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "prefix" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "numberLength" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "AdminTicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncident" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "client" TEXT,
    "caller" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callerLocation" TEXT,
    "callerDepartment" TEXT,
    "additionalContacts" TEXT,
    "businessCategory" TEXT,
    "serviceLine" TEXT,
    "application" TEXT,
    "applicationCategory" TEXT,
    "applicationSubCategory" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "impact" TEXT,
    "urgency" TEXT,
    "priority" TEXT,
    "channel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignmentGroup" TEXT,
    "primaryResource" TEXT,
    "secondaryResources" TEXT,
    "createdBy" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "isReleaseManagement" BOOLEAN NOT NULL DEFAULT false,
    "eta" TIMESTAMP(3),
    "notes" TEXT,
    "relatedRecords" TEXT,
    "attachments" TEXT,
    "followers" TEXT,
    "internalFollowers" TEXT,
    "draftExpiresAt" TIMESTAMP(3),
    "clientPrimaryContact" TEXT,
    "billingCode" TEXT,
    "approvedEstimatesHours" DOUBLE PRECISION,
    "estimatesDetails" TEXT,
    "analysisSummary" TEXT,
    "ticketSource" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncidentComment" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isSelfNote" BOOLEAN NOT NULL DEFAULT false,
    "notifyAssigneesOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIncidentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncidentTimeEntry" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL,
    "billingCode" TEXT,
    "activityTask" TEXT,
    "externalComment" TEXT,
    "internalComment" TEXT,
    "isNonBillable" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIncidentTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncidentResolution" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "application" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "customerConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "rootCauseIdentified" BOOLEAN NOT NULL DEFAULT false,
    "rootCause" TEXT,
    "resolutionCode" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "internalNote" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIncidentResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIncidentActivity" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminIncidentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminServiceRequest" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "client" TEXT,
    "caller" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callerLocation" TEXT,
    "callerDepartment" TEXT,
    "businessCategory" TEXT,
    "serviceLine" TEXT,
    "application" TEXT,
    "applicationCategory" TEXT,
    "applicationSubCategory" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "impact" TEXT,
    "urgency" TEXT,
    "priority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignmentGroup" TEXT,
    "primaryResource" TEXT,
    "secondaryResources" TEXT,
    "createdBy" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isReleaseManagement" BOOLEAN NOT NULL DEFAULT false,
    "eta" TIMESTAMP(3),
    "notes" TEXT,
    "relatedRecords" TEXT,
    "attachments" TEXT,
    "followers" TEXT,
    "internalFollowers" TEXT,
    "draftExpiresAt" TIMESTAMP(3),
    "clientPrimaryContact" TEXT,
    "billingCode" TEXT,
    "approvedEstimatesHours" DOUBLE PRECISION,
    "estimatesDetails" TEXT,
    "analysisSummary" TEXT,
    "ticketSource" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminServiceRequestComment" (
    "id" SERIAL NOT NULL,
    "serviceRequestId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isSelfNote" BOOLEAN NOT NULL DEFAULT false,
    "notifyAssigneesOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminServiceRequestComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminServiceRequestTimeEntry" (
    "id" SERIAL NOT NULL,
    "serviceRequestId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL,
    "billingCode" TEXT,
    "activityTask" TEXT,
    "externalComment" TEXT,
    "internalComment" TEXT,
    "isNonBillable" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminServiceRequestTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminServiceRequestResolution" (
    "id" SERIAL NOT NULL,
    "serviceRequestId" INTEGER NOT NULL,
    "application" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "customerConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "rootCauseIdentified" BOOLEAN NOT NULL DEFAULT false,
    "rootCause" TEXT,
    "resolutionCode" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "internalNote" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminServiceRequestResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminServiceRequestActivity" (
    "id" SERIAL NOT NULL,
    "serviceRequestId" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminServiceRequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdvisoryRequest" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "client" TEXT,
    "caller" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callerLocation" TEXT,
    "callerDepartment" TEXT,
    "businessCategory" TEXT,
    "serviceLine" TEXT,
    "application" TEXT,
    "applicationCategory" TEXT,
    "applicationSubCategory" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "impact" TEXT,
    "urgency" TEXT,
    "priority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignmentGroup" TEXT,
    "primaryResource" TEXT,
    "secondaryResources" TEXT,
    "createdBy" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isReleaseManagement" BOOLEAN NOT NULL DEFAULT false,
    "eta" TIMESTAMP(3),
    "notes" TEXT,
    "relatedRecords" TEXT,
    "attachments" TEXT,
    "followers" TEXT,
    "internalFollowers" TEXT,
    "draftExpiresAt" TIMESTAMP(3),
    "clientPrimaryContact" TEXT,
    "billingCode" TEXT,
    "approvedEstimatesHours" DOUBLE PRECISION,
    "estimatesDetails" TEXT,
    "analysisSummary" TEXT,
    "ticketSource" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAdvisoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdvisoryRequestComment" (
    "id" SERIAL NOT NULL,
    "advisoryRequestId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isSelfNote" BOOLEAN NOT NULL DEFAULT false,
    "notifyAssigneesOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAdvisoryRequestComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdvisoryRequestTimeEntry" (
    "id" SERIAL NOT NULL,
    "advisoryRequestId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL,
    "billingCode" TEXT,
    "activityTask" TEXT,
    "externalComment" TEXT,
    "internalComment" TEXT,
    "isNonBillable" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAdvisoryRequestTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdvisoryRequestResolution" (
    "id" SERIAL NOT NULL,
    "advisoryRequestId" INTEGER NOT NULL,
    "application" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "customerConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "rootCauseIdentified" BOOLEAN NOT NULL DEFAULT false,
    "rootCause" TEXT,
    "resolutionCode" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "internalNote" TEXT,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAdvisoryRequestResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdvisoryRequestActivity" (
    "id" SERIAL NOT NULL,
    "advisoryRequestId" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAdvisoryRequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotFound" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "AdminNotFound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSignIn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "AdminSignIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminControls" (
    "id" SERIAL NOT NULL,
    "adminTwoLevel" BOOLEAN NOT NULL DEFAULT false,
    "adminManagerOnly" BOOLEAN NOT NULL DEFAULT false,
    "adminAdditionalApproval" BOOLEAN NOT NULL DEFAULT false,
    "adminApprover" TEXT,
    "signInStyle" TEXT NOT NULL DEFAULT 'new',
    "signUpStyle" TEXT NOT NULL DEFAULT 'new',
    "forgotPasswordStyle" TEXT NOT NULL DEFAULT 'new',
    "theme" TEXT NOT NULL DEFAULT 'System',
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminControls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminConfiguration" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "UserDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "UserHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotFound" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "UserNotFound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSideNav" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "UserSideNav_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantDashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "ConsultantDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantHeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "ConsultantHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantNotFound" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "ConsultantNotFound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantSideNav" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "app" TEXT NOT NULL,

    CONSTRAINT "ConsultantSideNav_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantProfile_userId_key" ON "ConsultantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminHeader_key_key" ON "AdminHeader"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AdminTicketType_type_key" ON "AdminTicketType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AdminIncident_number_key" ON "AdminIncident"("number");

-- CreateIndex
CREATE UNIQUE INDEX "AdminServiceRequest_number_key" ON "AdminServiceRequest"("number");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAdvisoryRequest_number_key" ON "AdminAdvisoryRequest"("number");

-- AddForeignKey
ALTER TABLE "AdminIncidentComment" ADD CONSTRAINT "AdminIncidentComment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "AdminIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminIncidentTimeEntry" ADD CONSTRAINT "AdminIncidentTimeEntry_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "AdminIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminIncidentResolution" ADD CONSTRAINT "AdminIncidentResolution_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "AdminIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminIncidentActivity" ADD CONSTRAINT "AdminIncidentActivity_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "AdminIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminServiceRequestComment" ADD CONSTRAINT "AdminServiceRequestComment_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "AdminServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminServiceRequestTimeEntry" ADD CONSTRAINT "AdminServiceRequestTimeEntry_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "AdminServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminServiceRequestResolution" ADD CONSTRAINT "AdminServiceRequestResolution_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "AdminServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminServiceRequestActivity" ADD CONSTRAINT "AdminServiceRequestActivity_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "AdminServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAdvisoryRequestComment" ADD CONSTRAINT "AdminAdvisoryRequestComment_advisoryRequestId_fkey" FOREIGN KEY ("advisoryRequestId") REFERENCES "AdminAdvisoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAdvisoryRequestTimeEntry" ADD CONSTRAINT "AdminAdvisoryRequestTimeEntry_advisoryRequestId_fkey" FOREIGN KEY ("advisoryRequestId") REFERENCES "AdminAdvisoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAdvisoryRequestResolution" ADD CONSTRAINT "AdminAdvisoryRequestResolution_advisoryRequestId_fkey" FOREIGN KEY ("advisoryRequestId") REFERENCES "AdminAdvisoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAdvisoryRequestActivity" ADD CONSTRAINT "AdminAdvisoryRequestActivity_advisoryRequestId_fkey" FOREIGN KEY ("advisoryRequestId") REFERENCES "AdminAdvisoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
