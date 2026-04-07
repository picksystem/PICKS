/**
 * Admin Incident Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Enums for dropdowns
// ============================================
export enum IncidentImpact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum IncidentUrgency {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum IncidentChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  PORTAL = 'portal',
  CHAT = 'chat',
  WALK_IN = 'walk_in',
}

export enum IncidentPriority {
  CRITICAL = '1-Critical',
  HIGH = '2-High',
  MEDIUM = '3-Medium',
  LOW = '4-Low',
  PLANNING = '5-Planning',
}

export enum IncidentStatus {
  DRAFT = 'draft',
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  ASSIGNED = 'assigned',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum PriorityChangeReasonCode {
  BUSINESS_IMPACT_REASSESSMENT = 'business_impact_reassessment',
  CUSTOMER_ESCALATION = 'customer_escalation',
  MANAGEMENT_OVERRIDE = 'management_override',
  SLA_BREACH_RISK = 'sla_breach_risk',
  SCOPE_CHANGE = 'scope_change',
  NEW_INFORMATION = 'new_information',
  ERROR_CORRECTION = 'error_correction',
  OTHER = 'other',
}

export enum ResolutionCode {
  PERMANENT_FIX = 'permanent_fix',
  WORKAROUND = 'workaround',
  KNOWN_ERROR = 'known_error',
  DUPLICATE = 'duplicate',
  NOT_REPRODUCIBLE = 'not_reproducible',
  USER_ERROR = 'user_error',
  CONFIGURATION_CHANGE = 'configuration_change',
  SOFTWARE_UPDATE = 'software_update',
  HARDWARE_REPLACEMENT = 'hardware_replacement',
  THIRD_PARTY_FIX = 'third_party_fix',
  OTHER = 'other',
}

export enum ActivityType {
  STATUS_CHANGE = 'status_change',
  PRIORITY_CHANGE = 'priority_change',
  ASSIGNMENT_CHANGE = 'assignment_change',
  COMMENT_ADDED = 'comment_added',
  TIME_ENTRY_ADDED = 'time_entry_added',
  RESOLUTION_ADDED = 'resolution_added',
  ATTACHMENT_ADDED = 'attachment_added',
  FIELD_UPDATE = 'field_update',
  FOLLOW_ADDED = 'follow_added',
  ESCALATION = 'escalation',
}

/**
 * Calculate priority based on impact and urgency matrix
 */
export const calculatePriority = (
  impact: IncidentImpact,
  urgency: IncidentUrgency,
): IncidentPriority => {
  const matrix: Record<IncidentImpact, Record<IncidentUrgency, IncidentPriority>> = {
    [IncidentImpact.HIGH]: {
      [IncidentUrgency.HIGH]: IncidentPriority.CRITICAL,
      [IncidentUrgency.MEDIUM]: IncidentPriority.HIGH,
      [IncidentUrgency.LOW]: IncidentPriority.MEDIUM,
    },
    [IncidentImpact.MEDIUM]: {
      [IncidentUrgency.HIGH]: IncidentPriority.HIGH,
      [IncidentUrgency.MEDIUM]: IncidentPriority.MEDIUM,
      [IncidentUrgency.LOW]: IncidentPriority.LOW,
    },
    [IncidentImpact.LOW]: {
      [IncidentUrgency.HIGH]: IncidentPriority.MEDIUM,
      [IncidentUrgency.MEDIUM]: IncidentPriority.LOW,
      [IncidentUrgency.LOW]: IncidentPriority.PLANNING,
    },
  };
  return matrix[impact][urgency];
};

