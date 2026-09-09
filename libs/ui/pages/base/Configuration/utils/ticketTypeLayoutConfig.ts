import { ITicketTypeLayoutConfig } from '@serviceops/interfaces';

export interface FieldOption {
  key: string;
  label: string;
}

export type { ITicketTypeLayoutConfig };

// ── Custom field support ────────────────────────────────────

/** Prefix applied to all custom field keys (e.g. "cf_abc123"). */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Returns true if the given key belongs to a custom field.
 * Custom field keys always start with {@link CUSTOM_FIELD_PREFIX}.
 */
export function isCustomFieldKey(key: string): boolean {
  return key.startsWith(CUSTOM_FIELD_PREFIX);
}

/**
 * Generates a unique field key for a new custom field.
 */
export function generateCustomFieldKey(id: string): string {
  return `${CUSTOM_FIELD_PREFIX}${id}`;
}

// ─────────────────────────────────────────────────────────────
// FIELD CATALOGS
// ─────────────────────────────────────────────────────────────

// ── INFO BAR (top status strip) ──
export const INFO_BAR_FIELDS: FieldOption[] = [
  { key: 'affectedUser', label: 'Affected user' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'queue', label: 'Queue' },
  { key: 'assignedTo', label: 'Assigned to' },
  { key: 'due', label: 'Due' },
  { key: 'eta', label: 'ETA' },
  { key: 'sla', label: 'SLA' },
  { key: 'created', label: 'Created' },
  { key: 'createdBy', label: 'Created by' },
  { key: 'lastUpdated', label: 'Last updated' },
  { key: 'updatedBy', label: 'Updated by' },
];

// ── SIDE BAR (left navigation) ──
export const SIDE_BAR_SECTION_FIELDS: FieldOption[] = [
  { key: 'created', label: 'Created by' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'ticketOptions', label: 'Ticket options' },
  { key: 'contactAndBilling', label: 'Contact & Billing' },
  { key: 'reporting', label: 'Reporting' },
  { key: 'datesAndUsers', label: 'Dates & Users' },
  { key: 'additionalFields', label: 'Additional fields' },
];

// ── TICKET OPTIONS ──
export const TICKET_OPTIONS_FIELDS: FieldOption[] = [
  { key: 'isMajor', label: 'Major Ticket' },
  { key: 'isRecurring', label: 'Recurring Ticket' },
  { key: 'isReleaseManagement', label: 'Release Management' },
  { key: 'recurringIssue', label: 'Recurring issue' },
  { key: 'customerConfirmation', label: 'Customer confirmation' },
];

// ── ASSIGNMENT (side tab) ──
export const ASSIGNMENT_FIELDS: FieldOption[] = [
  { key: 'assignedTo', label: 'Assigned to' },
  { key: 'queue', label: 'Queue' },
  { key: 'assignmentGroup', label: 'Assignment Group' },
  { key: 'secondaryResource', label: 'Secondary Resource' },
];

// ── CONTACT & BILLING (side tab) ──
export const CONTACT_AND_BILLING_FIELDS: FieldOption[] = [
  { key: 'clients', label: 'Clients' },
  { key: 'clientContacts', label: 'Client contacts' },
  { key: 'billingCode', label: 'Billing code' },
  { key: 'approvedEstimatesHHMM', label: 'Approved estimates (HH:MM)' },
  { key: 'estimatesDetails', label: 'Estimates details' },
  { key: 'timeSpentBillableHHMM', label: 'Time spent - Billable (HH:MM)' },
  { key: 'timeSpentNonBillableHHMM', label: 'Time spent - Non-billable (HH:MM)' },
  { key: 'remainingEstimatesHHMM', label: 'Remaining Estimates (HH:MM)' },
];

// ── REPORTING (side tab) ──
export const REPORTING_FIELDS: FieldOption[] = [
  { key: 'analysisSummary', label: 'Analysis summary' },
  { key: 'businessServiceLine', label: 'Business service line' },
  { key: 'application', label: 'Application' },
  { key: 'applicationCategory', label: 'Application Category' },
  { key: 'applicationSubCategory', label: 'Application Sub-category' },
];

