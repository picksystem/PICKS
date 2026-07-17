import { Column } from '@serviceops/component';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import NoteIcon from '@mui/icons-material/Note';
import { mkCell, mkDescCell, mkActiveChip } from '@serviceops/configutils';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { type TableConfig } from '@serviceops/genericpanel';
import type {
  IConfigTicketUpdateTemplate,
  IConfigCommentTemplate,
  IConfigInternalNoteTemplate,
  IConfigTimeEntryTemplate,
} from '@serviceops/interfaces';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const ticketUpdateColumns: Column<IConfigTicketUpdateTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: mkActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 100, format: mkCell() },
  { id: 'notifyAssigneesOnly', label: 'Notify Assignees', minWidth: 110, format: mkCell() },
  { id: 'selfNote', label: 'Self Note', minWidth: 90, format: mkCell() },
  { id: 'appendToResolution', label: 'Append to Res.', minWidth: 110, format: mkCell() },
];

export const commentColumns: Column<IConfigCommentTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: mkActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'subjectLine', label: 'Subject Line', minWidth: 170, format: mkCell() },
  { id: 'commentDescription', label: 'Comment', minWidth: 160, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 100, format: mkCell() },
  { id: 'notifyAssigneesOnly', label: 'Notify Assignees', minWidth: 110, format: mkCell() },
  { id: 'selfNote', label: 'Self Note', minWidth: 90, format: mkCell() },
  { id: 'appendToResolution', label: 'Append to Res.', minWidth: 110, format: mkCell() },
];

export const internalNoteColumns: Column<IConfigInternalNoteTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: mkActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'subjectLine', label: 'Subject Line', minWidth: 170, format: mkCell() },
  { id: 'commentDescription', label: 'Comment', minWidth: 160, format: mkCell() },
  { id: 'internalNote', label: 'Customer Visible', minWidth: 110, format: mkCell() },
  { id: 'notifyAssigneesOnly', label: 'Notify Assignees', minWidth: 110, format: mkCell() },
  { id: 'selfNote', label: 'Self Note', minWidth: 90, format: mkCell() },
  { id: 'appendToResolution', label: 'Append to Res.', minWidth: 110, format: mkCell() },
];

// ── Table Configs ───────────────────────────────────────────────────────────────

export const TICKET_UPDATE_CONFIG: TableConfig = {
  title: 'Ticket Update Template',
  subtitle: 'Define reusable templates for ticket status updates and customer notifications',
  accent: '#0369a1',
  icon: <FileCopyIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Ticket Update Template',
  fields: [
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description', type: 'richText' },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This update will be marked as an internal note',
      activationDescriptionInactive: 'This update will not be marked as an internal note',
      activationAccent: '#0369a1',
    },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'Only assignees will be notified about this update',
      activationDescriptionInactive: 'All relevant users will be notified about this update',
      activationAccent: '#0369a1',
    },
    {
      name: 'selfNote',
      label: 'Self Note',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This update will be logged as a self note',
      activationDescriptionInactive: 'This update will not be logged as a self note',
      activationAccent: '#0369a1',
    },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This update will be appended to the ticket resolution',
      activationDescriptionInactive: 'This update will not be appended to the ticket resolution',
      activationAccent: '#0369a1',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'activationToggle' as const,
      defaultValue: true,
      activationDescriptionActive: 'This ticket update template is active',
      activationDescriptionInactive: 'This ticket update template is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const COMMENT_CONFIG: TableConfig = {
  title: 'Comment Template',
  subtitle: 'Define reusable comment templates for internal notes and customer replies',
  accent: '#0369a1',
  icon: <CommentIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Comment Template',
  fields: [
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description', type: 'richText' },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This comment will be marked as an internal note',
      activationDescriptionInactive: 'This comment will not be marked as an internal note',
      activationAccent: '#0369a1',
    },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'Only assignees will be notified about this comment',
      activationDescriptionInactive: 'All relevant users will be notified about this comment',
      activationAccent: '#0369a1',
    },
    {
      name: 'selfNote',
      label: 'Self Note',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This comment will be logged as a self note',
      activationDescriptionInactive: 'This comment will not be logged as a self note',
      activationAccent: '#0369a1',
    },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This comment will be appended to the ticket resolution',
      activationDescriptionInactive: 'This comment will not be appended to the ticket resolution',
      activationAccent: '#0369a1',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'activationToggle' as const,
      defaultValue: true,
      activationDescriptionActive: 'This comment template is active',
      activationDescriptionInactive: 'This comment template is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const INTERNAL_NOTE_CONFIG: TableConfig = {
  title: 'Internal Note Template',
  subtitle: 'Define reusable internal note templates with customer-visible comment options',
  accent: '#0369a1',
  icon: <NoteIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Internal Note Template',
  fields: [
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description', type: 'richText' },
    {
      name: 'internalNote',
      label: 'Customer Visible',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This internal note will be visible to the customer',
      activationDescriptionInactive: 'This internal note will not be visible to the customer',
      activationAccent: '#0369a1',
    },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'Only assignees will be notified about this note',
      activationDescriptionInactive: 'All relevant users will be notified about this note',
      activationAccent: '#0369a1',
    },
    {
      name: 'selfNote',
      label: 'Self Note',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This note will be logged as a self note',
      activationDescriptionInactive: 'This note will not be logged as a self note',
      activationAccent: '#0369a1',
    },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This note will be appended to the ticket resolution',
      activationDescriptionInactive: 'This note will not be appended to the ticket resolution',
      activationAccent: '#0369a1',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'activationToggle' as const,
      defaultValue: true,
      activationDescriptionActive: 'This internal note template is active',
      activationDescriptionInactive: 'This internal note template is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