// ============================================
// Entity Interface - Core data structure
// ============================================
export interface IIncident {
  id: number;
  number: string; // Alphanumeric ticket number (e.g., INC0001234)
  client: string | null;
  caller: string;
  callerPhone: string | null;
  callerEmail: string | null;
  callerLocation: string | null;
  callerDepartment: string | null;
  callerReportingManager: string | null;
  additionalContacts: string | null;
  businessCategory: string | null;
  serviceLine: string | null;
  application: string | null;
  applicationCategory: string | null;
  applicationSubCategory: string | null;
  shortDescription: string | null;
  description: string | null;
  impact: IncidentImpact | null;
  urgency: IncidentUrgency | null;
  priority: string | null;
  channel: IncidentChannel | null;
  status: IncidentStatus;
  assignmentGroup: string | null;
  primaryResource: string | null;
  secondaryResources: string | null;
  createdAt: Date;
  createdBy: string;
  isRecurring: boolean;
  isMajor: boolean;
  isReleaseManagement: boolean;
  eta: Date | null;
  notes: string | null;
  relatedRecords: string | null; // JSON string for related records
  attachments: string | null; // JSON string for attachments
  followers: string | null; // JSON string array of user emails
  internalFollowers: string | null; // JSON string array of user emails
  draftExpiresAt: Date | null;
  // Contact & Billing
  clientPrimaryContact: string | null;
  billingCode: string | null;
  approvedEstimatesHours: number | null;
  estimatesDetails: string | null;
  // Reporting
  analysisSummary: string | null;
  ticketSource: string | null;
  // Audit timestamps (system-set)
  resolvedAt: Date | null;
  resolvedBy: string | null;
  closedAt: Date | null;
  closedBy: string | null;
  reopenedAt: Date | null;
  reopenedBy: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  updatedAt: Date;
}

// ============================================
// Input Interfaces - For creating/updating
// ============================================
export interface ICreateIncidentInput {
  number?: string; // Optional - if provided, use this; otherwise generate
  client?: string;
  caller: string;
  callerPhone?: string;
  callerEmail?: string;
  callerLocation?: string;
  callerDepartment?: string;
  callerReportingManager?: string;
  additionalContacts?: string;
  businessCategory?: string;
  serviceLine?: string;
  application?: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  shortDescription?: string;
  description?: string;
  impact?: IncidentImpact;
  urgency?: IncidentUrgency;
  priority?: string;
  channel?: IncidentChannel;
  status?: IncidentStatus;
  assignmentGroup?: string;
  primaryResource?: string;
  secondaryResources?: string;
  createdBy: string;
  isRecurring?: boolean;
  isMajor?: boolean;
  isReleaseManagement?: boolean;
  eta?: string;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  followers?: string;
  internalFollowers?: string;
  draftExpiresAt?: string;
  // Contact & Billing
  clientPrimaryContact?: string;
  billingCode?: string;
  approvedEstimatesHours?: number;
  estimatesDetails?: string;
  // Reporting
  analysisSummary?: string;
  ticketSource?: string;
}

export interface IUpdateIncidentInput {
  client?: string;
  caller?: string;
  callerPhone?: string;
  callerEmail?: string;
  callerLocation?: string;
  callerDepartment?: string;
  additionalContacts?: string;
  businessCategory?: string;
  serviceLine?: string;
  application?: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  shortDescription?: string;
  description?: string;
  impact?: IncidentImpact;
  urgency?: IncidentUrgency;
  priority?: string;
  channel?: IncidentChannel;
  status?: IncidentStatus;
  assignmentGroup?: string;
  primaryResource?: string;
  secondaryResources?: string;
  isRecurring?: boolean;
  isMajor?: boolean;
  isReleaseManagement?: boolean;
  eta?: string;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  followers?: string;
  internalFollowers?: string;
  // Contact & Billing
  clientPrimaryContact?: string;
  billingCode?: string;
  approvedEstimatesHours?: number;
  estimatesDetails?: string;
  // Reporting
  analysisSummary?: string;
  ticketSource?: string;
}

// ============================================
// Sub-entity Interfaces
// ============================================
export interface IPriorityChangeInput {
  incidentId: number;
  previousImpact: IncidentImpact;
  previousUrgency: IncidentUrgency;
  previousPriority: string;
  newImpact: IncidentImpact;
  newUrgency: IncidentUrgency;
  newPriority: string;
  reasonCode: PriorityChangeReasonCode;
  note: string;
  attachment?: string;
  changedBy: string;
}