// ── DATES & USERS (side tab) ──
export const DATES_AND_USERS_FIELDS: FieldOption[] = [
  { key: 'resolvedDateTime', label: 'Resolved date and time' },
  { key: 'resolvedBy', label: 'Resolved by' },
  { key: 'closedDateTime', label: 'Closed date and time' },
  { key: 'closedBy', label: 'Closed by' },
  { key: 'reopenedDateTime', label: 'Reopened date and time' },
  { key: 'reopenedBy', label: 'Reopened by' },
  { key: 'approvedDateTime', label: 'Approved date and time' },
  { key: 'approvedBy', label: 'Approved by' },
];

// ── ADDITIONAL FIELDS (side tab) ──
export const ADDITIONAL_FIELDS_FIELDS: FieldOption[] = [
  { key: 'resolutionCode', label: 'Resolution Code' },
  { key: 'resolution', label: 'Resolution' },
  { key: 'resolutionInternalNote', label: 'Resolution - Internal note' },
  { key: 'rootCauseIdentified', label: 'Root cause Identified' },
  { key: 'rootCauseCode', label: 'Root cause code' },
  { key: 'rootCause', label: 'Root cause' },
];

// ─────────────────────────────────────────────────────────────
// DETAILS CORE FIELDS (the central ticket content) ──
// ─────────────────────────────────────────────────────────────

export const DETAILS_CORE_FIELDS: FieldOption[] = [
  { key: 'ticketId', label: 'Ticket ID' },
  { key: 'ticketTitle', label: 'Ticket title' },
  { key: 'description', label: 'Description' },
  { key: 'impact', label: 'Impact' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'priorityChangeReasonCode', label: 'Priority change reason code' },
  { key: 'priorityChangeNote', label: 'Internal note' },
  { key: 'cancellationReasonCode', label: 'Cancellation reason code' },
  { key: 'cancellationComment', label: 'Cancellation comment' },
  { key: 'reopenReasonCode', label: 'Reopen reason code' },
  { key: 'reopenComment', label: 'Reopen comment' },
  { key: 'ticketConvertedFrom', label: 'Ticket converted from' },
  { key: 'conversionReasonCode', label: 'Conversion reason code' },
  { key: 'conversionComment', label: 'Conversion comment' },
];

// ─────────────────────────────────────────────────────────────
// CHANGE / RELEASE MANAGEMENT FIELDS ──
// ─────────────────────────────────────────────────────────────

export const DETAILS_CHANGE_FIELDS: FieldOption[] = [
  { key: 'changeType', label: 'Change type' },
  { key: 'justificationOfChange', label: 'Justification of change' },
  { key: 'currentProcessAsIs', label: 'Current Process (AS-IS)' },
  { key: 'proposedProcessToBe', label: 'Proposed Process (TO-BE)' },
  { key: 'changeRiskImpactAnalysis', label: 'Change - Risk and Impact analysis' },
  { key: 'backoutPlan', label: 'Backout plan' },
  { key: 'testPlan', label: 'Test plan' },
  { key: 'testResults', label: 'Test results' },
  { key: 'accessRequirements', label: 'Access requirements' },
  { key: 'productOwner', label: 'Product owner' },
];

// ─────────────────────────────────────────────────────────────
// VENDOR / BUG FIELDS ──
// ─────────────────────────────────────────────────────────────

export const DETAILS_VENDOR_FIELDS: FieldOption[] = [
  { key: 'knownError', label: 'Known error' },
  { key: 'productBugFix', label: 'Product bug fix' },
  { key: 'productBugId', label: 'Product bug id' },
  { key: 'vendorName', label: 'Vendor name' },
  { key: 'bugDetails', label: 'Bug details' },
  { key: 'vendorTicketReference', label: 'Vendor ticket reference' },
];

// ─────────────────────────────────────────────────────────────
// CHANGE CONTROL (CAB) FIELDS ──
export const DETAILS_CAB_FIELDS: FieldOption[] = [
  { key: 'cabApprovalRequired', label: 'CAB approval required' },
  { key: 'cabId', label: 'CAB ID' },
  { key: 'testCompleted', label: 'Test completed' },
  { key: 'testEvidenceRetained', label: 'Test evidence retained' },
  { key: 'proposedStartDate', label: 'Proposed start date' },
  { key: 'proposedEndDate', label: 'Proposed end date' },
  { key: 'actualStartDate', label: 'Actual start date' },
  { key: 'actualEndDate', label: 'Actual end date' },
];

