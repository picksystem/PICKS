import { Column } from '@serviceops/component';
import CommentIcon from '@mui/icons-material/Comment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { mkCell, mkDescCell, mkActiveChip } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type {
  IConfigPriorityChangeReasonCode,
  IConfigRoleChangeReasonCode,
  IConfigResolutionCode,
  IConfigCancellationReasonCode,
  IConfigReopenReasonCode,
  IConfigConversionReasonCode,
} from '@serviceops/interfaces';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const priorityChangeColumns: Column<IConfigPriorityChangeReasonCode>[] = [
  { id: 'name', label: 'Priority Change Reason Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

export const roleChangeColumns: Column<IConfigRoleChangeReasonCode>[] = [
  { id: 'name', label: 'Role Change Reason Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

export const resolutionColumns: Column<IConfigResolutionCode>[] = [
  { id: 'name', label: 'Resolution Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

export const countdownColumns: Column<IConfigCancellationReasonCode>[] = [
  { id: 'name', label: 'Cancellation Reason Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

export const reopenColumns: Column<IConfigReopenReasonCode>[] = [
  { id: 'name', label: 'Reopen Reason Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

export const conversionColumns: Column<IConfigConversionReasonCode>[] = [
  { id: 'name', label: 'Conversion Reason Code', minWidth: 220, format: mkCell(true) },
  { id: 'internalNote', label: 'Internal Note', minWidth: 150, format: mkDescCell },
  { id: 'description', label: 'Description', minWidth: 280, format: mkDescCell },
  {
    id: 'activate',
    label: 'Activate',
    minWidth: 100,
    format: (v) => mkActiveChip(v),
  },
];

// ── Table Configs ───────────────────────────────────────────────────────────────

export const PRIORITY_CHANGE_CONFIG: TableConfig = {
  title: 'Priority Change Reason Code',
  subtitle: 'Define reason codes for priority change actions on tickets',
  accent: '#0369a1',
  icon: <CommentIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Priority Change Reason Code',
  fields: [
    {
      name: 'name',
      label: 'Priority Change Reason Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const ROLE_CHANGE_CONFIG: TableConfig = {
  title: 'Role Change Reason Code',
  subtitle: 'Define reason codes for role change actions on users or assignees',
  accent: '#0369a1',
  icon: <ManageAccountsIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Role Change Reason Code',
  fields: [
    {
      name: 'name',
      label: 'Role Change Reason Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const RESOLUTION_CONFIG: TableConfig = {
  title: 'Resolution Code',
  subtitle: 'Define resolution codes for closing or resolving tickets',
  accent: '#0369a1',
  icon: <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Resolution Code',
  fields: [
    {
      name: 'name',
      label: 'Resolution Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const CANCELLATION_CONFIG: TableConfig = {
  title: 'Cancellation Reason Code',
  subtitle: 'Define reason codes for cancelling tickets',
  accent: '#0369a1',
  icon: <CancelOutlinedIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Cancellation Reason Code',
  fields: [
    {
      name: 'name',
      label: 'Cancellation Reason Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const REOPEN_CONFIG: TableConfig = {
  title: 'Reopen Reason Code',
  subtitle: 'Define reason codes for reopening closed or resolved tickets',
  accent: '#0369a1',
  icon: <LockOpenIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Reopen Reason Code',
  fields: [
    {
      name: 'name',
      label: 'Reopen Reason Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};

export const CONVERSION_CONFIG: TableConfig = {
  title: 'Conversion Reason Code',
  subtitle: 'Define reason codes for converting tickets between types',
  accent: '#0369a1',
  icon: <AutoFixHighIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Conversion Reason Code',
  fields: [
    {
      name: 'name',
      label: 'Conversion Reason Code',
      required: true,
      bold: true,
    },
    {
      name: 'internalNote',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'activate',
      label: 'Activate',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This reason code is active',
      activationDescriptionInactive: 'This reason code is inactive',
      activationAccent: '#0369a1',
    },
  ],
};
