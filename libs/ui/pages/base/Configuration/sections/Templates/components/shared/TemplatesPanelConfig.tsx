import { Column } from '@serviceops/component';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import NoteIcon from '@mui/icons-material/Note';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import {
  ActiveChip,
  type TableConfig,
} from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import type {
  IConfigTicketUpdateTemplate,
  IConfigCommentTemplate,
  IConfigInternalNoteTemplate,
} from '@serviceops/interfaces';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const ticketUpdateColumns: Column<IConfigTicketUpdateTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: ActiveChip },
  { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 100, format: mkCell() },
  { id: 'notifyAssigneesOnly', label: 'Notify Assignees', minWidth: 110, format: mkCell() },
  { id: 'selfNote', label: 'Self Note', minWidth: 90, format: mkCell() },
  { id: 'appendToResolution', label: 'Append to Res.', minWidth: 110, format: mkCell() },
];

export const commentColumns: Column<IConfigCommentTemplate>[] = [
  { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'active', label: 'Active', minWidth: 80, format: ActiveChip },
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
  { id: 'active', label: 'Active', minWidth: 80, format: ActiveChip },
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
