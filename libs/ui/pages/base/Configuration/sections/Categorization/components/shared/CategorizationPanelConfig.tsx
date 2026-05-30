import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import NumbersIcon from '@mui/icons-material/Numbers';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import AppsIcon from '@mui/icons-material/Apps';
import { TableConfig, CATEG_ACCENT } from './types';
import { ToolbarButton } from '@serviceops/generictoolbar';
import type {
  IConfigApproval,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigSupportLine,
  IConfigBillingCode,
  IConfigBusinessCategory,
  IConfigApplicationCategory,
  IConfigApplicationSubCategory,
  IConfigApplicationNumberSequence,
  IConfigServiceLine,
} from '@serviceops/interfaces';

// Flattened row types for sub-panel data
export interface FlatQueueApRow extends Omit<IConfigApproval, 'queueId'> {
  queueId: string;
  queueName: string;
}

export interface FlatQueueTSRow extends Omit<IConfigTimesheetProject, 'queueId'> {
  queueId: string;
  queueName: string;
}

export interface FlatQueueEXRow extends Omit<IConfigExpenseProject, 'queueId'> {
  queueId: string;
  queueName: string;
}

export interface FlatServiceLineApRow extends Omit<IConfigApproval, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface FlatServiceLineTSRow extends Omit<IConfigTimesheetProject, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface FlatServiceLineEXRow extends Omit<IConfigExpenseProject, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface FlatAppApRow extends Omit<IConfigApproval, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface FlatAppTSRow extends Omit<IConfigTimesheetProject, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface FlatAppEXRow extends Omit<IConfigExpenseProject, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface FlatAppSlRow extends Omit<IConfigSupportLine, 'id'> {
  id: string;
  applicationId: string;
  applicationName: string;
}

export interface FlatAppBCRow extends Omit<IConfigBillingCode, 'id' | 'applicationId'> {
  id: string;
  applicationId: string;
  applicationName: string;
}

// Queue Panels
export const QUEUE_APPROVALS_CONFIG: TableConfig = {
  title: 'Queue Approvals',
  subtitle: 'Configure approvers for queues',
  accent: CATEG_ACCENT,
  icon: <ChecklistIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Queue Approver',
  fields: [
    { name: 'queueName', label: 'Queue', required: true, bold: true },
    { name: 'approverName', label: 'Approver Name', required: true, bold: true },
    { name: 'approverRole', label: 'Approver Role' },
    { name: 'approvalOrder', label: 'Approval Order', type: 'number' },
    { name: 'isRequired', label: 'Required', type: 'toggle', defaultValue: false },
  ],
};