// ─────────────────────────────────────────────────────────────
// RESOLUTION / WORKAROUND FIELDS ──
export const DETAILS_RESOLUTION_FIELDS: FieldOption[] = [
  { key: 'userResponse', label: 'User response' },
  { key: 'workAround', label: 'Work around' },
  { key: 'rootCauseAnalysis', label: 'Root cause analysis' },
  { key: 'workAroundRisk', label: 'Work around - Risk' },
  { key: 'relatedTicket', label: 'Related ticket' },
  { key: 'relatedTicketId', label: 'Related ticket ID' },
  { key: 'numberOfTimesReopened', label: 'Number of times reopened' },
];

// ─────────────────────────────────────────────────────────────
// CREATE TICKET FIELD CATALOGS — fields that appear on the
// Create Ticket form, organized by section.
// ─────────────────────────────────────────────────────────────

// ── TICKET INFORMATION ──
// Only fields that have a corresponding formik field in the Create Ticket form
// are included here. Fields used only on the Ticket Details page are excluded.
export const CREATE_TICKET_TICKET_INFORMATION_FIELDS: FieldOption[] = [
  { key: 'client', label: 'Client' },
  { key: 'caller', label: 'Affected User' },
  { key: 'callerFirstName', label: 'First Name' },
  { key: 'callerLastName', label: 'Last Name / Family Name' },
  { key: 'callerPhone', label: 'Phone Number' },
  { key: 'callerEmail', label: 'Work Email' },
  { key: 'callerLocation', label: 'Work Location' },
  { key: 'callerDepartment', label: 'Department' },
  { key: 'callerReportingManager', label: 'Reporting Manager' },
  { key: 'additionalContacts', label: 'Additional Contact(s)' },
];

// ── CATEGORIZATION ──
export const CREATE_TICKET_CATEGORIZATION_FIELDS: FieldOption[] = [
  { key: 'businessCategory', label: 'Business category' },
  { key: 'serviceLine', label: 'Service Line' },
  { key: 'application', label: 'Application' },
  { key: 'applicationCategory', label: 'Application Category' },
  { key: 'applicationSubCategory', label: 'Application Sub-category' },
];

// ── DESCRIPTION ──
export const CREATE_TICKET_DESCRIPTION_FIELDS: FieldOption[] = [
  { key: 'shortDescription', label: 'Short Description / Title' },
  { key: 'description', label: 'Description' },
  { key: 'isMajor', label: 'Major Ticket' },
  { key: 'isRecurring', label: 'Recurring Ticket' },
];

// ── ADDITIONAL DETAILS ──
export const CREATE_TICKET_ADDITIONAL_DETAILS_FIELDS: FieldOption[] = [
  { key: 'isMajor', label: 'Major Ticket' },
  { key: 'isRecurring', label: 'Recurring issue' },
  { key: 'isReleaseManagement', label: 'Release Management' },
  { key: 'notes', label: 'Notes' },
  { key: 'relatedRecords', label: 'Related ticket' },
  { key: 'relatedTicketId', label: 'Related ticket ID' },
];

// ── PRIORITY AND ASSIGNMENT ──
export const CREATE_TICKET_PRIORITY_ASSIGNMENT_FIELDS: FieldOption[] = [
  { key: 'impact', label: 'Impact' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'assignmentGroup', label: 'Assignment Group' },
  { key: 'primaryResource', label: 'Primary Resource' },
  { key: 'secondaryResources', label: 'Secondary Resource(s)' },
];

// ── AUDIT INFORMATION ──
export const CREATE_TICKET_AUDIT_INFORMATION_FIELDS: FieldOption[] = [
  { key: 'createdBy', label: 'Created by' },
  { key: 'channel', label: 'Channel' },
];

// ── ATTACHMENTS ──
export const CREATE_TICKET_ATTACHMENTS_FIELDS: FieldOption[] = [
  { key: 'attachments', label: 'Attachments' },
];