// ── Resolution Template ───────────────────────────────────────────────────────

export interface IConfigResolutionTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  application: string;
  applicationCategory: string;
  applicationSubCategory: string;
  receivedCustomerInformation: boolean;
  recurringIssue: boolean;
  rootCauseIdentified: boolean;
  rootCause: string;
  resolutionCode: string;
  resolution: string;
  resolutionInternalNote: string;
}

export const resolutionColumns: Column<IConfigResolutionTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: mkActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'application', label: 'Application', minWidth: 130, format: mkCell() },
  { id: 'applicationCategory', label: 'App Category', minWidth: 130, format: mkCell() },
  { id: 'applicationSubCategory', label: 'App Sub-Category', minWidth: 140, format: mkCell() },
  {
    id: 'receivedCustomerInformation',
    label: 'Rec. Customer Info',
    minWidth: 140,
    format: mkActiveChip,
  },
  { id: 'recurringIssue', label: 'Recurring Issue', minWidth: 120, format: mkActiveChip },
  {
    id: 'rootCauseIdentified',
    label: 'Root Cause Identified',
    minWidth: 140,
    format: mkActiveChip,
  },
  { id: 'rootCause', label: 'Root Cause', minWidth: 120, format: mkCell() },
  { id: 'resolutionCode', label: 'Resolution Code', minWidth: 130, format: mkCell() },
  { id: 'resolution', label: 'Resolution', minWidth: 120, format: mkCell() },
  { id: 'resolutionInternalNote', label: 'Res. Internal Note', minWidth: 140, format: mkCell() },
];

export const RESOLUTION_CONFIG: TableConfig = {
  title: 'Resolution Template',
  subtitle: 'Define reusable resolution templates with root cause and resolution details',
  accent: '#0369a1',
  icon: <ChecklistIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Resolution Template',
  fields: [
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'application', label: 'Application' },
    { name: 'applicationCategory', label: 'Application Category' },
    { name: 'applicationSubCategory', label: 'Application Sub-Category' },
    { name: 'rootCause', label: 'Root Cause' },
    { name: 'resolutionCode', label: 'Resolution Code' },
    { name: 'resolution', label: 'Resolution', type: 'richText' },
    { name: 'resolutionInternalNote', label: 'Resolution Internal Note', type: 'richText' },
    {
      name: 'receivedCustomerInformation',
      label: 'Received Customer Information',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'Customer information has been received for this resolution',
      activationDescriptionInactive:
        'Customer information has not been received for this resolution',
      activationAccent: '#0369a1',
    },
    {
      name: 'recurringIssue',
      label: 'Recurring Issue',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This is marked as a recurring issue',
      activationDescriptionInactive: 'This is not marked as a recurring issue',
      activationAccent: '#0369a1',
    },
    {
      name: 'rootCauseIdentified',
      label: 'Root Cause Identified',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'The root cause has been identified',
      activationDescriptionInactive: 'The root cause has not been identified',
      activationAccent: '#0369a1',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'activationToggle' as const,
      defaultValue: true,
      activationDescriptionActive: 'This resolution template is active',
      activationDescriptionInactive: 'This resolution template is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

// ── Time Entry Template ───────────────────────────────────────────────────────

export const timeEntryColumns: Column<IConfigTimeEntryTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: mkActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'weekStartDate', label: 'Date& Time', minWidth: 120, format: mkCell() },
  { id: 'billingCode', label: 'Billing Code', minWidth: 120, format: mkCell() },
  { id: 'activityTask', label: 'Activity/Task', minWidth: 130, format: mkCell() },
  { id: 'externalComment', label: 'External Comment', minWidth: 150, format: mkCell() },
  { id: 'internalComment', label: 'Internal Comment', minWidth: 150, format: mkCell() },
  { id: 'nonBillable', label: 'Non Billable', minWidth: 100, format: mkActiveChip },
];

export const TIME_ENTRY_CONFIG: TableConfig = {
  title: 'Time Entry Template',
  subtitle: 'Define reusable time entry templates with billing and activity details',
  accent: '#0369a1',
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Time Entry Template',
  fields: [
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'weekStartDate', label: 'Date & Time', type: 'datetime' },
    { name: 'billingCode', label: 'Billing Code' },
    { name: 'activityTask', label: 'Activity/Task' },
    { name: 'externalComment', label: 'External Comment', type: 'richText' },
    { name: 'internalComment', label: 'Internal Comment', type: 'richText' },
    {
      name: 'nonBillable',
      label: 'Non Billable',
      type: 'activationToggle' as const,
      defaultValue: false,
      activationDescriptionActive: 'This time entry is marked as non-billable',
      activationDescriptionInactive: 'This time entry is billable',
      activationAccent: '#0369a1',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'activationToggle' as const,
      defaultValue: true,
      activationDescriptionActive: 'This time entry template is active',
      activationDescriptionInactive: 'This time entry template is inactive',
      activationAccent: '#0369a1',
    },
  ],
};
