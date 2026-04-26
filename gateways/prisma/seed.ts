import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = new URL(process.env.DATABASE_URL!);
if (process.env.DB_PASSWORD) dbUrl.password = encodeURIComponent(process.env.DB_PASSWORD);
const pool = new Pool({
  user: decodeURIComponent(dbUrl.username),
  password: process.env.DB_PASSWORD ?? decodeURIComponent(dbUrl.password),
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 5432,
  database: dbUrl.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
} as unknown as ConstructorParameters<typeof PrismaClient>[0]);

async function createTables() {
  console.log('Creating tables if not exist...');

  // Use raw SQL to create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "AdminDashboard" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "age" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "AdminHeader" (
      "id" SERIAL PRIMARY KEY,
      "ticketType" TEXT NOT NULL,
      "key" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "app" TEXT NOT NULL,
      "order" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "AdminTicketType" (
      "id" SERIAL PRIMARY KEY,
      "type" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "displayName" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "prefix" TEXT NOT NULL DEFAULT '',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "numberLength" INTEGER NOT NULL DEFAULT 7
    );

    CREATE TABLE IF NOT EXISTS "AdminControls" (
      "id" SERIAL PRIMARY KEY,
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminIncident" (
      "id" SERIAL PRIMARY KEY,
      "number" TEXT UNIQUE NOT NULL,
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
      "isRecurring" BOOLEAN DEFAULT false,
      "isMajor" BOOLEAN DEFAULT false,
      "notes" TEXT,
      "relatedRecords" TEXT,
      "attachments" TEXT,
      "followers" TEXT,
      "internalFollowers" TEXT,
      "draftExpiresAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminIncidentComment" (
      "id" SERIAL PRIMARY KEY,
      "incidentId" INTEGER NOT NULL REFERENCES "AdminIncident"("id") ON DELETE CASCADE,
      "subject" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "isInternal" BOOLEAN NOT NULL DEFAULT false,
      "isSelfNote" BOOLEAN NOT NULL DEFAULT false,
      "notifyAssigneesOnly" BOOLEAN NOT NULL DEFAULT false,
      "status" TEXT,
      "attachments" TEXT,
      "createdBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminIncidentTimeEntry" (
      "id" SERIAL PRIMARY KEY,
      "incidentId" INTEGER NOT NULL REFERENCES "AdminIncident"("id") ON DELETE CASCADE,
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminIncidentResolution" (
      "id" SERIAL PRIMARY KEY,
      "incidentId" INTEGER NOT NULL REFERENCES "AdminIncident"("id") ON DELETE CASCADE,
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminIncidentActivity" (
      "id" SERIAL PRIMARY KEY,
      "incidentId" INTEGER NOT NULL REFERENCES "AdminIncident"("id") ON DELETE CASCADE,
      "activityType" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "previousValue" TEXT,
      "newValue" TEXT,
      "performedBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "AdminNotFound" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "age" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "AdminSignIn" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "age" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "UserDashboard" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "app" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "UserHeader" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "app" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "UserNotFound" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "age" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "UserSideNav" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "app" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL PRIMARY KEY,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
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
      "otpIsUsed" BOOLEAN DEFAULT false,
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "UserChangeLog" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "changeType" TEXT NOT NULL,
      "fieldName" TEXT,
      "previousValue" TEXT,
      "newValue" TEXT,
      "changedBy" INTEGER NOT NULL,
      "changedByName" TEXT NOT NULL,
      "reasonCode" TEXT,
      "reasonNotes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ConsultantProfile" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER UNIQUE NOT NULL,
      "application" TEXT NOT NULL,
      "consultantRole" TEXT,
      "slaWorkingCalendar" TEXT,
      "slaExceptionCalendar" TEXT,
      "leadConsultant" TEXT,
      "applicationManager" TEXT,
      "isPocLead" BOOLEAN NOT NULL DEFAULT false,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ConsultantRole" (
      "id" SERIAL PRIMARY KEY,
      "application" TEXT NOT NULL,
      "roleName" TEXT NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "LoginLog" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "logoutTime" TIMESTAMP(3),
      "ipAddress" TEXT,
      "device" TEXT,
      "userAgent" TEXT
    );
  `);

  console.log('Tables created successfully.');
}

async function clearAndSeed() {
  console.log('Clearing existing data...');

  // Clear all data using raw SQL (delete child tables first due to FK constraints)
  await pool.query(`
    DELETE FROM "AdminIncidentActivity" WHERE true;
    DELETE FROM "AdminIncidentResolution" WHERE true;
    DELETE FROM "AdminIncidentTimeEntry" WHERE true;
    DELETE FROM "AdminIncidentComment" WHERE true;
    DELETE FROM "AdminIncident";
    DELETE FROM "AdminDashboard";
    DELETE FROM "AdminHeader";
    DELETE FROM "AdminTicketType";
    DELETE FROM "AdminNotFound";
    DELETE FROM "AdminSignIn";
    DELETE FROM "UserDashboard";
    DELETE FROM "UserHeader";
    DELETE FROM "UserNotFound";
    DELETE FROM "UserSideNav";
    DELETE FROM "LoginLog";
    DELETE FROM "UserChangeLog";
    DELETE FROM "ConsultantProfile";
    DELETE FROM "ConsultantRole";
    DELETE FROM "User";
    ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "UserChangeLog_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "ConsultantProfile_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "ConsultantRole_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "LoginLog_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminIncident_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminIncidentComment_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminIncidentTimeEntry_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminIncidentResolution_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminIncidentActivity_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminHeader_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "AdminTicketType_id_seq" RESTART WITH 1;
  `);

  console.log('Existing data cleared.');

  // Insert Admin data
  await pool.query(`
    INSERT INTO "AdminDashboard" ("id", "name", "age") VALUES ('admin-dashboard-1', 'Admin Dashboard', 1);
    INSERT INTO "AdminHeader" ("ticketType", "key", "name", "description", "isActive", "app", "order")
      VALUES ('Support Ticket', 'support-ticket', 'Support Ticket Header', 'Header for support ticket management', true, 'admin', 1);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('incident', 'Incident', 'Incident', 'Unplanned interruption or quality reduction in a service', 'INC', true, 7, 1);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('service_request', 'Service Request', 'Service Request', 'Formal request for access, installation, or provisioning of a service', 'SR', true, 7, 2);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('advisory_request', 'Advisory Request', 'Advisory Request', 'Advisory and consultation request for guidance and recommendations', 'AR', true, 7, 3);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('task', 'Task', 'Task', 'Task and work item tracking', 'T', true, 6, 4);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('change_request', 'Change Request', 'Change Request', 'Formal proposal to modify an existing system requiring review and approval', 'CR', true, 7, 5);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('problem_request', 'Problem Request', 'Problem Request', 'Identify and eliminate the root cause of recurring incidents', 'PR', true, 7, 6);
    INSERT INTO "AdminTicketType" ("type", "name", "displayName", "description", "prefix", "isActive", "numberLength", "displayOrder") VALUES ('ticket_template', 'Ticket Template', 'Ticket Template', 'Template definitions for ticket creation', 'TB', true, 5, 7);
    INSERT INTO "AdminNotFound" ("id", "name", "age") VALUES ('admin-notfound-1', 'Admin 404 Page', 1);
    INSERT INTO "AdminSignIn" ("id", "name", "age") VALUES ('admin-signin-1', 'Admin Sign In', 1);
  `);

  // Insert User data
  await pool.query(`
    INSERT INTO "UserDashboard" ("id", "name", "key", "path", "app") VALUES ('user-dashboard-1', 'User Dashboard', 'dashboard', '/dashboard', 'user');
    INSERT INTO "UserHeader" ("id", "name", "key", "path", "app") VALUES ('user-header-1', 'Home', 'home', '/', 'user');
    INSERT INTO "UserNotFound" ("id", "name", "age") VALUES ('user-notfound-1', 'User 404 Page', 1);
    INSERT INTO "UserSideNav" ("id", "name", "key", "path", "app") VALUES ('user-sidenav-1', 'Dashboard', 'dashboard', '/dashboard', 'user');
  `);

  // Seed default users (admin, user, consultant)
  // Using Prisma create (parameterized) to avoid bcrypt hash interpolation issues in raw SQL
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const consultantPassword = await bcrypt.hash('consultant123', 10);

  const now = new Date();

  await (prisma as any).user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@serviceops.tech',
      password: adminPassword,
      phone: '+1-555-0001',
      workLocation: 'New York - HQ',
      department: 'IT Administration',
      businessUnit: 'Technology',
      employeeId: 'EMP001',
      managerName: 'CTO Office',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      source: 'admin',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en',
      slaWorkingCalendar: 'Standard 8x5',
      slaExceptionGroup: 'US Federal Holidays',
      lastActivityAt: new Date(now.getTime() - 15 * 60 * 1000),
      failedLoginAttempts: 0,
      isActive: true,
      mustResetPassword: false,
      firstActivationDate: now,
      createdAt: now,
      updatedAt: now,
    },
  });

  await (prisma as any).user.create({
    data: {
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@serviceops.tech',
      password: userPassword,
      phone: '+1-555-0002',
      workLocation: 'Chicago - Branch',
      department: 'Finance',
      businessUnit: 'Corporate Services',
      employeeId: 'EMP002',
      managerName: 'Jane Manager',
      name: 'Regular User',
      role: 'user',
      status: 'active',
      source: 'admin',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en',
      slaWorkingCalendar: 'Standard 8x5',
      slaExceptionGroup: 'US Federal Holidays',
      lastActivityAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      failedLoginAttempts: 0,
      isActive: true,
      mustResetPassword: false,
      firstActivationDate: now,
      createdAt: now,
      updatedAt: now,
    },
  });

  await (prisma as any).user.create({
    data: {
      firstName: 'Consultant',
      lastName: 'User',
      email: 'consultant@serviceops.tech',
      password: consultantPassword,
      phone: '+1-555-0003',
      workLocation: 'Remote',
      department: 'External Consulting',
      businessUnit: 'Professional Services',
      employeeId: 'CON001',
      managerName: 'Project Lead',
      reasonForAccess: 'Assigned to SerivceOps implementation project',
      name: 'Consultant User',
      role: 'consultant',
      status: 'active',
      source: 'admin',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '24h',
      language: 'en',
      slaWorkingCalendar: 'Extended 10x5',
      slaExceptionGroup: 'US Federal Holidays',
      lastActivityAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      failedLoginAttempts: 0,
      isActive: true,
      mustResetPassword: false,
      firstActivationDate: now,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Seed sample incidents across all statuses and priorities
  await pool.query(`
    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "createdBy", "isRecurring", "notes", "createdAt", "updatedAt")
      VALUES ('INC0001001', 'John Doe', '+1-555-0101', 'john.doe@company.com', 'New York - HQ', 'Finance', 'Financial Services', 'Core Banking', 'Payment Gateway', 'Payment gateway returning timeout errors', 'Multiple users experiencing timeout errors when processing payments through the gateway.', 'high', 'high', '1-Critical', 'phone', 'new', 'Payment Support Team', 'Alice Johnson', 'admin@serviceops.tech', false, 'Escalated to P1 due to business impact.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "secondaryResources", "createdBy", "isRecurring", "notes", "createdAt", "updatedAt")
      VALUES ('INC0001002', 'Jane Smith', '+1-555-0102', 'jane.smith@company.com', 'Chicago - Branch', 'Human Resources', 'Corporate Services', 'HR Systems', 'Employee Portal', 'Employee portal SSO login failing', 'HR staff unable to access the employee portal via SSO. Receiving 403 Forbidden error.', 'medium', 'high', '2-High', 'email', 'in_progress', 'Identity & Access Team', 'Bob Williams', 'Carol Davis', 'admin@serviceops.tech', false, 'Identified as SAML configuration issue.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "createdBy", "isRecurring", "notes", "relatedRecords", "createdAt", "updatedAt")
      VALUES ('INC0001003', 'Mike Johnson', 'mike.johnson@company.com', 'Dallas - Remote', 'Engineering', 'Technology', 'Infrastructure', 'CI/CD Pipeline', 'CI/CD pipeline builds failing intermittently', 'Build pipeline failing approximately 30% of the time due to memory issues on build agents.', 'medium', 'medium', '3-Medium', 'portal', 'on_hold', 'DevOps Team', 'Dave Martinez', 'user@serviceops.tech', true, 'On hold - waiting for new build agents to be provisioned.', '["INC0000987","INC0000654"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "createdBy", "isRecurring", "notes", "attachments", "createdAt", "updatedAt")
      VALUES ('INC0001004', 'Sarah Wilson', '+1-555-0104', 'sarah.wilson@company.com', 'San Francisco - Office', 'Marketing', 'Marketing Operations', 'Digital Marketing', 'Email Campaign Tool', 'Marketing emails bouncing at high rate', 'Email campaign tool showing 40% bounce rate. Root cause: DNS SPF record misconfiguration.', 'low', 'medium', '4-Low', 'chat', 'resolved', 'Email Infrastructure Team', 'Eve Rodriguez', 'user@serviceops.tech', false, 'Resolved - SPF record updated. Bounce rate back to normal 2%.', '["spf_fix_screenshot.png"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "secondaryResources", "createdBy", "isRecurring", "notes", "createdAt", "updatedAt")
      VALUES ('INC0001005', 'Tom Brown', '+1-555-0105', 'tom.brown@company.com', 'Boston - Office', 'Sales', 'Sales Operations', 'CRM', 'Salesforce', 'CRM data sync with ERP failing', 'Salesforce to ERP data sync jobs failing since last maintenance window. Fixed by restoring API credentials.', 'high', 'medium', '2-High', 'phone', 'closed', 'Integration Team', 'Frank Lee', 'Grace Kim', 'admin@serviceops.tech', false, 'Closed after 48-hour monitoring confirmed sync is stable.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "createdBy", "isRecurring", "notes", "createdAt", "updatedAt")
      VALUES ('INC0001006', 'Lisa Chen', 'lisa.chen@company.com', 'Seattle - Remote', 'Engineering', 'Technology', 'Software Development', 'Internal Wiki', 'Wiki page not rendering correctly', 'Reported wiki page rendering issue. Turned out to be a browser cache problem.', 'low', 'low', '5-Planning', 'portal', 'cancelled', 'Service Desk', 'user@serviceops.tech', false, 'Cancelled - user resolved by clearing browser cache.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "createdBy", "isRecurring", "notes", "relatedRecords", "createdAt", "updatedAt")
      VALUES ('INC0001007', 'David Park', '+1-555-0107', 'david.park@company.com', 'Austin - Office', 'Operations', 'Operations', 'Monitoring', 'Server Monitoring', 'Recurring false alerts from monitoring system', 'Monitoring system generating false CPU spike alerts every night during batch processing. Third occurrence this month.', 'low', 'high', '3-Medium', 'walk_in', 'in_progress', 'Monitoring Team', 'Helen Wu', 'admin@serviceops.tech', true, 'Recurring issue. Need to add batch processing window as exception.', '["INC0000801","INC0000850"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "secondaryResources", "createdBy", "isRecurring", "isMajor", "notes", "attachments", "createdAt", "updatedAt")
      VALUES ('INC0001008', 'CEO Office', '+1-555-0100', 'ceo.office@company.com', 'New York - HQ', 'Executive', 'Enterprise Services', 'Core Infrastructure', 'Enterprise Network', 'Complete network outage at HQ building', 'Total network outage affecting all floors at New York HQ. Approximately 500 employees affected. Core switch failure suspected.', 'high', 'high', '1-Critical', 'phone', 'in_progress', 'Network Operations Center', 'Ian Foster', 'Jack Thompson, Karen White', 'admin@serviceops.tech', false, true, 'MAJOR INCIDENT - Bridge call active. Vendor on-site dispatched.', '["network_topology.pdf","switch_error_logs.txt"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "primaryResource", "createdBy", "isRecurring", "isMajor", "notes", "draftExpiresAt", "createdAt", "updatedAt")
      VALUES ('INC0001009', 'Amy Taylor', '+1-555-0109', 'amy.taylor@company.com', 'Denver - Remote', 'Engineering', 'Technology', 'Cloud Services', 'AWS Console', 'Draft - AWS S3 bucket access permissions review', 'Need to review and update S3 bucket access permissions for the analytics team. Currently in draft awaiting approval.', 'medium', 'low', '4-Low', 'portal', 'draft', 'Cloud Operations Team', 'admin@serviceops.tech', 'admin@serviceops.tech', false, false, 'Draft incident - pending review before submission.', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "AdminIncident" ("number", "caller", "callerPhone", "callerEmail", "callerLocation", "callerDepartment", "businessCategory", "serviceLine", "application", "shortDescription", "description", "impact", "urgency", "priority", "channel", "status", "assignmentGroup", "createdBy", "isRecurring", "isMajor", "notes", "draftExpiresAt", "createdAt", "updatedAt")
      VALUES ('INC0001010', 'Ryan Martinez', '+1-555-0110', 'ryan.martinez@company.com', 'Miami - Office', 'Sales', 'Sales Operations', 'CRM', 'Salesforce', 'Draft - CRM field customization request', 'Request to add custom fields for new product line tracking in Salesforce. Awaiting manager approval.', 'low', 'low', '5-Planning', 'email', 'draft', 'CRM Admin Team', 'user@serviceops.tech', false, false, 'Draft - pending department head sign-off.', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `);

  // Seed additional admin headers for different ticket types
  await pool.query(`
    INSERT INTO "AdminHeader" ("ticketType", "key", "name", "description", "isActive", "app", "order")
      VALUES ('Incident', 'incident', 'Incident Management', 'Header for incident management', true, 'admin', 2);
    INSERT INTO "AdminHeader" ("ticketType", "key", "name", "description", "isActive", "app", "order")
      VALUES ('Service Request', 'service-request', 'Service Request', 'Header for service request management', true, 'admin', 3);
    INSERT INTO "AdminHeader" ("ticketType", "key", "name", "description", "isActive", "app", "order")
      VALUES ('Change Request', 'change-request', 'Change Management', 'Header for change request management', true, 'admin', 4);
    INSERT INTO "AdminHeader" ("ticketType", "key", "name", "description", "isActive", "app", "order")
      VALUES ('Problem', 'problem', 'Problem Management', 'Header for problem management', false, 'admin', 5);
  `);

  console.log('Data seeded successfully!');
}

function createSeedAttachments() {
  const uploadsDir = path.join(__dirname, '../../uploads/attachments');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const files: Record<string, string> = {
    'spf_fix_screenshot.png':
      'Placeholder: SPF record fix screenshot for INC0001004.\nSPF record updated to include new mail server IP.',
    'network_topology.pdf':
      'Placeholder: Network topology diagram for INC0001008 (HQ outage).\nCore switch replaced - rack B, floor 3.',
    'switch_error_logs.txt':
      '[2026-03-08 02:14:33] ERROR: Core switch SW-HQ-B3-01 - link failure on port 0/1\n' +
      '[2026-03-08 02:14:34] CRITICAL: Spanning tree topology change detected\n' +
      '[2026-03-08 02:14:35] ERROR: Failover to backup switch failed - no redundant path',
  };

  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Created seed attachment: ${filename}`);
    }
  }
}

async function main() {
  console.log('Starting database seeding...');
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

  createSeedAttachments();
  await createTables();
  await clearAndSeed();

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
