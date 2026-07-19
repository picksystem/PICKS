import { ITicketTypeLayoutConfig } from '@serviceops/interfaces';

export interface FieldOption {
  key: string;
  label: string;
}

export type { ITicketTypeLayoutConfig };

// ─────────────────────────────────────────────────────────────
// FIELD CATALOGS — the full set of fields that can be placed on
// each section of the Ticket Detail screen.
// ─────────────────────────────────────────────────────────────

export const INFO_BAR_FIELDS: FieldOption[] = [
  { key: 'affectedUser', label: 'Affected User' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'queue', label: 'Queue' },
  { key: 'assignedTo', label: 'Assigned to' },
  { key: 'due', label: 'Due' },
  { key: 'sla', label: 'SLA' },
  { key: 'eta', label: 'ETA' },
  { key: 'client', label: 'Client' },
  { key: 'clientContacts', label: 'Client contacts' },
  { key: 'created', label: 'Created' },
  { key: 'lastUpdated', label: 'Last updated' },
];

export const SIDE_BAR_SECTION_FIELDS: FieldOption[] = [
  { key: 'created', label: 'Created' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'ticketOptions', label: 'Ticket Options' },
  { key: 'contactAndBilling', label: 'Contact and Billing' },
  { key: 'reporting', label: 'Reporting' },
  { key: 'datesAndUsers', label: 'Dates and Users' },
  { key: 'additionalFields', label: 'Additional Fields' },
];

export const TICKET_OPTIONS_FIELDS: FieldOption[] = [
  { key: 'isMajor', label: 'Major Ticket' },
  { key: 'isRecurring', label: 'Recurring Ticket' },
  { key: 'isReleaseManagement', label: 'Release Management' },
];

export const ASSIGNMENT_FIELDS: FieldOption[] = [
  { key: 'client', label: 'Client' },
  { key: 'assignmentGroup', label: 'Assignment Group' },
  { key: 'secondaryResource', label: 'Secondary Resource' },
  { key: 'lastUpdated', label: 'Last Updated' },
];

export const CONTACT_AND_BILLING_FIELDS: FieldOption[] = [
  { key: 'clientPrimaryContact', label: 'Client Primary Contact' },
  { key: 'additionalContacts', label: 'Additional Contact(s)' },
  { key: 'billingCode', label: 'Billing Code' },
  { key: 'approvedEstimatesHours', label: 'Approved Estimates (hrs)' },
  { key: 'estimatesDetails', label: 'Estimates Details' },
  { key: 'timeSpentBillable', label: 'Time Spent (Billable hrs)' },
  { key: 'timeSpentNonBillable', label: 'Time Spent (Non-Billable hrs)' },
  { key: 'remainingHours', label: 'Remaining Hours' },
];

export const REPORTING_FIELDS: FieldOption[] = [
  { key: 'analysisSummary', label: 'Analysis Summary' },
  { key: 'serviceLine', label: 'Business Service-Line' },
  { key: 'application', label: 'Application' },
  { key: 'applicationCategory', label: 'Application Category' },
  { key: 'applicationSubCategory', label: 'Application Sub-Category' },
  { key: 'ticketSource', label: 'Ticket Source' },
];

export const DATES_AND_USERS_FIELDS: FieldOption[] = [
  { key: 'resolvedAt', label: 'Resolved Date and Time' },
  { key: 'resolvedBy', label: 'Resolved By' },
  { key: 'closedAt', label: 'Closed Date and Time' },
  { key: 'closedBy', label: 'Closed By' },
  { key: 'reopenedAt', label: 'Reopened Date and Time' },
  { key: 'reopenedBy', label: 'Reopened By' },
  { key: 'approvedAt', label: 'Approved Date and Time' },
  { key: 'approvedBy', label: 'Approved By' },
];

export const ADDITIONAL_FIELDS_FIELDS: FieldOption[] = [
  { key: 'timeSpentBillable', label: 'Time Spent (Billable hrs)' },
  { key: 'timeSpentNonBillable', label: 'Time Spent (Non-Billable hrs)' },
  { key: 'variance', label: 'Variance' },
];

const allKeys = (fields: FieldOption[]) => fields.map((f) => f.key);

// Mirrors the fields shown before this configuration existed, so a ticket
// type with no saved layout (or a legacy row saved before a section was
// added) still renders exactly as before.
export function getDefaultLayoutConfig(): ITicketTypeLayoutConfig {
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
    },
    sideBar: { selectedFields: allKeys(SIDE_BAR_SECTION_FIELDS) },
    ticketOptions: { selectedFields: allKeys(TICKET_OPTIONS_FIELDS) },
    assignment: { selectedFields: allKeys(ASSIGNMENT_FIELDS) },
    contactAndBilling: { selectedFields: allKeys(CONTACT_AND_BILLING_FIELDS) },
    reporting: { selectedFields: allKeys(REPORTING_FIELDS) },
    datesAndUsers: { selectedFields: allKeys(DATES_AND_USERS_FIELDS) },
    additionalFields: { selectedFields: allKeys(ADDITIONAL_FIELDS_FIELDS) },
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
    },
    sideBar: { selectedFields: stored.sideBar?.selectedFields ?? base.sideBar.selectedFields },
    ticketOptions: {
      selectedFields: stored.ticketOptions?.selectedFields ?? base.ticketOptions.selectedFields,
    },
    assignment: {
      selectedFields: stored.assignment?.selectedFields ?? base.assignment.selectedFields,
    },
    contactAndBilling: {
      selectedFields:
        stored.contactAndBilling?.selectedFields ?? base.contactAndBilling.selectedFields,
    },
    reporting: {
      selectedFields: stored.reporting?.selectedFields ?? base.reporting.selectedFields,
    },
    datesAndUsers: {
      selectedFields: stored.datesAndUsers?.selectedFields ?? base.datesAndUsers.selectedFields,
    },
    additionalFields: {
      selectedFields:
        stored.additionalFields?.selectedFields ?? base.additionalFields.selectedFields,
    },
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
