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
    { name: 'description', label: 'Description' },
    { name: 'active', label: 'Active', type: 'toggle', defaultValue: true },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description' },
    { name: 'internalNote', label: 'Internal Note', type: 'toggle', defaultValue: false },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'selfNote', label: 'Self Note', type: 'toggle', defaultValue: false },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'toggle',
      defaultValue: false,
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
    { name: 'description', label: 'Description' },
    { name: 'active', label: 'Active', type: 'toggle', defaultValue: true },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description' },
    { name: 'internalNote', label: 'Internal Note', type: 'toggle', defaultValue: false },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'selfNote', label: 'Self Note', type: 'toggle', defaultValue: false },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'toggle',
      defaultValue: false,
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
    { name: 'description', label: 'Description' },
    { name: 'active', label: 'Active', type: 'toggle', defaultValue: true },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'subjectLine', label: 'Subject Line' },
    { name: 'commentDescription', label: 'Comment Description' },
    { name: 'internalNote', label: 'Customer Visible', type: 'toggle', defaultValue: false },
    {
      name: 'notifyAssigneesOnly',
      label: 'Notify Assignees Only',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'selfNote', label: 'Self Note', type: 'toggle', defaultValue: false },
    {
      name: 'appendToResolution',
      label: 'Append to Resolution',
      type: 'toggle',
      defaultValue: false,
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
    { name: 'description', label: 'Description' },
    { name: 'active', label: 'Active', type: 'toggle', defaultValue: true },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'application', label: 'Application' },
    { name: 'applicationCategory', label: 'Application Category' },
    { name: 'applicationSubCategory', label: 'Application Sub-Category' },
    {
      name: 'receivedCustomerInformation',
      label: 'Received Customer Information',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'recurringIssue', label: 'Recurring Issue', type: 'toggle', defaultValue: false },
    {
      name: 'rootCauseIdentified',
      label: 'Root Cause Identified',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'rootCause', label: 'Root Cause' },
    { name: 'resolutionCode', label: 'Resolution Code' },
    { name: 'resolution', label: 'Resolution' },
    { name: 'resolutionInternalNote', label: 'Resolution Internal Note' },
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
    { name: 'description', label: 'Description' },
    { name: 'active', label: 'Active', type: 'toggle', defaultValue: true },
    { name: 'ticketStatus', label: 'Ticket Status' },
    { name: 'weekStartDate', label: 'Date & Time', type: 'datetime' },
    { name: 'billingCode', label: 'Billing Code' },
    { name: 'activityTask', label: 'Activity/Task' },
    { name: 'externalComment', label: 'External Comment' },
    { name: 'internalComment', label: 'Internal Comment' },
    { name: 'nonBillable', label: 'Non Billable', type: 'toggle', defaultValue: false },
  ],
};