// ─────────────────────────────────────────────────────────────
// DEFAULT + MERGE HELPERS
// ─────────────────────────────────────────────────────────────

const allKeys = (fields: FieldOption[]) => fields.map((f) => f.key);

// Defaults: only fields that are actually rendered in the Create Ticket form
// are pre-selected in their section. All others remain in the Remaining Fields pool.
const defaultCreateTicketConfig = {
  ticketInformation: {
    selectedFields: [
      'client',
      'caller',
      'additionalContacts',
      'callerFirstName',
      'callerLastName',
      'callerPhone',
      'callerEmail',
      'callerLocation',
      'callerDepartment',
      'callerReportingManager',
    ],
  },
  categorization: {
    selectedFields: allKeys(CREATE_TICKET_CATEGORIZATION_FIELDS),
  },
  description: {
    selectedFields: ['shortDescription', 'description', 'isMajor', 'isRecurring'],
  },
  priorityAssignment: {
    selectedFields: [
      'priority',
      'status',
      'impact',
      'urgency',
      'assignmentGroup',
      'primaryResource',
      'secondaryResources',
    ],
  },
  auditInformation: {
    selectedFields: ['createdBy', 'channel'],
  },
  attachments: {
    selectedFields: ['attachments'],
  },
  additionalDetails: {
    selectedFields: allKeys(CREATE_TICKET_ADDITIONAL_DETAILS_FIELDS),
  },
};

// Known section labels — used as fallback when a stored config has no sectionTitle.
const KNOWN_SECTION_LABELS: Record<string, string> = {
  infoBar: 'Info Bar',
  sideBar: 'Side Bar',
  ticketOptions: 'Ticket Options',
  assignment: 'Assignment',
  contactAndBilling: 'Contact & Billing',
  reporting: 'Reporting',
  datesAndUsers: 'Dates & Users',
  additionalFields: 'Additional Fields',
  ticketCore: 'Ticket Core',
  changeManagement: 'Change Management',
  vendorBug: 'Vendor / Bug',
  changeControl: 'Change Control (CAB)',
  resolutionWorkaround: 'Resolution / Workaround',
  ticketInformation: 'Ticket Information',
  categorization: 'Categorization',
  description: 'Description',
  additionalDetails: 'Additional Details',
  priorityAssignment: 'Priority & Assignment',
  auditInformation: 'Audit Information',
  attachments: 'Attachments',
};