export interface IIncidentComment {
  id: number;
  incidentId: number;
  subject: string;
  message: string;
  isInternal: boolean;
  isSelfNote: boolean;
  notifyAssigneesOnly: boolean;
  status: IncidentStatus;
  attachments: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCommentInput {
  incidentId: number;
  subject: string;
  message: string;
  isInternal?: boolean;
  isSelfNote?: boolean;
  notifyAssigneesOnly?: boolean;
  status?: IncidentStatus;
  attachments?: string;
  createdBy: string;
}

export interface ITimeEntry {
  id: number;
  incidentId: number;
  date: string;
  hours: number;
  minutes: number;
  billingCode: string | null;
  activityTask: string | null;
  externalComment: string | null;
  internalComment: string | null;
  isNonBillable: boolean;
  attachments: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTimeEntryInput {
  incidentId: number;
  date: string;
  hours: number;
  minutes: number;
  billingCode?: string;
  activityTask?: string;
  externalComment?: string;
  internalComment?: string;
  isNonBillable?: boolean;
  attachments?: string;
  createdBy: string;
}

export interface IResolution {
  id: number;
  incidentId: number;
  application: string | null;
  category: string | null;
  subCategory: string | null;
  customerConfirmation: boolean;
  isRecurring: boolean;
  rootCauseIdentified: boolean;
  rootCause: string | null;
  resolutionCode: ResolutionCode;
  resolution: string;
  internalNote: string | null;
  attachments: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateResolutionInput {
  incidentId: number;
  application?: string;
  category?: string;
  subCategory?: string;
  customerConfirmation?: boolean;
  isRecurring?: boolean;
  rootCauseIdentified?: boolean;
  rootCause?: string;
  resolutionCode: ResolutionCode;
  resolution: string;
  internalNote?: string;
  attachments?: string;
  createdBy: string;
}

export interface IAssignIncidentInput {
  application?: string;
  assignmentGroup?: string;
  primaryResource: string;
  secondaryResources?: string;
}

export interface IActivityLog {
  id: number;
  incidentId: number;
  activityType: ActivityType;
  description: string;
  previousValue: string | null;
  newValue: string | null;
  performedBy: string;
  createdAt: Date;
}

// ============================================
// Sub-entity Response Interfaces
// ============================================
export interface ICommentListResponse {
  message: string;
  data: IIncidentComment[];
}

export interface ICommentResponse {
  message: string;
  data: IIncidentComment;
}

export interface ITimeEntryListResponse {
  message: string;
  data: ITimeEntry[];
}

export interface ITimeEntryResponse {
  message: string;
  data: ITimeEntry;
}

export interface IResolutionListResponse {
  message: string;
  data: IResolution[];
}

export interface IResolutionResponse {
  message: string;
  data: IResolution;
}

export interface IActivityLogListResponse {
  message: string;
  data: IActivityLog[];
}

// ============================================
// Response Interfaces - API responses
// ============================================
export interface IIncidentResponse {
  message: string;
  data: IIncident;
}

export interface IIncidentListResponse {
  message: string;
  data: IIncident[];
}

// ============================================
// Gateway Interface - Data access contract
// ============================================
export interface IIncidentGateway {
  create(data: ICreateIncidentInput & { number: string }): Promise<IIncident>;
  findAll(): Promise<IIncident[]>;
  findById(id: number): Promise<IIncident | null>;
  findByNumber(number: string): Promise<IIncident | null>;
  findByStatus(status: IncidentStatus): Promise<IIncident[]>;
  update(id: number, data: IUpdateIncidentInput): Promise<IIncident>;
  delete(id: number): Promise<IIncident>;
  getNextNumber(): Promise<string>;
  deleteExpiredDrafts(): Promise<number>;
}

// ============================================
// Use Case Interfaces - Business logic contracts
// ============================================
export interface ICreateIncidentUseCase {
  execute(input: ICreateIncidentInput): Promise<IIncident>;
}

export interface IGetIncidentUseCase {
  execute(id: number): Promise<IIncident>;
}

export interface IGetAllIncidentsUseCase {
  execute(): Promise<IIncident[]>;
}

export interface IUpdateIncidentUseCase {
  execute(id: number, input: IUpdateIncidentInput): Promise<IIncident>;
}

export interface IDeleteIncidentUseCase {
  execute(id: number): Promise<IIncident>;
}

export interface ICleanupExpiredDraftsUseCase {
  execute(): Promise<number>;
}
