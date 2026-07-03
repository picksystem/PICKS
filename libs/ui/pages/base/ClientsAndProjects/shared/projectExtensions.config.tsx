import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { Column } from '@serviceops/component';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigProjectExtension } from '@serviceops/interfaces';

export const ACCENT = '#0369a1';

export const PROJECT_EXTENSIONS_ICON = <EventRepeatIcon sx={{ fontSize: '1.1rem' }} />;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const projectExtensionColumns: Column<IConfigProjectExtension>[] = [
  { id: 'existingEndDate', label: 'Existing End Date', minWidth: 140, format: mkCell(true) },
  { id: 'extensionStartDate', label: 'Extension Start Date', minWidth: 150, format: mkCell() },
  { id: 'extensionEndDate', label: 'Extension End Date', minWidth: 150, format: mkCell() },
  { id: 'approvalStatus', label: 'Approval Status', minWidth: 140, format: mkCell() },
  { id: 'approvedByClient', label: 'Approved By (Client side)', minWidth: 170, format: mkCell() },
  { id: 'approvedByInternal', label: 'Approved By (Internal)', minWidth: 170, format: mkCell() },
  {
    id: 'updateContractActualEndDate',
    label: 'Update Contract Actual End Date',
    minWidth: 190,
    format: mkActiveChip,
  },
  {
    id: 'updateProjectActualEndDate',
    label: 'Update Project Actual End Date',
    minWidth: 190,
    format: mkActiveChip,
  },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const PROJECT_EXTENSIONS_TABLE_CONFIG: TableConfig = {
  title: 'Project Extensions',
  subtitle: 'Manage contract/project extensions and their approval status',
  accent: ACCENT,
  icon: PROJECT_EXTENSIONS_ICON,
  entity: 'Project Extension',
  fields: [
    {
      name: 'existingEndDate',
      label: 'Existing End Date',
      type: 'date',
      required: true,
      bold: true,
    },
    { name: 'extensionStartDate', label: 'Extension Start Date', type: 'date' },
    { name: 'extensionEndDate', label: 'Extension End Date', type: 'date' },
    { name: 'approvalStatus', label: 'Approval Status' },
    { name: 'approvedByClient', label: 'Approved By (Client side)' },
    { name: 'approvedByInternal', label: 'Approved By (Internal)' },
    {
      name: 'updateContractActualEndDate',
      label: 'Update Contract Actual End Date',
      type: 'activationToggle',
      activationDescriptionActive: 'Contract actual end date will be updated',
      activationDescriptionInactive: 'Contract actual end date will not be updated',
      activationAccent: ACCENT,
    },
    {
      name: 'updateProjectActualEndDate',
      label: 'Update Project Actual End Date',
      type: 'activationToggle',
      activationDescriptionActive: 'Project actual end date will be updated',
      activationDescriptionInactive: 'Project actual end date will not be updated',
      activationAccent: ACCENT,
    },
  ],
};
