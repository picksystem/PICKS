/**
 * Centralized accordion descriptor registry for every configuration page.
 *
 * The inner nav sidebar reads this list to render accordion sub-items under
 * each page's top-level entry. ConfigPathPicker also reads this same list
 * for its Column 2 hierarchy. To add / remove / rename an accordion, update
 * this single file — both the sidebar and the dialog will pick it up
 * automatically.
 *
 * Each descriptor must stay in sync with the actual `id` prop on the rendered
 * accordion in the corresponding page section. The `id` is used as the DOM
 * anchor the sidebar scrolls to when the sub-item is clicked.
 */

export interface AccordionDescriptor {
  /** DOM id of the rendered accordion — also used as React key. */
  id: string;
  /** Sidebar sub-item / dialog column-2 label. */
  label: string;
  /** Short label for the chip icon in ConfigPathPicker's Column 2. */
  icon?: string;
}

export interface PageGroupMeta {
  label: string;
  color: string;
  icon: string;
}

/** Maps each configuration page key to its display metadata. */
export const PAGE_GROUP_META: Record<string, PageGroupMeta> = {
  general: { label: 'Admin Controls', color: '#1976d2', icon: 'G' },
  'ticket-types': { label: 'Ticket Types', color: '#dc2626', icon: 'TT' },
  priorities: { label: 'Priorities', color: '#7c3aed', icon: 'P' },
  statuses: { label: 'Statuses', color: '#16a34a', icon: 'S' },
  slas: { label: 'SLAs', color: '#d97706', icon: 'T' },
  categorization: { label: 'Categorization', color: '#0891b2', icon: 'C' },
  'consultant-profiles': { label: 'Consultant Profiles', color: '#be185d', icon: 'CP' },
  approvals: { label: 'Approvals', color: '#b45309', icon: 'A' },
  'user-config': { label: 'User Config', color: '#0d9488', icon: 'WL' },
  templates: { label: 'Templates', color: '#4f46e5', icon: 'TP' },
  'reason-codes': { label: 'Reason Codes', color: '#dc2626', icon: 'RC' },
  calendars: { label: 'Calendars', color: '#d97706', icon: 'CA' },
  timesheets: { label: 'Timesheets', color: '#2563eb', icon: 'TS' },
  expenses: { label: 'Expenses', color: '#059669', icon: 'EX' },
};

export const getPageGroupMeta = (key: string): PageGroupMeta | undefined => PAGE_GROUP_META[key];

/**
 * Maps each configuration page (matched by its path key from NAV_ITEMS)
 * to the list of accordions rendered on that page.
 *
 * If a page has no entry here, the sidebar simply shows no sub-items for it.
 */
