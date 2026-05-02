// ── Primitive building blocks ──────────────────────────────────────────────────

export interface IConfigPriorityLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  sortOrder: number;
  /** ticketType key → enabled flag; keys are synced from AdminTicketType */
  enabledFor: Record<string, boolean>;
}

export interface IConfigImpactLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  /** ticketType key → enabled flag */
  enabledFor: Record<string, boolean>;
}

export interface IConfigUrgencyLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  /** ticketType key → enabled flag */
  enabledFor: Record<string, boolean>;
}

/** impactId → urgencyId → priorityId */
export type IConfigMatrixMap = Record<string, Record<string, string>>;

export interface IConfigStatusLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  slaActive: boolean;
  isFinal: boolean; // resolved/closed/cancelled
  /** ticketType key → enabled flag */
  enabledFor: Record<string, boolean>;
}

export interface IConfigSLA {
  id: string;
  name: string;
  description: string;
  priorityId: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  enabledFor: Record<string, boolean>;
  isActive: boolean;
}

export interface IConfigSLAAdminControls {
  // master switch
  enabled: boolean;
  // ticket-type activation (dynamic — keyed by ticket type `type` string)
  activateOnTicketTypes: Record<string, boolean>;
  // calendar rules
  basedOnCallerCalendar: boolean;
  basedOnConsultantCalendar: boolean;
  excludeCallerBankHolidays: boolean;
  excludeCallerLeaves: boolean;
  excludeConsultantBankHolidays: boolean;
  excludeConsultantLeaves: boolean;
  excludeSaturdaysAndSundays: boolean;
  excludeFridaysAndSaturdays: boolean;
  excludeFridaysOnly: boolean;
  excludeSaturdaysOnly: boolean;
  excludeSundaysOnly: boolean;
  // response SLA
  responseAckSLAEnabled: boolean;
  responseAlertOnBreach: boolean;
  // resolution SLA
  resolutionSLAEnabled: boolean;
  // due date admin
  dueDateAdminEnabled: boolean;
  dueDateOverrideByAgents: boolean;
  dueDateEnableDates: boolean;
  dueDateEditableByConsultants: boolean;
  dueDateEqualToSLADates: boolean;
  dueDateExtendDueDates: boolean;
  // due dates
  dueDatesEnabled: boolean;
  dueDateVisibleToCallers: boolean;
  alertBeforeDueDate: boolean;
  // ETA admin
  etaEnabled: boolean;
  etaEditableByConsultants: boolean;
  etaEqualToDueDates: boolean;
  // ETA activation
  etaActivationEnabled: boolean;
  etaVisibleToCallers: boolean;
  etaEmailNotifications: boolean;
  // time log admin
  timeLogAdminEnabled: boolean;
  requireTimeLogsForResolution: boolean;
  // time logs activation
  timeLogsActivationEnabled: boolean;
  showTimeLogsToCallers: boolean;
}

// ── Section shapes ─────────────────────────────────────────────────────────────

export interface IConfigGeneral {
  systemName: string;
  systemDescription: string;
  timezone: string;
  dateFormat: string;
  language: string;
  timeEntriesEnabled: boolean;
  timeEntriesDisplayName: 'approved_estimates' | 'estimated_hours';
  approvedEstimateRows: IConfigApprovedEstimateRow[];
}

export interface IConfigPriorities {
  levels: IConfigPriorityLevel[];
  impactLevels: IConfigImpactLevel[];
  urgencyLevels: IConfigUrgencyLevel[];
  /** ticketType key → IConfigMatrixMap; auto-populated for every active ticket type */
  matrices: Record<string, IConfigMatrixMap>;
}

export interface IConfigStatuses {
  /** Flat list of all statuses; enabledFor controls per-ticket-type visibility */
  items: IConfigStatusLevel[];
}

export interface IConfigResponseAckSLARow {
  id: string;
  ticketTypeId: number;
  ticketTypeName: string;
  activation: boolean;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
}

export interface IConfigApprovedEstimateRow {
  id: string;
  ticketTypeId: number;
  ticketTypeName: string;
  hours: number;
}

export interface IConfigActivationRow {
  id: string;
  ticketTypeId: number;
  ticketTypeName: string;
  activation: boolean;
}