export const QUEUE_TIMESHEET_CONFIG: TableConfig = {
  title: 'Add Timesheet Projects',
  subtitle: 'Configure timesheet projects per queue',
  accent: CATEG_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'queueName', label: 'Queue', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const QUEUE_EXPENSES_CONFIG: TableConfig = {
  title: 'Add Expenses Projects',
  subtitle: 'Configure expense projects per queue',
  accent: CATEG_ACCENT,
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'queueName', label: 'Queue', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

// ServiceLine Panels
export const SERVICE_LINE_APPROVALS_CONFIG: TableConfig = {
  title: 'Service Line Approvals',
  subtitle: 'Configure approvers for service lines',
  accent: CATEG_ACCENT,
  icon: <ChecklistIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Service Line Approver',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'approverName', label: 'Approver Name', required: true, bold: true },
    { name: 'approverRole', label: 'Approver Role' },
    { name: 'approvalOrder', label: 'Approval Order', type: 'number' },
    { name: 'isRequired', label: 'Required', type: 'toggle', defaultValue: false },
  ],
};

export const SERVICE_LINE_TIMESHEET_CONFIG: TableConfig = {
  title: 'Add Timesheet Projects',
  subtitle: 'Configure timesheet projects per service line',
  accent: CATEG_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const SERVICE_LINE_EXPENSES_CONFIG: TableConfig = {
  title: 'Add Expenses Projects',
  subtitle: 'Configure expense projects per service line',
  accent: CATEG_ACCENT,
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const APP_TIMESHEET_CONFIG: TableConfig = {
  title: 'Add Timesheet Projects',
  subtitle: 'Configure timesheet projects per application',
  accent: CATEG_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const APP_EXPENSES_CONFIG: TableConfig = {
  title: 'Add Expenses Projects',
  subtitle: 'Configure expense projects per application',
  accent: CATEG_ACCENT,
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const APP_SUPPORT_LINES_CONFIG: TableConfig = {
  title: 'Support Lines / Queues',
  subtitle: 'Configure support lines and queues for applications',
  accent: CATEG_ACCENT,
  icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Support Line',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'queueName', label: 'Queue', required: true, bold: true },
    { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
  ],
};

export const APP_BILLING_CODES_CONFIG: TableConfig = {
  title: 'Billing Codes',
  subtitle: 'Configure billing codes per application',
  accent: CATEG_ACCENT,
  icon: <CodeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Billing Code',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'billingCode', label: 'Billing Code', required: true, bold: true },
    { name: 'billingCodeName', label: 'Billing Code Name', required: true },
    { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
  ],
};

export const TICKET_TYPE_TOGGLE_CONFIG: TableConfig = {
  title: 'Enable / Disable Service Line Specific Ticket Types',
  subtitle: 'Configure ticket type activations',
  accent: CATEG_ACCENT,
  icon: <ToggleOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Ticket Type',
  fields: [
    { name: 'ticketTypeName', label: 'Ticket Type', required: true, bold: true },
    { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
  ],
};

// ── Categorization Main Table Config (moved from categorization.config.tsx) ──

type CategSubView =
  | 'businessCategory'
  | 'applicationCategory'
  | 'applicationSubCategory'
  | 'applicationNumberSequence';

export const CATEG_TABLE_CONFIG: Record<CategSubView, TableConfig> = {
  businessCategory: {
    title: 'Business Categories',
    subtitle: 'Manage business category groups and their designated heads',
    accent: CATEG_ACCENT,
    icon: <AccountTreeIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Business Category',
    fields: [
      { name: 'name', label: 'Business Category Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
      { name: 'head', label: 'Business Category Head' },
    ],
  },
  applicationCategory: {
    title: 'Application Categories',
    subtitle: 'Manage categories assigned to applications',
    accent: CATEG_ACCENT,
    icon: <FolderSpecialIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Application Category',
    fields: [
      { name: 'applicationName', label: 'Application', required: true, bold: true },
      { name: 'categoryName', label: 'Application Category', required: true },
      { name: 'description', label: 'Description' },
    ],
  },
  applicationSubCategory: {
    title: 'Application Sub-Categories',
    subtitle: 'Manage sub-categories assigned to application categories',
    accent: CATEG_ACCENT,
    icon: <SubdirectoryArrowRightIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Application Sub-Category',
    fields: [
      { name: 'applicationName', label: 'Application', required: true, bold: true },
      { name: 'applicationCategoryName', label: 'Application Category', required: true },
      { name: 'subCategoryName', label: 'Application Sub-Category', required: true },
      { name: 'description', label: 'Description' },
    ],
  },
  applicationNumberSequence: {
    title: 'Application Specific Number Sequence',
    subtitle: 'Manage number sequences per application and ticket type',
    accent: CATEG_ACCENT,
    icon: <NumbersIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Number Sequence',
    fields: [
      { name: 'applicationName', label: 'Application', required: true, bold: true },
      {
        name: 'ticketTypeId',
        label: 'Ticket Type',
        required: true,
        type: 'ticketTypeSearch' as const,
      },
      { name: 'numberSequenceCode', label: 'Number Sequence Code', required: true },
      { name: 'numericCharLength', label: 'Numeric Char Length' },
      { name: 'numberSequenceFormat', label: 'Number Sequence Format' },
    ],
  },
};

export type QueueActivePanel = 'none' | 'approvals' | 'ticketTypes' | 'timesheet' | 'expenses';

export const ApplicationQueues = (
  activePanel: QueueActivePanel,
  onToggle: (panel: QueueActivePanel) => void,
): ToolbarButton[] => [
  {
    key: 'main',
    label: 'Application Queues',
    onClick: () => onToggle('none'),
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem', color: CATEG_ACCENT }} />,
    isActive: activePanel === 'none',
  },
  {
    key: 'approvals',
    label: 'Queue Approvals',
    onClick: () => onToggle('approvals'),
    icon: <ChecklistIcon sx={{ fontSize: '1rem', color: CATEG_ACCENT }} />,
    isActive: activePanel === 'approvals',
  },
  {
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    onClick: () => onToggle('ticketTypes'),
    icon: <ToggleOnIcon sx={{ fontSize: '1rem', color: CATEG_ACCENT }} />,
    isActive: activePanel === 'ticketTypes',
  },
  {
    key: 'timesheet',
    label: 'Add Timesheet Projects',
    onClick: () => onToggle('timesheet'),
    icon: <AccessTimeIcon sx={{ fontSize: '1rem', color: CATEG_ACCENT }} />,
    isActive: activePanel === 'timesheet',
  },
  {
    key: 'expenses',
    label: 'Add Expenses Projects',
    onClick: () => onToggle('expenses'),
    icon: <ReceiptLongIcon sx={{ fontSize: '1rem', color: CATEG_ACCENT }} />,
    isActive: activePanel === 'expenses',
  },
];

// Empty form templates
export const EMPTY_Q_FORM = {
  applicationId: '',
  applicationName: '',
  name: '',
  description: '',
  predecessor: '',
  successor: '',
  queueSpecificLead: '',
  managerLevel1: '',
  managerLevel2: '',
};

export const EMPTY_QAP = {
  approverName: '',
  approverRole: '',
  approvalOrder: 1,
  isRequired: false,
};

export const EMPTY_QTS: {
  queueId: string;
  project: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxHoursPerDayPerResource: number;
} = {
  queueId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: false,
  maxHoursPerDayPerResource: 8,
};

export const EMPTY_QEX: {
  queueId: string;
  project: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxAmountPerDay: number;
} = {
  queueId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: false,
  maxAmountPerDay: 0,
};

// Column definitions for categorization tables
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';

export const businessCategoryColumns: Column<IConfigBusinessCategory>[] = [
  { id: 'name', label: 'Business Category Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'head', label: 'Business Category Head', minWidth: 160, format: mkCell() },
];

export const applicationCategoryColumns: Column<IConfigApplicationCategory>[] = [
  { id: 'applicationName', label: 'Application', minWidth: 160, format: mkCell(true) },
  { id: 'categoryName', label: 'Application Category', minWidth: 180, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
];

export const applicationSubCategoryColumns: Column<IConfigApplicationSubCategory>[] = [
  { id: 'applicationName', label: 'Application', minWidth: 150, format: mkCell(true) },
  { id: 'applicationCategoryName', label: 'Application Category', minWidth: 170, format: mkCell() },
  { id: 'subCategoryName', label: 'Application Sub-Category', minWidth: 190, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
];

export const applicationNumberSequenceColumns: Column<IConfigApplicationNumberSequence>[] = [
  { id: 'applicationName', label: 'Application', minWidth: 140, format: mkCell(true) },
  { id: 'ticketTypeName', label: 'Ticket Type', minWidth: 130, format: mkCell() },
  { id: 'numberSequenceCode', label: 'Number Sequence Code', minWidth: 170, format: mkCell() },
  { id: 'numericCharLength', label: 'Numeric Char Length', minWidth: 150, format: mkCell() },
  { id: 'numberSequenceFormat', label: 'Number Sequence Format', minWidth: 180, format: mkCell() },
];

export const serviceLineColumns: Column<IConfigServiceLine>[] = [
  { id: 'businessCategoryName', label: 'Business Category', minWidth: 160, format: mkCell(true) },
  { id: 'name', label: 'Service Line Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'manager', label: 'Service Line Manager', minWidth: 160, format: mkCell() },
];

// Service Line Main Config
export const SERVICE_LINE_MAIN_CONFIG: TableConfig = {
  title: 'Service Lines',
  subtitle: 'Configure service lines with associated approvals, timesheets, and expenses',
  accent: CATEG_ACCENT,
  icon: <LinearScaleIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Service Line',
  fields: [
    { name: 'businessCategoryName', label: 'Business Category', required: true, bold: true },
    { name: 'name', label: 'Service Line Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'manager', label: 'Service Line Manager' },
  ],
};

// Application Main Config
export const APPLICATION_MAIN_CONFIG: TableConfig = {
  title: 'Applications',
  subtitle: 'Configure applications with associated approvals, timesheets, expenses, and billing',
  accent: CATEG_ACCENT,
  icon: <AppsIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Application',
  fields: [
    { name: 'name', label: 'Application Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'categoryName', label: 'Category' },
    { name: 'businessCategoryName', label: 'Business Category' },
  ],
};

// Application Queue Main Config
export const APPLICATION_QUEUE_MAIN_CONFIG: TableConfig = {
  title: 'Application Queues',
  subtitle: 'Configure queues with associated approvals, timesheets, and expenses',
  accent: CATEG_ACCENT,
  icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Application Queue',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'name', label: 'Queue Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'queueSpecificLead', label: 'Queue Lead' },
    { name: 'managerLevel1', label: 'Manager Level 1' },
    { name: 'managerLevel2', label: 'Manager Level 2' },
  ],
};

export interface IConfigApplicationQueueExtended extends Record<string, unknown> {
  id: string;
  applicationId: string;
  applicationName: string;
  name: string;
  description: string;
  predecessor: string;
  successor: string;
  queueSpecificLead: string;
  managerLevel1: string;
  managerLevel2: string;
}

export const applicationQueueColumns: Column<IConfigApplicationQueueExtended>[] = [
  { id: 'applicationName', label: 'Application', minWidth: 160, format: mkCell(true) },
  { id: 'name', label: 'Queue Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'queueSpecificLead', label: 'Queue Lead', minWidth: 160, format: mkCell() },
  { id: 'managerLevel1', label: 'Manager L1', minWidth: 140, format: mkCell() },
  { id: 'managerLevel2', label: 'Manager L2', minWidth: 140, format: mkCell() },
];
