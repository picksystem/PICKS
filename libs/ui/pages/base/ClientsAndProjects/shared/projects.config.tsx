import WorkIcon from '@mui/icons-material/Work';
import { Column } from '@serviceops/component';
import { mkCell, mkActiveChip, mkRichTextCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigProject } from '@serviceops/interfaces';

export const ACCENT = '#0369a1';

export const PROJECTS_ICON = <WorkIcon sx={{ fontSize: '1.1rem' }} />;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const projectColumns: Column<IConfigProject>[] = [
  { id: 'projectId', label: 'Project ID', minWidth: 120, format: mkCell(true) },
  { id: 'projectName', label: 'Project Name', minWidth: 160, format: mkCell() },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'contractId', label: 'Contract ID', minWidth: 120, format: mkCell() },
  { id: 'contractName', label: 'Contract Name', minWidth: 150, format: mkCell() },
  { id: 'clientId', label: 'Client ID', minWidth: 110, format: mkCell() },
  { id: 'clientName', label: 'Client Name', minWidth: 150, format: mkCell() },
  { id: 'createdBy', label: 'Created By', minWidth: 130, format: mkCell() },
  { id: 'dateOfCreation', label: 'Date of Creation', minWidth: 140, format: mkCell() },
  { id: 'projectedStartDate', label: 'Projected Start Date', minWidth: 150, format: mkCell() },
  { id: 'projectedEndDate', label: 'Projected End Date', minWidth: 150, format: mkCell() },
  { id: 'actualStartDate', label: 'Actual Start Date', minWidth: 140, format: mkCell() },
  { id: 'actualEndDate', label: 'Actual End Date', minWidth: 140, format: mkCell() },
  { id: 'projectType', label: 'Project Type', minWidth: 130, format: mkCell() },
  { id: 'projectStatus', label: 'Project Status', minWidth: 130, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
  {
    id: 'allowedTransactionType',
    label: 'Allowed Transaction Type',
    minWidth: 170,
    format: mkCell(),
  },
  { id: 'prePaidBlock', label: 'Pre-paid Block', minWidth: 130, format: mkActiveChip },
  { id: 'prePaidHours', label: 'Pre-paid Hours', minWidth: 130, format: mkCell() },
  {
    id: 'prePaidHoursConsumed',
    label: 'Pre-paid Hours Consumed',
    minWidth: 170,
    format: mkCell(),
  },
  {
    id: 'prePaidHoursBalance',
    label: 'Pre-paid Hours Balance',
    minWidth: 170,
    format: mkCell(),
  },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const PROJECTS_TABLE_CONFIG: TableConfig = {
  title: 'Projects',
  subtitle: 'Manage projects, their contracts and pre-paid hours balances',
  accent: ACCENT,
  icon: PROJECTS_ICON,
  entity: 'Project',
  fields: [
    { name: 'projectId', label: 'Project ID', required: true, bold: true },
    { name: 'projectName', label: 'Project Name', required: true },
    { name: 'shortDescription', label: 'Short Description', type: 'richText' },
    { name: 'contractId', label: 'Contract ID' },
    { name: 'contractName', label: 'Contract Name' },
    { name: 'clientId', label: 'Client ID' },
    { name: 'clientName', label: 'Client Name' },
    { name: 'createdBy', label: 'Created By' },
    { name: 'dateOfCreation', label: 'Date of Creation', type: 'date' },
    { name: 'projectedStartDate', label: 'Projected Start Date', type: 'date' },
    { name: 'projectedEndDate', label: 'Projected End Date', type: 'date' },
    { name: 'actualStartDate', label: 'Actual Start Date', type: 'date' },
    { name: 'actualEndDate', label: 'Actual End Date', type: 'date' },
    { name: 'projectType', label: 'Project Type' },
    { name: 'projectStatus', label: 'Project Status' },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
    { name: 'allowedTransactionType', label: 'Allowed Transaction Type' },
    {
      name: 'prePaidBlock',
      label: 'Pre-paid Block',
      type: 'activationToggle',
      activationDescriptionActive: 'Pre-paid hours block is enabled for this project',
      activationDescriptionInactive: 'Pre-paid hours block is disabled for this project',
      activationAccent: ACCENT,
    },
    { name: 'prePaidHours', label: 'Pre-paid Hours', type: 'number' },
    { name: 'prePaidHoursConsumed', label: 'Pre-paid Hours Consumed', type: 'number' },
    { name: 'prePaidHoursBalance', label: 'Pre-paid Hours Balance', type: 'number' },
  ],
};