export const ACCORDION_DESCRIPTORS: Record<string, AccordionDescriptor[]> = {
  general: [
    { id: 'general-admin-controls', label: 'General Admin Controls', icon: 'GAC' },
    { id: 'approved-estimates', label: 'Default Approved Estimates', icon: 'D' },
  ],
  'ticket-types': [
    { id: 'ticket-type-configuration', label: 'Ticket Type Configuration', icon: 'TTC' },
  ],
  priorities: [
    { id: 'priority-levels', label: 'Priority Levels', icon: 'PL' },
    { id: 'impact-levels', label: 'Impact Levels', icon: 'IL' },
    { id: 'urgency-levels', label: 'Urgency Levels', icon: 'UL' },
    { id: 'priority-matrix', label: 'Priority Matrix', icon: 'PM' },
  ],
  statuses: [
    { id: 'ticket-statuses', label: 'Ticket Statuses', icon: 'S' },
    { id: 'release-cycle-statuses', label: 'Release Cycle Statuses', icon: 'RS' },
  ],
  slas: [
    { id: 'sla-admin-controls', label: 'SLA Admin Controls', icon: 'S' },
    { id: 'calendar-rules', label: 'Calendar Rules', icon: 'CR' },
    { id: 'response-ack-sla', label: 'Response / Acknowledgement SLA', icon: 'RA' },
    { id: 'resolution-sla', label: 'Resolution SLA', icon: 'RS' },
    { id: 'due-date-admin-controls', label: 'Due Date Admin Controls', icon: 'DD' },
    { id: 'due-dates', label: 'Due Dates', icon: 'DD2' },
    { id: 'et-admin-controls', label: 'ET Admin Controls', icon: 'EA' },
    { id: 'eta-activation', label: 'ETA Activation', icon: 'EA2' },
    { id: 'time-log-admin-controls', label: 'Time Log Admin Controls', icon: 'TL' },
    { id: 'time-logs-activation', label: 'Time Logs Activation', icon: 'TL2' },
  ],
  categorization: [
    { id: 'business-categories', label: 'Business Categories', icon: 'BC' },
    { id: 'service-lines', label: 'Service Lines', icon: 'SL' },
    { id: 'applications', label: 'Applications', icon: 'AP' },
    { id: 'application-queues', label: 'Application Queues', icon: 'Q' },
    { id: 'application-categories', label: 'Application Categories', icon: 'AC' },
    { id: 'application-sub-categories', label: 'Application Sub-Categories', icon: 'ASC' },
    { id: 'application-number-sequences', label: 'Application Number Sequences', icon: 'NS' },
  ],
  'consultant-profiles': [
    { id: 'consultant-profiles', label: 'Consultant Profiles', icon: 'CP' },
    { id: 'consultant-profile-roles', label: 'Define Consultant Roles', icon: 'CR' },
  ],
  approvals: [
    { id: 'approval-records', label: 'Approval Records', icon: 'AR' },
    { id: 'user-profiles', label: 'User Profiles', icon: 'UP' },
    { id: 'consultant-roles', label: 'Consultant Roles', icon: 'CR' },
    { id: 'approval-working-times', label: 'Working Times', icon: 'WT' },
  ],
  'user-config': [
    { id: 'user-work-locations', label: 'Work Locations', icon: 'WL' },
    { id: 'user-working-times', label: 'Working Times', icon: 'WT' },
    { id: 'user-associated-profiles', label: 'Associated Consultant Profiles', icon: 'AP' },
    { id: 'user-shift-management', label: 'Shift Management', icon: 'SH' },
    { id: 'user-work-location-associations', label: 'Work Location Associations', icon: 'WLA' },
  ],
  templates: [
    { id: 'ticket-update-template', label: 'Ticket Update', icon: 'TU' },
    { id: 'comment-template', label: 'Comment', icon: 'C' },
    { id: 'internal-note-template', label: 'Internal Note', icon: 'IN' },
    { id: 'resolution-template', label: 'Resolution', icon: 'R' },
    { id: 'time-entry-template', label: 'Time Entry', icon: 'TE' },
  ],
  'reason-codes': [
    { id: 'priority-change', label: 'Priority Change', icon: 'PC' },
    { id: 'role-change', label: 'Role Change', icon: 'RC' },
    { id: 'resolution', label: 'Resolution', icon: 'R' },
    { id: 'cancellation', label: 'Cancellation', icon: 'CN' },
    { id: 'reopen', label: 'Reopen', icon: 'RO' },
    { id: 'conversion', label: 'Conversion', icon: 'CV' },
  ],
  calendars: [
    { id: 'working-day-templates', label: 'Working Day Templates', icon: 'WD' },
    { id: 'holiday-calendars', label: 'Holiday Calendars', icon: 'HC' },
    { id: 'working-calendars', label: 'Working Calendars', icon: 'WC' },
    { id: 'timesheet-periods', label: 'Timesheet Periods', icon: 'TP' },
  ],
  expenses: [
    { id: 'expense-projects', label: 'Expense Projects', icon: 'EP' },
    { id: 'expense-categories', label: 'Expense Categories', icon: 'EC' },
  ],
  timesheets: [
    { id: 'timesheet-projects', label: 'Timesheet Projects', icon: 'TP' },
    { id: 'project-category', label: 'Project Category', icon: 'PC' },
  ],
};

/**
 * For tab-based pages (Categorization, User Config, Approvals), the sidebar
 * sub-items map to internal tabs rather than to separate accordions. When a
 * sub-item is clicked the sidebar dispatches a `config:switch-tab` custom
 * event; Configuration.tsx and ConfigPathPicker.tsx both read this map.
 */
export type TabTarget = { page: string; tab: string };

export const TAB_TARGETS: Record<string, TabTarget> = {
  // Categorization tabs
  'business-categories': { page: 'categorization', tab: 'businessCategory' },
  'service-lines': { page: 'categorization', tab: 'serviceLine' },
  applications: { page: 'categorization', tab: 'application' },
  'application-queues': { page: 'categorization', tab: 'applicationQueue' },
  'application-categories': { page: 'categorization', tab: 'applicationCategory' },
  'application-sub-categories': { page: 'categorization', tab: 'applicationSubCategory' },
  'application-number-sequences': { page: 'categorization', tab: 'applicationNumberSequence' },
  // User Config tabs
  'user-work-locations': { page: 'user-config', tab: 'workLocations' },
  'user-working-times': { page: 'user-config', tab: 'workingTimes' },
  'user-associated-profiles': { page: 'user-config', tab: 'associatedProfiles' },
  'user-shift-management': { page: 'user-config', tab: 'shifts' },
  'user-work-location-associations': { page: 'user-config', tab: 'associations' },
  // Approvals tabs
  'approval-records': { page: 'approvals', tab: 'records' },
  'user-profiles': { page: 'approvals', tab: 'userProfile' },
  'consultant-roles': { page: 'approvals', tab: 'consultantRoles' },
  'approval-working-times': { page: 'approvals', tab: 'workingTimes' },
};

export const getAccordionDescriptorsForPath = (path: string): AccordionDescriptor[] => {
  if (!path) return [];

  // Match by the trailing segment of the path (e.g. ".../general" -> "general")
  const lastSegment = path.split('/').filter(Boolean).pop();
  if (!lastSegment) return [];

  return ACCORDION_DESCRIPTORS[lastSegment] ?? [];
};