// Mirrors the fields shown before this configuration existed, so a ticket
// type with no saved layout (or a legacy row saved before a section was
// added) still renders exactly as before.
export function getDefaultLayoutConfig(createTicketSections?: string[]): ITicketTypeLayoutConfig {
  return {
    infoBar: {
      selectedFields: [
        'affectedUser',
        'status',
        'priority',
        'queue',
        'assignedTo',
        'due',
        'sla',
        'eta',
      ],
      maxFields: 8,
      sectionTitle: 'Info Bar',
    },
    sideBar: { selectedFields: allKeys(SIDE_BAR_SECTION_FIELDS), sectionTitle: 'Side Bar' },
    ticketOptions: {
      selectedFields: allKeys(TICKET_OPTIONS_FIELDS),
      sectionTitle: 'Ticket Options',
    },
    assignment: { selectedFields: allKeys(ASSIGNMENT_FIELDS), sectionTitle: 'Assignment' },
    contactAndBilling: {
      selectedFields: allKeys(CONTACT_AND_BILLING_FIELDS),
      sectionTitle: 'Contact & Billing',
    },
    reporting: { selectedFields: allKeys(REPORTING_FIELDS), sectionTitle: 'Reporting' },
    datesAndUsers: {
      selectedFields: allKeys(DATES_AND_USERS_FIELDS),
      sectionTitle: 'Dates & Users',
    },
    additionalFields: {
      selectedFields: allKeys(ADDITIONAL_FIELDS_FIELDS),
      sectionTitle: 'Additional Fields',
    },
    ticketCore: { selectedFields: allKeys(DETAILS_CORE_FIELDS), sectionTitle: 'Ticket Core' },
    changeManagement: {
      selectedFields: allKeys(DETAILS_CHANGE_FIELDS),
      sectionTitle: 'Change Management',
    },
    vendorBug: { selectedFields: allKeys(DETAILS_VENDOR_FIELDS), sectionTitle: 'Vendor / Bug' },
    changeControl: {
      selectedFields: allKeys(DETAILS_CAB_FIELDS),
      sectionTitle: 'Change Control (CAB)',
    },
    resolutionWorkaround: {
      selectedFields: allKeys(DETAILS_RESOLUTION_FIELDS),
      sectionTitle: 'Resolution / Workaround',
    },
    createTicket: {
      ticketInformation: {
        selectedFields: [
          'client',
          'caller',
          'additionalContacts',
          'callerFirstName',
          'callerLastName',
          'callerPhone',
          'callerEmail',
          'callerLocation',
          'callerDepartment',
          'callerReportingManager',
        ],
        sectionTitle: 'Ticket Information',
      },
      categorization: {
        selectedFields: allKeys(CREATE_TICKET_CATEGORIZATION_FIELDS),
        sectionTitle: 'Categorization',
      },
      description: {
        selectedFields: ['shortDescription', 'description', 'isMajor', 'isRecurring'],
        sectionTitle: 'Description',
      },
      additionalDetails: {
        selectedFields: allKeys(CREATE_TICKET_ADDITIONAL_DETAILS_FIELDS),
        sectionTitle: 'Additional Details',
      },
      priorityAssignment: {
        selectedFields: [
          'priority',
          'status',
          'impact',
          'urgency',
          'assignmentGroup',
          'primaryResource',
          'secondaryResources',
        ],
        sectionTitle: 'Priority & Assignment',
      },
      auditInformation: {
        selectedFields: ['createdBy', 'channel'],
        sectionTitle: 'Audit Information',
      },
      attachments: {
        selectedFields: ['attachments'],
        sectionTitle: 'Attachments',
      },
    },
  };
}


/**
 * Fills in any section missing from a ticket type's saved layoutConfig
 * (e.g. persisted before a new section existed, or never saved) with the
 * default for that section, so callers always get a complete config.
 */
