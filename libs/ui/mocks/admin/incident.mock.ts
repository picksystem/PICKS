import {
  IIncident,
  IIncidentListResponse,
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  IncidentChannel,
  IncidentStatus,
  calculatePriority,
} from '@picks/interfaces';

/**
 * Incident Mock Data
 * Covers all statuses, priorities, impact/urgency combos, channels
 *
 * Uses shared interfaces from @picks/interfaces
 * Same types used by Frontend and Backend
 */

export {
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  IncidentChannel,
  IncidentStatus,
  calculatePriority,
};

// ============================================
// Single Incident Mocks - By Status
// ============================================

export const mockIncidentNew: IIncident = {
  id: 1,
  number: 'INC0001001',
  client: 'Acme Corp',
  caller: 'John Doe',
  callerPhone: '+1-555-0101',
  callerEmail: 'john.doe@company.com',
  callerLocation: 'New York - HQ',
  callerDepartment: 'Finance',
  additionalContacts: null,
  businessCategory: 'Financial Services',
  serviceLine: 'Core Banking',
  application: 'Payment Gateway',
  applicationCategory: 'Transaction Processing',
  applicationSubCategory: 'Payment Failures',
  shortDescription: 'Payment gateway returning timeout errors',
  description:
    'Multiple users in the finance department are experiencing timeout errors when processing payments through the gateway. Issue started at 9:00 AM EST.',
  impact: IncidentImpact.HIGH,
  urgency: IncidentUrgency.HIGH,
  priority: IncidentPriority.CRITICAL,
  channel: IncidentChannel.PHONE,
  status: IncidentStatus.NEW,
  assignmentGroup: 'Payment Support Team',
  primaryResource: 'Alice Johnson',
  secondaryResources: null,
  createdAt: new Date('2026-02-06T09:15:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: false,
  isMajor: true,
  isReleaseManagement: false,
  eta: null,
  notes: 'Escalated to P1 due to business impact on payment processing.',
  relatedRecords: null,
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-06T09:15:00Z'),
};

export const mockIncidentInProgress: IIncident = {
  id: 2,
  number: 'INC0001002',
  client: 'Acme Corp',
  caller: 'Jane Smith',
  callerPhone: '+1-555-0102',
  callerEmail: 'jane.smith@company.com',
  callerLocation: 'Chicago - Branch',
  callerDepartment: 'Human Resources',
  additionalContacts: null,
  businessCategory: 'Corporate Services',
  serviceLine: 'HR Systems',
  application: 'Employee Portal',
  applicationCategory: 'Access Management',
  applicationSubCategory: 'Login Issues',
  shortDescription: 'Employee portal SSO login failing',
  description:
    'HR staff unable to access the employee portal via SSO. Receiving 403 Forbidden error after authentication redirect.',
  impact: IncidentImpact.MEDIUM,
  urgency: IncidentUrgency.HIGH,
  priority: IncidentPriority.HIGH,
  channel: IncidentChannel.EMAIL,
  status: IncidentStatus.IN_PROGRESS,
  assignmentGroup: 'Identity & Access Team',
  primaryResource: 'Bob Williams',
  secondaryResources: 'Carol Davis',
  createdAt: new Date('2026-02-05T14:30:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: false,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes: 'Identified as SAML configuration issue. Working with IdP vendor.',
  relatedRecords: null,
  attachments: null,
  followers: JSON.stringify(['admin@serviceops.tech']),
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-06T10:00:00Z'),
};

export const mockIncidentOnHold: IIncident = {
  id: 3,
  number: 'INC0001003',
  client: null,
  caller: 'Mike Johnson',
  callerPhone: null,
  callerEmail: 'mike.johnson@company.com',
  callerLocation: 'Dallas - Remote',
  callerDepartment: 'Engineering',
  additionalContacts: null,
  businessCategory: 'Technology',
  serviceLine: 'Infrastructure',
  application: 'CI/CD Pipeline',
  applicationCategory: 'Build System',
  applicationSubCategory: 'Deployment Failures',
  shortDescription: 'CI/CD pipeline builds failing intermittently',
  description:
    'Build pipeline failing approximately 30% of the time due to memory issues on build agents. Waiting for infrastructure team to provision additional capacity.',
  impact: IncidentImpact.MEDIUM,
  urgency: IncidentUrgency.MEDIUM,
  priority: IncidentPriority.MEDIUM,
  channel: IncidentChannel.PORTAL,
  status: IncidentStatus.ON_HOLD,
  assignmentGroup: 'DevOps Team',
  primaryResource: 'Dave Martinez',
  secondaryResources: null,
  createdAt: new Date('2026-02-03T11:00:00Z'),
  createdBy: 'user@serviceops.tech',
  isRecurring: true,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes:
    'On hold - waiting for new build agents to be provisioned by infra team. ETA from vendor pending.',
  relatedRecords: JSON.stringify(['INC0000987', 'INC0000654']),
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-05T16:00:00Z'),
};

export const mockIncidentResolved: IIncident = {
  id: 4,
  number: 'INC0001004',
  client: 'Acme Corp',
  caller: 'Sarah Wilson',
  callerPhone: '+1-555-0104',
  callerEmail: 'sarah.wilson@company.com',
  callerLocation: 'San Francisco - Office',
  callerDepartment: 'Marketing',
  additionalContacts: null,
  businessCategory: 'Marketing Operations',
  serviceLine: 'Digital Marketing',
  application: 'Email Campaign Tool',
  applicationCategory: 'Email Delivery',
  applicationSubCategory: 'Bounce Rate',
  shortDescription: 'Marketing emails bouncing at high rate',
  description:
    'Email campaign tool showing 40% bounce rate. Root cause identified as DNS SPF record misconfiguration after domain migration.',
  impact: IncidentImpact.LOW,
  urgency: IncidentUrgency.MEDIUM,
  priority: IncidentPriority.LOW,
  channel: IncidentChannel.CHAT,
  status: IncidentStatus.RESOLVED,
  assignmentGroup: 'Email Infrastructure Team',
  primaryResource: 'Eve Rodriguez',
  secondaryResources: null,
  createdAt: new Date('2026-02-01T08:00:00Z'),
  createdBy: 'user@serviceops.tech',
  isRecurring: false,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes: 'Resolved - SPF record updated and propagated. Bounce rate back to normal 2%.',
  relatedRecords: null,
  attachments: JSON.stringify(['spf_fix_screenshot.png']),
  followers: JSON.stringify(['user@serviceops.tech']),
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: new Date('2026-02-02T12:00:00Z'),
  resolvedBy: 'user@serviceops.tech',
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-02T12:30:00Z'),
};

export const mockIncidentClosed: IIncident = {
  id: 5,
  number: 'INC0001005',
  client: 'Acme Corp',
  caller: 'Tom Brown',
  callerPhone: '+1-555-0105',
  callerEmail: 'tom.brown@company.com',
  callerLocation: 'Boston - Office',
  callerDepartment: 'Sales',
  additionalContacts: null,
  businessCategory: 'Sales Operations',
  serviceLine: 'CRM',
  application: 'Salesforce',
  applicationCategory: 'Data Sync',
  applicationSubCategory: 'Integration Errors',
  shortDescription: 'CRM data sync with ERP failing',
  description:
    'Salesforce to ERP data sync jobs failing since last maintenance window. Customer records not updating in ERP. Fixed by restoring API credentials.',
  impact: IncidentImpact.HIGH,
  urgency: IncidentUrgency.MEDIUM,
  priority: IncidentPriority.HIGH,
  channel: IncidentChannel.PHONE,
  status: IncidentStatus.CLOSED,
  assignmentGroup: 'Integration Team',
  primaryResource: 'Frank Lee',
  secondaryResources: 'Grace Kim',
  createdAt: new Date('2026-01-28T10:00:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: false,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes:
    'Closed after 48-hour monitoring confirmed sync is stable. Root cause: API credentials rotated during maintenance but not updated in integration config.',
  relatedRecords: null,
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: new Date('2026-01-30T10:00:00Z'),
  resolvedBy: 'admin@serviceops.tech',
  closedAt: new Date('2026-01-31T18:00:00Z'),
  closedBy: 'admin@serviceops.tech',
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-01-31T18:00:00Z'),
};

export const mockIncidentCancelled: IIncident = {
  id: 6,
  number: 'INC0001006',
  client: null,
  caller: 'Lisa Chen',
  callerPhone: null,
  callerEmail: 'lisa.chen@company.com',
  callerLocation: 'Seattle - Remote',
  callerDepartment: 'Engineering',
  additionalContacts: null,
  businessCategory: 'Technology',
  serviceLine: 'Software Development',
  application: 'Internal Wiki',
  applicationCategory: 'Content Management',
  applicationSubCategory: null,
  shortDescription: 'Wiki page not rendering correctly',
  description:
    'Reported wiki page rendering issue. Turned out to be a browser cache problem resolved by clearing cache.',
  impact: IncidentImpact.LOW,
  urgency: IncidentUrgency.LOW,
  priority: IncidentPriority.PLANNING,
  channel: IncidentChannel.PORTAL,
  status: IncidentStatus.CANCELLED,
  assignmentGroup: 'Service Desk',
  primaryResource: null,
  secondaryResources: null,
  createdAt: new Date('2026-02-04T13:00:00Z'),
  createdBy: 'user@serviceops.tech',
  isRecurring: false,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes: 'Cancelled - user resolved by clearing browser cache.',
  relatedRecords: null,
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-04T13:30:00Z'),
};

export const mockIncidentDraft: IIncident = {
  id: 9,
  number: 'INC0001009',
  client: null,
  caller: 'Amy Taylor',
  callerPhone: '+1-555-0109',
  callerEmail: 'amy.taylor@company.com',
  callerLocation: 'Denver - Remote',
  callerDepartment: 'Engineering',
  additionalContacts: null,
  businessCategory: 'Technology',
  serviceLine: 'Cloud Services',
  application: 'AWS Console',
  applicationCategory: 'Cloud Infrastructure',
  applicationSubCategory: 'Access Management',
  shortDescription: 'Draft - AWS S3 bucket access permissions review',
  description:
    'Need to review and update S3 bucket access permissions for the analytics team. Currently in draft awaiting approval.',
  impact: IncidentImpact.MEDIUM,
  urgency: IncidentUrgency.LOW,
  priority: IncidentPriority.LOW,
  channel: IncidentChannel.PORTAL,
  status: IncidentStatus.DRAFT,
  assignmentGroup: 'Cloud Operations Team',
  primaryResource: 'admin@serviceops.tech',
  secondaryResources: null,
  createdAt: new Date('2026-02-08T10:00:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: false,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes: 'Draft incident - pending review before submission.',
  relatedRecords: null,
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-08T10:00:00Z'),
};

// ============================================
// Special Case Mocks
// ============================================

export const mockIncidentRecurring: IIncident = {
  id: 7,
  number: 'INC0001007',
  client: 'Acme Corp',
  caller: 'David Park',
  callerPhone: '+1-555-0107',
  callerEmail: 'david.park@company.com',
  callerLocation: 'Austin - Office',
  callerDepartment: 'Operations',
  additionalContacts: null,
  businessCategory: 'Operations',
  serviceLine: 'Monitoring',
  application: 'Server Monitoring',
  applicationCategory: 'Alerting',
  applicationSubCategory: 'False Positives',
  shortDescription: 'Recurring false alerts from monitoring system',
  description:
    'Monitoring system generating false CPU spike alerts every night between 2-3 AM during scheduled batch processing. Third occurrence this month.',
  impact: IncidentImpact.LOW,
  urgency: IncidentUrgency.HIGH,
  priority: IncidentPriority.MEDIUM,
  channel: IncidentChannel.WALK_IN,
  status: IncidentStatus.IN_PROGRESS,
  assignmentGroup: 'Monitoring Team',
  primaryResource: 'Helen Wu',
  secondaryResources: null,
  createdAt: new Date('2026-02-05T03:00:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: true,
  isMajor: false,
  isReleaseManagement: false,
  eta: null,
  notes:
    'Recurring issue. Need to add batch processing window as exception in monitoring thresholds.',
  relatedRecords: JSON.stringify(['INC0000801', 'INC0000850']),
  attachments: null,
  followers: null,
  internalFollowers: null,
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-06T08:00:00Z'),
};

export const mockIncidentMajor: IIncident = {
  id: 8,
  number: 'INC0001008',
  client: 'Acme Corp',
  caller: 'CEO Office',
  callerPhone: '+1-555-0100',
  callerEmail: 'ceo.office@company.com',
  callerLocation: 'New York - HQ',
  callerDepartment: 'Executive',
  additionalContacts: 'cto@company.com',
  businessCategory: 'Enterprise Services',
  serviceLine: 'Core Infrastructure',
  application: 'Enterprise Network',
  applicationCategory: 'Network',
  applicationSubCategory: 'Complete Outage',
  shortDescription: 'Complete network outage at HQ building',
  description:
    'Total network outage affecting all floors at New York HQ. No internet, no internal systems access. Approximately 500 employees affected. Core switch failure suspected.',
  impact: IncidentImpact.HIGH,
  urgency: IncidentUrgency.HIGH,
  priority: IncidentPriority.CRITICAL,
  channel: IncidentChannel.PHONE,
  status: IncidentStatus.IN_PROGRESS,
  assignmentGroup: 'Network Operations Center',
  primaryResource: 'Ian Foster',
  secondaryResources: 'Jack Thompson, Karen White',
  createdAt: new Date('2026-02-06T07:45:00Z'),
  createdBy: 'admin@serviceops.tech',
  isRecurring: false,
  isMajor: true,
  isReleaseManagement: false,
  eta: null,
  notes:
    'MAJOR INCIDENT - Bridge call active. Vendor on-site dispatched. Backup switch being configured.',
  relatedRecords: null,
  attachments: JSON.stringify(['network_topology.pdf', 'switch_error_logs.txt']),
  followers: JSON.stringify(['admin@serviceops.tech', 'cto@company.tech']),
  internalFollowers: JSON.stringify(['admin@serviceops.tech']),
  draftExpiresAt: null,
  clientPrimaryContact: null,
  billingCode: null,
  approvedEstimatesHours: null,
  estimatesDetails: null,
  analysisSummary: null,
  ticketSource: null,
  resolvedAt: null,
  resolvedBy: null,
  closedAt: null,
  closedBy: null,
  reopenedAt: null,
  reopenedBy: null,
  approvedAt: null,
  approvedBy: null,
  updatedAt: new Date('2026-02-06T09:30:00Z'),
};

// ============================================
// List Mocks - Different Scenarios
// ============================================

export const mockIncidentsEmpty: IIncident[] = [];

export const mockIncidentsAllStatuses: IIncident[] = [
  mockIncidentDraft,
  mockIncidentNew,
  mockIncidentInProgress,
  mockIncidentOnHold,
  mockIncidentResolved,
  mockIncidentClosed,
  mockIncidentCancelled,
];

export const mockIncidentsAll: IIncident[] = [
  mockIncidentDraft,
  mockIncidentNew,
  mockIncidentInProgress,
  mockIncidentOnHold,
  mockIncidentResolved,
  mockIncidentClosed,
  mockIncidentCancelled,
  mockIncidentRecurring,
  mockIncidentMajor,
];

export const mockIncidentsOpen: IIncident[] = [
  mockIncidentNew,
  mockIncidentInProgress,
  mockIncidentOnHold,
  mockIncidentRecurring,
  mockIncidentMajor,
];

export const mockIncidentsCritical: IIncident[] = [mockIncidentNew, mockIncidentMajor];

export const mockIncidentsMajorOnly: IIncident[] = [mockIncidentNew, mockIncidentMajor];

export const mockIncidentsRecurringOnly: IIncident[] = [mockIncidentOnHold, mockIncidentRecurring];

// ============================================
// Dashboard Summary Mocks
// ============================================

export interface IIncidentDashboardSummary {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  byPriority: Record<string, number>;
  openCount: number;
  majorCount: number;
  recurringCount: number;
}

export const mockIncidentDashboardSummary: IIncidentDashboardSummary = {
  total: 49,
  byStatus: {
    [IncidentStatus.DRAFT]: 1,
    [IncidentStatus.NEW]: 8,
    [IncidentStatus.IN_PROGRESS]: 15,
    [IncidentStatus.ON_HOLD]: 5,
    [IncidentStatus.ASSIGNED]: 3,
    [IncidentStatus.RESOLVED]: 12,
    [IncidentStatus.CLOSED]: 6,
    [IncidentStatus.CANCELLED]: 2,
  },
  byPriority: {
    [IncidentPriority.CRITICAL]: 3,
    [IncidentPriority.HIGH]: 10,
    [IncidentPriority.MEDIUM]: 18,
    [IncidentPriority.LOW]: 12,
    [IncidentPriority.PLANNING]: 5,
  },
  openCount: 28,
  majorCount: 2,
  recurringCount: 4,
};

export const mockIncidentDashboardSummaryClean: IIncidentDashboardSummary = {
  total: 20,
  byStatus: {
    [IncidentStatus.DRAFT]: 0,
    [IncidentStatus.NEW]: 0,
    [IncidentStatus.IN_PROGRESS]: 2,
    [IncidentStatus.ON_HOLD]: 0,
    [IncidentStatus.ASSIGNED]: 0,
    [IncidentStatus.RESOLVED]: 10,
    [IncidentStatus.CLOSED]: 8,
    [IncidentStatus.CANCELLED]: 0,
  },
  byPriority: {
    [IncidentPriority.CRITICAL]: 0,
    [IncidentPriority.HIGH]: 1,
    [IncidentPriority.MEDIUM]: 5,
    [IncidentPriority.LOW]: 10,
    [IncidentPriority.PLANNING]: 4,
  },
  openCount: 2,
  majorCount: 0,
  recurringCount: 0,
};

// ============================================
// API Response Mocks
// ============================================

export const mockIncidentListResponse: IIncidentListResponse = {
  message: 'Incidents fetched successfully',
  data: mockIncidentsAll,
};

export const mockIncidentListResponseEmpty: IIncidentListResponse = {
  message: 'No incidents found',
  data: [],
};

// ============================================
// Loading/Error States
// ============================================

export const mockIncidentsLoading = {
  isLoading: true,
  data: null,
  error: null,
};

export const mockIncidentsError = {
  isLoading: false,
  data: null,
  error: 'Failed to fetch incidents',
};

export const mockIncidentsSuccess = {
  isLoading: false,
  data: mockIncidentsAll,
  error: null,
};

// ============================================
// UI Config for Incident Status
// ============================================

export interface IIncidentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const INCIDENT_STATUS_CONFIG: Record<IncidentStatus, IIncidentStatusConfig> = {
  [IncidentStatus.DRAFT]: {
    label: 'Draft',
    color: '#9e9e9e',
    bgColor: '#fafafa',
  },
  [IncidentStatus.NEW]: {
    label: 'New',
    color: '#1976d2',
    bgColor: '#e3f2fd',
  },
  [IncidentStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#f57c00',
    bgColor: '#fff3e0',
  },
  [IncidentStatus.ON_HOLD]: {
    label: 'On Hold',
    color: '#7b1fa2',
    bgColor: '#f3e5f5',
  },
  [IncidentStatus.ASSIGNED]: {
    label: 'Assigned',
    color: '#0288d1',
    bgColor: '#e1f5fe',
  },
  [IncidentStatus.RESOLVED]: {
    label: 'Resolved',
    color: '#388e3c',
    bgColor: '#e8f5e9',
  },
  [IncidentStatus.CLOSED]: {
    label: 'Closed',
    color: '#616161',
    bgColor: '#f5f5f5',
  },
  [IncidentStatus.CANCELLED]: {
    label: 'Cancelled',
    color: '#d32f2f',
    bgColor: '#ffebee',
  },
};

export const INCIDENT_PRIORITY_CONFIG: Record<string, IIncidentStatusConfig> = {
  [IncidentPriority.CRITICAL]: {
    label: 'Critical',
    color: '#d32f2f',
    bgColor: '#ffebee',
  },
  [IncidentPriority.HIGH]: {
    label: 'High',
    color: '#f44336',
    bgColor: '#ffebee',
  },
  [IncidentPriority.MEDIUM]: {
    label: 'Medium',
    color: '#ff9800',
    bgColor: '#fff3e0',
  },
  [IncidentPriority.LOW]: {
    label: 'Low',
    color: '#4caf50',
    bgColor: '#e8f5e9',
  },
  [IncidentPriority.PLANNING]: {
    label: 'Planning',
    color: '#9e9e9e',
    bgColor: '#fafafa',
  },
};