export interface IConfigBusinessCategory {
  id: string;
  name: string;
  description: string;
  head: string;
}

export interface IConfigTimesheetProject {
  id: string;
  project: string;
  application: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxHoursPerDayPerResource: number;
}

export interface IConfigExpenseProject {
  id: string;
  project: string;
  application: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxAmountPerDay: number;
}

export interface IConfigApproval {
  id: string;
  approverName: string;
  approverRole: string;
  approvalOrder: number;
  isRequired: boolean;
}

export interface IConfigServiceLineTicketType {
  ticketTypeId: number;
  ticketTypeName: string;
  enabled: boolean;
}

export interface IConfigServiceLine {
  id: string;
  businessCategoryId: string;
  businessCategoryName: string;
  name: string;
  description: string;
  manager: string;
  timesheetProjects: IConfigTimesheetProject[];
  expenseProjects: IConfigExpenseProject[];
  approvals: IConfigApproval[];
  ticketTypeActivations: IConfigServiceLineTicketType[];
}

export interface IConfigSupportLine {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface IConfigBillingCode {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface IConfigApplication {
  id: string;
  serviceLineId: string;
  serviceLineName: string;
  name: string;
  description: string;
  enableSupportLevels: boolean;
  applicationLead: string;
  managerLevel1: string;
  managerLevel2: string;
  approvals: IConfigApproval[];
  ticketTypeActivations: IConfigServiceLineTicketType[];
  supportLines: IConfigSupportLine[];
  billingCodes: IConfigBillingCode[];
  timesheetProjects: IConfigTimesheetProject[];
  expenseProjects: IConfigExpenseProject[];
  stickyNote: string;
}

export interface IConfigApplicationQueue {
  id: string;
  applicationId: string;
  applicationName: string;
  name: string;
  description: string;
  predecessor: string;
  successor: string;
  queueSpecificLead: string;
  managerLevel1: string;
  managerLevel2: string;
  approvals: IConfigApproval[];
  ticketTypeActivations: IConfigServiceLineTicketType[];
  timesheetProjects: IConfigTimesheetProject[];
  expenseProjects: IConfigExpenseProject[];
}

export interface IConfigApplicationCategory {
  id: string;
  applicationId: string;
  applicationName: string;
  categoryName: string;
  description: string;
}

export interface IConfigApplicationSubCategory {
  id: string;
  applicationId: string;
  applicationName: string;
  applicationCategoryId: string;
  applicationCategoryName: string;
  subCategoryName: string;
  description: string;
}

export interface IConfigApplicationNumberSequence {
  id: string;
  applicationId: string;
  applicationName: string;
  ticketTypeId: number;
  ticketTypeName: string;
  numberSequenceCode: string;
  numericCharLength: number;
  numberSequenceFormat: string;
}

export interface IConfigConsultantProfile {
  id: string;
  consultantName: string;
  applicationId: string;
  applicationName: string;
  consultantRole: string;
  workingCalendar: string;
  holidayCalendar: string;
  leadConsultant: string;
  manager: string;
}

export interface IConfigAssociatedUserProfile {
  id: string;
  consultantProfileId: string;
  consultantName: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export interface IConfigConsultantWorkingTime {
  id: string;
  consultantProfileId: string;
  consultantName: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface IConfigConsultantWorkingShift {
  id: string;
  consultantProfileId: string;
  consultantName: string;
  shiftName: string;
  description: string;
}

export interface IConfigConsultantTimesheetProject {
  id: string;
  consultantProfileId: string;
  consultantName: string;
  activate: boolean;
  project: string;
  application: string;
  fromDate: string;
  toDate: string;
  maxHoursPerDayPerResource: number;
}

export interface IConfigConsultantExpenseProject {
  id: string;
  consultantProfileId: string;
  consultantName: string;
  activate: boolean;
  project: string;
  application: string;
  fromDate: string;
  toDate: string;
  maxAmountPerDay: number;
}

export interface IConfigConsultantRole {
  id: string;
  roleName: string;
  description: string;
}

export interface IConfigAssociatedConsultantProfile {
  id: string;
  application: string;
  roleName: string;
  description: string;
}

export interface IConfigConsultantProfiles {
  profiles: IConfigConsultantProfile[];
  associatedUserProfiles: IConfigAssociatedUserProfile[];
  workingTimes: IConfigConsultantWorkingTime[];
  workingShifts: IConfigConsultantWorkingShift[];
  timesheetProjects: IConfigConsultantTimesheetProject[];
  expenseProjects: IConfigConsultantExpenseProject[];
  consultantRoles: IConfigConsultantRole[];
  associatedConsultantProfiles: IConfigAssociatedConsultantProfile[];
}

export interface IConfigCategorization {
  businessCategories: IConfigBusinessCategory[];
  serviceLines: IConfigServiceLine[];
  applications: IConfigApplication[];
  queues: IConfigApplicationQueue[];
  applicationCategories: IConfigApplicationCategory[];
  applicationSubCategories: IConfigApplicationSubCategory[];
  applicationNumberSequences: IConfigApplicationNumberSequence[];
}

export interface IConfigSLAs {
  adminControls: IConfigSLAAdminControls;
  items: IConfigSLA[];
  responseAckRows: IConfigResponseAckSLARow[];
  resolutionRows: IConfigResponseAckSLARow[];
  dueDateRows: IConfigResponseAckSLARow[];
  etaActivationRows: IConfigActivationRow[];
  timeLogActivationRows: IConfigActivationRow[];
}

// ── User Config section ───────────────────────────────────────────────────────

export interface IConfigWorkLocation {
  id: string;
  name: string;
  description: string;
  country: string;
  state: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  timezone: string;
  workCalendar: string;
}

export interface IConfigWorkLocationWorkingTime {
  id: string;
  workLocationId: string;
  workLocationName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface IConfigWorkLocationShift {
  id: string;
  workLocationId: string;
  workLocationName: string;
  shiftName: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface IConfigWorkLocationAssociatedProfile {
  id: string;
  workLocationId: string;
  workLocationName: string;
  consultantProfileId: string;
  consultantName: string;
}

export interface IConfigUserConfig {
  workLocations: IConfigWorkLocation[];
  workingTimes: IConfigWorkLocationWorkingTime[];
  shifts: IConfigWorkLocationShift[];
  associatedProfiles: IConfigWorkLocationAssociatedProfile[];
}

// ── Templates section ─────────────────────────────────────────────────────────

export interface IConfigTicketUpdateTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  subjectLine: string;
  commentDescription: string;
  internalNote: boolean;
  notifyAssigneesOnly: boolean;
  selfNote: boolean;
  appendToResolution: boolean;
}

export type IConfigCommentTemplate = IConfigTicketUpdateTemplate;

export interface IConfigTicketUpdateTemplates {
  items: IConfigTicketUpdateTemplate[];
}

export interface IConfigCommentTemplates {
  items: IConfigCommentTemplate[];
}

// ── Approvals section ─────────────────────────────────────────────────────────

export interface IConfigApprovalRecord {
  id: string;
  consultant: string;
  application: string;
  consultantRole: string;
  slaWorkingTimeCalendar: string;
  slaExceptionGroup: string;
  leadConsultant: string;
  manager: string;
}

export interface IConfigApprovalAssocUserProfile {
  id: string;
  approvalRecordId: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export interface IConfigApprovalConsultantRole {
  id: string;
  roleName: string;
  description: string;
}

export interface IConfigApprovalWorkingTime {
  id: string;
  approvalRecordId: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface IConfigApprovals {
  records: IConfigApprovalRecord[];
  assocUserProfiles: IConfigApprovalAssocUserProfile[];
  consultantRoles: IConfigApprovalConsultantRole[];
  workingTimes: IConfigApprovalWorkingTime[];
}

// ── Root configuration document ───────────────────────────────────────────────

/** Full configuration stored as a single JSON document in AdminConfiguration. */
export interface IConfigurationData {
  general: IConfigGeneral;
  priorities: IConfigPriorities;
  statuses: IConfigStatuses;
  releaseStatuses: IConfigStatuses;
  slas: IConfigSLAs;
  categorization: IConfigCategorization;
  consultantProfiles: IConfigConsultantProfiles;
  approvals: IConfigApprovals;
  ticketUpdateTemplates: IConfigTicketUpdateTemplates;
  commentTemplates: IConfigCommentTemplates;
  userConfig: IConfigUserConfig;
}

export interface IConfiguration {
  id: number;
  data: IConfigurationData;
  updatedBy?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ── API response shapes ────────────────────────────────────────────────────────

export interface IConfigurationResponse {
  message: string;
  data: IConfiguration;
}

// ── Input shapes ───────────────────────────────────────────────────────────────

/** Replace the full configuration document. */
export interface IUpdateConfigurationInput {
  data: IConfigurationData;
  updatedBy?: number;
}

/** Update a single named section without touching others. */
export interface IUpdateConfigurationSectionInput<
  K extends keyof IConfigurationData = keyof IConfigurationData,
> {
  section: K;
  value: IConfigurationData[K];
  updatedBy?: number;
}

// ── Gateway interface ─────────────────────────────────────────────────────────

export interface IConfigurationGateway {
  /** Returns the singleton row, auto-creating it with defaults when absent. */
  get(): Promise<IConfiguration>;
  /** Full replace of the configuration data. */
  upsert(data: IConfigurationData, updatedBy?: number): Promise<IConfiguration>;
  /** Patch a single section; other sections remain untouched. */
  updateSection<K extends keyof IConfigurationData>(
    section: K,
    value: IConfigurationData[K],
    updatedBy?: number,
  ): Promise<IConfiguration>;
}

// ── Use-case interfaces ───────────────────────────────────────────────────────

export interface IGetConfigurationUseCase {
  execute(): Promise<IConfiguration>;
}

export interface IUpdateConfigurationUseCase {
  execute(input: IUpdateConfigurationInput): Promise<IConfiguration>;
}

export interface IUpdateConfigurationSectionUseCase {
  execute<K extends keyof IConfigurationData>(
    input: IUpdateConfigurationSectionInput<K>,
  ): Promise<IConfiguration>;
}

// ── Default values (shared between backend seed / frontend fallback) ──────────

export const DEFAULT_CONFIGURATION_DATA: IConfigurationData = {
  general: {
    systemName: 'serivceops',
    systemDescription: 'IT Service Management Platform',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    timeEntriesEnabled: false,
    timeEntriesDisplayName: 'estimated_hours',
    approvedEstimateRows: [],
  },
  priorities: {
    levels: [
      {
        id: 'critical',
        name: '1-Critical',
        description: 'Business-critical outage — immediate action required',
        color: '#fff',
        bgColor: '#b91c1c',
        sortOrder: 1,
        enabledFor: {},
      },
      {
        id: 'high',
        name: '2-High',
        description: 'Major impact on operations — urgent attention needed',
        color: '#fff',
        bgColor: '#ea580c',
        sortOrder: 2,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: '3-Medium',
        description: 'Moderate impact — address promptly',
        color: '#fff',
        bgColor: '#ca8a04',
        sortOrder: 3,
        enabledFor: {},
      },
      {
        id: 'low',
        name: '4-Low',
        description: 'Minor impact — address within normal SLA windows',
        color: '#fff',
        bgColor: '#2563eb',
        sortOrder: 4,
        enabledFor: {},
      },
      {
        id: 'planning',
        name: '5-Planning',
        description: 'Scheduled or planned work — no immediate urgency',
        color: '#fff',
        bgColor: '#0f766e',
        sortOrder: 5,
        enabledFor: {},
      },
    ],
    impactLevels: [
      {
        id: 'high',
        name: 'high',
        displayName: '1 - High',
        description: 'Widespread disruption affecting multiple users or core business functions',
        bgColor: '#b91c1c',
        sortOrder: 1,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: 'medium',
        displayName: '2 - Medium',
        description: 'Partial disruption affecting a team or non-critical business function',
        bgColor: '#ca8a04',
        sortOrder: 2,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'low',
        name: 'low',
        displayName: '3 - Low',
        description: 'Minimal disruption, isolated to a single user or workaround available',
        bgColor: '#15803d',
        sortOrder: 3,
        isActive: true,
        enabledFor: {},
      },
    ],
    urgencyLevels: [
      {
        id: 'high',
        name: 'high',
        displayName: '1 - High',
        description: 'Immediate resolution required — time-critical situation',
        bgColor: '#b91c1c',
        sortOrder: 1,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: 'medium',
        displayName: '2 - Medium',
        description: 'Should be resolved within hours — significant business pressure',
        bgColor: '#ca8a04',
        sortOrder: 2,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'low',
        name: 'low',
        displayName: '3 - Low',
        description: 'Can wait until next available window — low time sensitivity',
        bgColor: '#15803d',
        sortOrder: 3,
        isActive: true,
        enabledFor: {},
      },
    ],
    /** matrices are seeded per-ticket-type when the config is first read */
    matrices: {},
  },
  statuses: {
    items: [
      {
        id: 'new',
        name: 'new',
        displayName: 'New',
        description: 'Ticket has been created and is awaiting assignment',
        color: '#fff',
        bgColor: '#6366f1',
        sortOrder: 1,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'assigned',
        name: 'assigned',
        displayName: 'Assigned',
        description: 'Ticket has been assigned to an agent or team',
        color: '#fff',
        bgColor: '#2563eb',
        sortOrder: 2,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'in_progress',
        name: 'in_progress',
        displayName: 'In Progress',
        description: 'An agent is actively working on the ticket',
        color: '#fff',
        bgColor: '#0284c7',
        sortOrder: 3,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'on_hold',
        name: 'on_hold',
        displayName: 'On Hold',
        description: 'Work is paused, waiting for customer response or third-party action',
        color: '#fff',
        bgColor: '#ca8a04',
        sortOrder: 4,
        isActive: true,
        slaActive: false,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'resolved',
        name: 'resolved',
        displayName: 'Resolved',
        description: 'Issue has been resolved and awaiting confirmation from the requester',
        color: '#fff',
        bgColor: '#15803d',
        sortOrder: 5,
        isActive: true,
        slaActive: false,
        isFinal: true,
        enabledFor: {},
      },
      {
        id: 'closed',
        name: 'closed',
        displayName: 'Closed',
        description: 'Ticket has been confirmed as resolved and is now closed',
        color: '#fff',
        bgColor: '#374151',
        sortOrder: 6,
        isActive: true,
        slaActive: false,
        isFinal: true,
        enabledFor: {},
      },
      {
        id: 'cancelled',
        name: 'cancelled',
        displayName: 'Cancelled',
        description: 'Ticket was cancelled and will not be worked on',
        color: '#fff',
        bgColor: '#b91c1c',
        sortOrder: 7,
        isActive: true,
        slaActive: false,
        isFinal: true,
        enabledFor: {},
      },
    ],
  },
  releaseStatuses: {
    items: [
      {
        id: 'awaiting_design_approval',
        name: 'awaiting_design_approval',
        displayName: 'Awaiting Design Approval',
        description: 'Release is pending design team sign-off',
        color: '#fff',
        bgColor: '#7c3aed',
        sortOrder: 1,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'awaiting_estimates_approval',
        name: 'awaiting_estimates_approval',
        displayName: 'Awaiting Estimates Approval',
        description: 'Release effort estimates are pending approval',
        color: '#fff',
        bgColor: '#6366f1',
        sortOrder: 2,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'awaiting_internal_approval',
        name: 'awaiting_internal_approval',
        displayName: 'Awaiting Internal Approval',
        description: 'Release is pending internal stakeholder approval',
        color: '#fff',
        bgColor: '#0284c7',
        sortOrder: 3,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'under_deployment',
        name: 'under_deployment',
        displayName: 'Under Deployment',
        description: 'Release is actively being deployed to the target environment',
        color: '#fff',
        bgColor: '#0891b2',
        sortOrder: 4,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'pending_deployment',
        name: 'pending_deployment',
        displayName: 'Pending Deployment',
        description: 'Release is approved and queued for deployment',
        color: '#fff',
        bgColor: '#0f766e',
        sortOrder: 5,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'awaiting_uat',
        name: 'awaiting_uat',
        displayName: 'Awaiting UAT',
        description: 'Release is deployed and waiting for user acceptance testing',
        color: '#fff',
        bgColor: '#ca8a04',
        sortOrder: 6,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'uat_approved',
        name: 'uat_approved',
        displayName: 'UAT Approved',
        description: 'User acceptance testing has been completed and approved',
        color: '#fff',
        bgColor: '#15803d',
        sortOrder: 7,
        isActive: true,
        slaActive: false,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'awaiting_cab_approval',
        name: 'awaiting_cab_approval',
        displayName: 'Awaiting CAB Approval',
        description: 'Release is pending Change Advisory Board approval',
        color: '#fff',
        bgColor: '#ea580c',
        sortOrder: 8,
        isActive: true,
        slaActive: true,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'cab_approved',
        name: 'cab_approved',
        displayName: 'CAB Approved',
        description: 'Change Advisory Board has approved the release for production',
        color: '#fff',
        bgColor: '#16a34a',
        sortOrder: 9,
        isActive: true,
        slaActive: false,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'prod_release_scheduled',
        name: 'prod_release_scheduled',
        displayName: 'PROD Release Scheduled',
        description: 'Release has been scheduled for production deployment',
        color: '#fff',
        bgColor: '#2563eb',
        sortOrder: 10,
        isActive: true,
        slaActive: false,
        isFinal: false,
        enabledFor: {},
      },
      {
        id: 'release_closed',
        name: 'release_closed',
        displayName: 'Closed',
        description: 'Release cycle has been completed and closed',
        color: '#fff',
        bgColor: '#374151',
        sortOrder: 11,
        isActive: true,
        slaActive: false,
        isFinal: true,
        enabledFor: {},
      },
    ],
  },
  slas: {
    adminControls: {
      enabled: false,
      activateOnTicketTypes: {},
      basedOnCallerCalendar: false,
      basedOnConsultantCalendar: true,
      excludeCallerBankHolidays: false,
      excludeCallerLeaves: false,
      excludeConsultantBankHolidays: true,
      excludeConsultantLeaves: false,
      excludeSaturdaysAndSundays: true,
      excludeFridaysAndSaturdays: false,
      excludeFridaysOnly: false,
      excludeSaturdaysOnly: false,
      excludeSundaysOnly: false,
      responseAckSLAEnabled: true,
      responseAlertOnBreach: true,
      resolutionSLAEnabled: true,
      dueDateAdminEnabled: true,
      dueDateOverrideByAgents: false,
      dueDateEnableDates: true,
      dueDateEditableByConsultants: false,
      dueDateEqualToSLADates: false,
      dueDateExtendDueDates: false,
      dueDatesEnabled: true,
      dueDateVisibleToCallers: true,
      alertBeforeDueDate: true,
      etaEnabled: false,
      etaEditableByConsultants: false,
      etaEqualToDueDates: false,
      etaActivationEnabled: false,
      etaVisibleToCallers: false,
      etaEmailNotifications: false,
      timeLogAdminEnabled: true,
      requireTimeLogsForResolution: false,
      timeLogsActivationEnabled: true,
      showTimeLogsToCallers: false,
    },
    items: [],
    responseAckRows: [],
    resolutionRows: [
      {
        id: 'incident',
        ticketTypeId: 1,
        ticketTypeName: 'Incident',
        activation: true,
        p1: 4,
        p2: 8,
        p3: 16,
        p4: 24,
        p5: 48,
      },
      {
        id: 'service_request',
        ticketTypeId: 2,
        ticketTypeName: 'Service Request',
        activation: true,
        p1: 8,
        p2: 16,
        p3: 24,
        p4: 48,
        p5: 96,
      },
      {
        id: 'advisory_request',
        ticketTypeId: 3,
        ticketTypeName: 'Advisory Request',
        activation: false,
        p1: 16,
        p2: 24,
        p3: 48,
        p4: 96,
        p5: 168,
      },
    ],
    dueDateRows: [],
    etaActivationRows: [],
    timeLogActivationRows: [],
  },
  categorization: {
    businessCategories: [],
    serviceLines: [],
    applications: [],
    queues: [],
    applicationCategories: [],
    applicationSubCategories: [],
    applicationNumberSequences: [],
  } as IConfigCategorization,
  consultantProfiles: {
    profiles: [],
    associatedUserProfiles: [],
    workingTimes: [],
    workingShifts: [],
    timesheetProjects: [],
    expenseProjects: [],
    consultantRoles: [],
    associatedConsultantProfiles: [],
  },
  approvals: {
    records: [],
    assocUserProfiles: [],
    consultantRoles: [],
    workingTimes: [],
  },
  ticketUpdateTemplates: { items: [] },
  commentTemplates: { items: [] },
  userConfig: {
    workLocations: [],
    workingTimes: [],
    shifts: [],
    associatedProfiles: [],
  },
};