export function mergeLayoutConfig(
  stored: ITicketTypeLayoutConfig | null | undefined,
): ITicketTypeLayoutConfig {
  const base = getDefaultLayoutConfig();
  if (!stored) return base;

  return {
    infoBar: {
      selectedFields: stored.infoBar?.selectedFields ?? base.infoBar.selectedFields,
      maxFields: stored.infoBar?.maxFields ?? base.infoBar.maxFields,
      sectionTitle: stored.infoBar?.sectionTitle ?? base.infoBar.sectionTitle,
    },
    sideBar: {
      selectedFields: stored.sideBar?.selectedFields ?? base.sideBar.selectedFields,
      sectionTitle: stored.sideBar?.sectionTitle ?? base.sideBar.sectionTitle,
    },
    ticketOptions: {
      selectedFields: stored.ticketOptions?.selectedFields ?? base.ticketOptions.selectedFields,
      sectionTitle: stored.ticketOptions?.sectionTitle ?? base.ticketOptions.sectionTitle,
    },
    assignment: {
      selectedFields: stored.assignment?.selectedFields ?? base.assignment.selectedFields,
      sectionTitle: stored.assignment?.sectionTitle ?? base.assignment.sectionTitle,
    },
    contactAndBilling: {
      selectedFields:
        stored.contactAndBilling?.selectedFields ?? base.contactAndBilling.selectedFields,
      sectionTitle: stored.contactAndBilling?.sectionTitle ?? base.contactAndBilling.sectionTitle,
    },
    reporting: {
      selectedFields: stored.reporting?.selectedFields ?? base.reporting.selectedFields,
      sectionTitle: stored.reporting?.sectionTitle ?? base.reporting.sectionTitle,
    },
    datesAndUsers: {
      selectedFields:
        stored.datesAndUsers?.selectedFields ?? base.datesAndUsers.selectedFields,
      sectionTitle: stored.datesAndUsers?.sectionTitle ?? base.datesAndUsers.sectionTitle,
    },
    additionalFields: {
      selectedFields:
        stored.additionalFields?.selectedFields ?? base.additionalFields.selectedFields,
      sectionTitle: stored.additionalFields?.sectionTitle ?? base.additionalFields.sectionTitle,
    },
    ticketCore: {
      selectedFields: stored.ticketCore?.selectedFields ?? base.ticketCore.selectedFields,
      sectionTitle: stored.ticketCore?.sectionTitle ?? base.ticketCore.sectionTitle,
    },
    changeManagement: {
      selectedFields:
        stored.changeManagement?.selectedFields ?? base.changeManagement.selectedFields,
      sectionTitle: stored.changeManagement?.sectionTitle ?? base.changeManagement.sectionTitle,
    },
    vendorBug: {
      selectedFields: stored.vendorBug?.selectedFields ?? base.vendorBug.selectedFields,
      sectionTitle: stored.vendorBug?.sectionTitle ?? base.vendorBug.sectionTitle,
    },
    changeControl: {
      selectedFields: stored.changeControl?.selectedFields ?? base.changeControl.selectedFields,
      sectionTitle: stored.changeControl?.sectionTitle ?? base.changeControl.sectionTitle,
    },
    resolutionWorkaround: {
      selectedFields:
        stored.resolutionWorkaround?.selectedFields ?? base.resolutionWorkaround.selectedFields,
      sectionTitle:
        stored.resolutionWorkaround?.sectionTitle ?? base.resolutionWorkaround.sectionTitle,
    },
    createTicket: {
      ticketInformation: {
        selectedFields:
          stored.createTicket?.ticketInformation?.selectedFields ??
          defaultCreateTicketConfig.ticketInformation.selectedFields,
        sectionTitle:
          stored.createTicket?.ticketInformation?.sectionTitle ??
          base.createTicket.ticketInformation.sectionTitle,
      },
      categorization: {
        selectedFields:
          stored.createTicket?.categorization?.selectedFields ??
          defaultCreateTicketConfig.categorization.selectedFields,
        sectionTitle:
          stored.createTicket?.categorization?.sectionTitle ??
          base.createTicket.categorization.sectionTitle,
      },
      description: {
        selectedFields:
          stored.createTicket?.description?.selectedFields ??
          defaultCreateTicketConfig.description.selectedFields,
        sectionTitle:
          stored.createTicket?.description?.sectionTitle ??
          base.createTicket.description.sectionTitle,
      },
      additionalDetails: {
        selectedFields:
          stored.createTicket?.additionalDetails?.selectedFields ??
          defaultCreateTicketConfig.additionalDetails.selectedFields,
        sectionTitle:
          stored.createTicket?.additionalDetails?.sectionTitle ??
          base.createTicket.additionalDetails.sectionTitle,
      },
      priorityAssignment: {
        selectedFields:
          stored.createTicket?.priorityAssignment?.selectedFields ??
          defaultCreateTicketConfig.priorityAssignment.selectedFields,
        sectionTitle:
          stored.createTicket?.priorityAssignment?.sectionTitle ??
          base.createTicket.priorityAssignment.sectionTitle,
      },
      auditInformation: {
        selectedFields:
          stored.createTicket?.auditInformation?.selectedFields ??
          defaultCreateTicketConfig.auditInformation.selectedFields,
        sectionTitle:
          stored.createTicket?.auditInformation?.sectionTitle ??
          base.createTicket.auditInformation.sectionTitle,
      },
      attachments: {
        selectedFields:
          stored.createTicket?.attachments?.selectedFields ??
          defaultCreateTicketConfig.attachments.selectedFields,
        sectionTitle:
          stored.createTicket?.attachments?.sectionTitle ??
          base.createTicket.attachments.sectionTitle,
      },
    },
    customSections: stored.customSections,
  };
}

/** Orders and truncates a field list according to a section's saved config. */
export function applyFieldConfig<T extends { key: string }>(
  items: T[],
  selectedFields: string[],
  maxFields?: number,
): T[] {
  const byKey = new Map(items.map((item) => [item.key, item]));
  const ordered = selectedFields.map((key) => byKey.get(key)).filter((item): item is T => !!item);
  return typeof maxFields === 'number' ? ordered.slice(0, maxFields) : ordered;
}
