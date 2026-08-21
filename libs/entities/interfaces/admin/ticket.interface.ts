// Unified ticket interfaces — all ticket types share the same schema.
// The `ticketType` field discriminates which Configuration type this record belongs to.

export interface IAdminTicket {
  id: number;
  number: string;
  ticketType: string;
  // Identity
  client?: string | null;
  caller: string;
  callerPhone?: string | null;
  callerEmail?: string | null;
  callerLocation?: string | null;
  callerDepartment?: string | null;
  callerReportingManager?: string | null;
  additionalContacts?: string | null;
  // Classification
  businessCategory?: string | null;
  serviceLine?: string | null;
  application?: string | null;
  applicationCategory?: string | null;
  applicationSubCategory?: string | null;
  // Core content
  shortDescription?: string | null;
  description?: string | null;
  // Priority / Impact
  impact?: string | null;
  urgency?: string | null;
  priority?: string | null;
  priorityChangeReasonCode?: string | null;
  priorityChangeNote?: string | null;
  // Assignment
  channel?: string | null;
  status: string;
  assignmentGroup?: string | null;
  queue?: string | null;
  primaryResource?: string | null;
  secondaryResources?: string | null;
  // SLA / Due dates
  dueDate?: Date | null;
  eta?: Date | null;
  sla?: string | null;
  // Time tracking
  approvedEstimatesHours?: number | null;
  estimatesDetails?: string | null;
  timeSpentBillable?: string | null;
  timeSpentNonBillable?: string | null;
  remainingEstimates?: string | null;
  // Lifecycle flags
  isRecurring: boolean;
  isMajor: boolean;
  isReleaseManagement: boolean;
  timesReopened: number;
  // Audit
  createdBy: string;
  updatedBy?: string | null;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  closedAt?: Date | null;
  closedBy?: string | null;
  reopenedAt?: Date | null;
  reopenedBy?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  // Cancellation
  cancellationReasonCode?: string | null;
  cancellationComment?: string | null;
  // Reopen tracking
  reopenReasonCode?: string | null;
  reopenComment?: string | null;
  // Conversion
  convertedFrom?: string | null;
  conversionReasonCode?: string | null;
  conversionComment?: string | null;
  // Change Management
  changeType?: string | null;
  changeJustification?: string | null;
  changeCurrentProcess?: string | null;
  changeProposedProcess?: string | null;
  changeRiskAnalysis?: string | null;
  changeBackoutPlan?: string | null;
  changeTestPlan?: string | null;
  changeTestResults?: string | null;
  changeAccessRequirements?: string | null;
  changeProductOwner?: string | null;
  changeKnownError?: string | null;
  changeProductBugFix: boolean;
  changeProductBugId?: string | null;
  changeVendorName?: string | null;
  changeBugDetails?: string | null;
  changeVendorTicketRef?: string | null;
  changeCabRequired: boolean;
  changeCabId?: string | null;
  changeTestCompleted: boolean;
  changeTestEvidence?: string | null;
  changeProposedStart?: Date | null;
  changeProposedEnd?: Date | null;
  changeActualStart?: Date | null;
  changeActualEnd?: Date | null;
  // Misc
  notes?: string | null;
  relatedRecords?: string | null;
  attachments?: string | null;
  followers?: string | null;
  internalFollowers?: string | null;
  draftExpiresAt?: Date | null;
  clientPrimaryContact?: string | null;
  billingCode?: string | null;
  analysisSummary?: string | null;
  ticketSource?: string | null;
  customFieldValues?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminTicketComment {
  id: number;
  ticketId: number;
  subject: string;
  message: string;
  isInternal: boolean;
  isSelfNote: boolean;
  notifyAssigneesOnly: boolean;
  isEmail?: boolean;
  isPinned: boolean;
  isSaved: boolean;
  status?: string | null;
  attachments?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminTicketTimeEntry {
  id: number;
  ticketId: number;
  date: string;
  hours: number;
  minutes: number;
  billingCode?: string | null;
  activityTask?: string | null;
  externalComment?: string | null;
  internalComment?: string | null;
  isNonBillable: boolean;
  attachments?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminTicketResolution {
  id: number;
  ticketId: number;
  application?: string | null;
  category?: string | null;
  subCategory?: string | null;
  customerConfirmation: boolean;
  isRecurring: boolean;
  rootCauseIdentified: boolean;
  rootCause?: string | null;
  resolutionCode: string;
  resolution: string;
  internalNote?: string | null;
  attachments?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminTicketActivity {
  id: number;
  ticketId: number;
  activityType: string;
  description: string;
  previousValue?: string | null;
  newValue?: string | null;
  performedBy: string;
  createdAt: Date;
}

export interface ICreateTicketInput {
  ticketType: string;
  number?: string;
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
  impact?: string;
  urgency?: string;
  priority?: string;
  priorityChangeReasonCode?: string;
  priorityChangeNote?: string;
  channel?: string;
  status?: string;
  assignmentGroup?: string;
  queue?: string;
  primaryResource?: string;
  secondaryResources?: string;
  createdBy: string;
  isRecurring?: boolean;
  isMajor?: boolean;
  isReleaseManagement?: boolean;
  dueDate?: string;
  eta?: string;
  sla?: string;
  approvedEstimatesHours?: number;
  estimatesDetails?: string;
  timeSpentBillable?: string;
  timeSpentNonBillable?: string;
  remainingEstimates?: string;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  followers?: string;
  internalFollowers?: string;
  draftExpiresAt?: string;
  clientPrimaryContact?: string;
  billingCode?: string;
  analysisSummary?: string;
  ticketSource?: string;
  // Cancellation
  cancellationReasonCode?: string;
  cancellationComment?: string;
  // Reopen
  reopenReasonCode?: string;
  reopenComment?: string;
  // Conversion
  convertedFrom?: string;
  conversionReasonCode?: string;
  conversionComment?: string;
  // Change Management
  changeType?: string;
  changeJustification?: string;
  changeCurrentProcess?: string;
  changeProposedProcess?: string;
  changeRiskAnalysis?: string;
  changeBackoutPlan?: string;
  changeTestPlan?: string;
  changeTestResults?: string;
  changeAccessRequirements?: string;
  changeProductOwner?: string;
  changeKnownError?: string;
  changeProductBugFix?: boolean;
  changeProductBugId?: string;
  changeVendorName?: string;
  changeBugDetails?: string;
  changeVendorTicketRef?: string;
  changeCabRequired?: boolean;
  changeCabId?: string;
  changeTestCompleted?: boolean;
  changeTestEvidence?: string;
  changeProposedStart?: string;
  changeProposedEnd?: string;
  changeActualStart?: string;
  changeActualEnd?: string;
  customFieldValues?: Record<string, string>;
}

export interface ITicketRef {
  ticketId: number;
}

export interface ITicketListParams {
  ticketType?: string;
  status?: string;
}

// ── Gateway interface ─────────────────────────────────────────────────────────

export interface IAdminTicketGateway {
  create(data: ICreateTicketInput): Promise<IAdminTicket>;
  findAll(filters?: { ticketType?: string; status?: string }): Promise<IAdminTicket[]>;
  findById(id: number): Promise<IAdminTicket | null>;
  findByNumber(number: string): Promise<IAdminTicket | null>;
  update(id: number, data: Partial<ICreateTicketInput>): Promise<IAdminTicket>;
  delete(id: number): Promise<IAdminTicket>;
  getDrafts(): Promise<IAdminTicket[]>;
  count(filters?: { ticketType?: string }): Promise<number>;
  generateNumber(ticketType: string): Promise<string>;
  // Sub-resources
  addComment(data: {
    ticketId: number;
    subject: string;
    message: string;
    isInternal?: boolean;
    isSelfNote?: boolean;
    notifyAssigneesOnly?: boolean;
    status?: string;
    attachments?: string;
    createdBy: string;
  }): Promise<IAdminTicketComment>;
  getComments(ticketId: number): Promise<IAdminTicketComment[]>;
  updateComment(id: number, data: { isPinned?: boolean; isSaved?: boolean }): Promise<IAdminTicketComment>;
  addTimeEntry(data: {
    ticketId: number;
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
  }): Promise<IAdminTicketTimeEntry>;
  getTimeEntries(ticketId: number): Promise<IAdminTicketTimeEntry[]>;
  addResolution(data: {
    ticketId: number;
    application?: string;
    category?: string;
    subCategory?: string;
    customerConfirmation?: boolean;
    isRecurring?: boolean;
    rootCauseIdentified?: boolean;
    rootCause?: string;
    resolutionCode: string;
    resolution: string;
    internalNote?: string;
    attachments?: string;
    createdBy: string;
  }): Promise<IAdminTicketResolution>;
  getResolutions(ticketId: number): Promise<IAdminTicketResolution[]>;
  addActivity(data: {
    ticketId: number;
    activityType: string;
    description: string;
    previousValue?: string;
    newValue?: string;
    performedBy: string;
  }): Promise<IAdminTicketActivity>;
  getActivities(ticketId: number): Promise<IAdminTicketActivity[]>;
  deleteExpiredDrafts(): Promise<number>;
}

// ── Use-case interfaces ───────────────────────────────────────────────────────

export interface ICreateTicketInput {
  // Same as the input type above — re-exported for convenience
}
