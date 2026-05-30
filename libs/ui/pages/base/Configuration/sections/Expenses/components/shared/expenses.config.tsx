import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonIcon from '@mui/icons-material/Person';
import { Column } from '@serviceops/component';
import {
  mkCell,
  mkChip,
  mkDescCell,
} from '@serviceops/configutils';
import { TableConfig } from './expenses.config.types';

import type {
  IConfigExpenseProjectEntry,
  IConfigExpenseCategoryEntry,
  IConfigExpenseCategorySubCategory,
  IConfigExpenseProjectSubCategory,
  IConfigExpenseServiceLineEntry,
  IConfigExpenseApplicationEntry,
  IConfigExpenseQueueEntry,
  IConfigExpenseResourceEntry,
} from '@serviceops/interfaces';

// ── View Toggle Buttons ────────────────────────────────────────────────────────

export const EXP_PROJECT_VIEWS = [
  { key: 'project', label: 'Expense Project', icon: <ReceiptLongIcon /> },
  { key: 'serviceLine', label: 'Add to Service Line', icon: <LayersIcon /> },
  { key: 'application', label: 'Add to Application', icon: <AppsIcon /> },
  { key: 'queue', label: 'Add to Queue', icon: <HeadsetMicIcon /> },
  { key: 'resource', label: 'Add to Resource', icon: <PersonIcon /> },
] as const;

export const EXP_CATEGORY_VIEWS = [
  { key: 'category', label: 'Expense Category', icon: <CategoryIcon /> },
  { key: 'subCategory', label: 'Sub-Category', icon: <AccountTreeIcon /> },
] as const;

// ── Table Configs ─────────────────────────────────────────────────────────────

export const EXP_PROJECT_CONFIG: TableConfig = {
  title: 'Expense Projects',
  subtitle: 'Define expense projects with their group, type, billability and associations',
  accent: '#0369a1',
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'expensesGroup', label: 'Expenses Group' },
    { name: 'expensesType', label: 'Expenses Type' },
    { name: 'billable', label: 'Billable' },
    { name: 'itemization', label: 'Itemization' },
  ],
};

export const EXP_PROJECT_SUBCATEGORY_CONFIG: TableConfig = {
  title: 'Expense Project Sub-Categories',
  subtitle: 'Define sub-categories for expense projects',
  accent: '#0369a1',
  icon: <AccountTreeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Sub-Category',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'subCategory', label: 'Sub-Category', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'expensesGroup', label: 'Expenses Group' },
    { name: 'expensesType', label: 'Expenses Type' },
    { name: 'billable', label: 'Billable' },
  ],
};

export const EXP_SERVICE_LINE_CONFIG: TableConfig = {
  title: 'Expense Service Line Entries',
  subtitle: 'Configure expense projects assigned to service lines',
  accent: '#0369a1',
  icon: <LayersIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Service Line Entry',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'serviceLine', label: 'Service Line', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const EXP_APPLICATION_CONFIG: TableConfig = {
  title: 'Expense Application Entries',
  subtitle: 'Configure expense projects assigned to applications',
  accent: '#0369a1',
  icon: <AppsIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Application Entry',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'application', label: 'Application', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const EXP_QUEUE_CONFIG: TableConfig = {
  title: 'Expense Queue Entries',
  subtitle: 'Configure expense projects assigned to queues',
  accent: '#0369a1',
  icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Queue Entry',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'queue', label: 'Queue', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const EXP_RESOURCE_CONFIG: TableConfig = {
  title: 'Expense Resource Entries',
  subtitle: 'Configure expense projects assigned to resources',
  accent: '#0369a1',
  icon: <PersonIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Resource Entry',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'resource', label: 'Resource', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};

export const EXP_CATEGORY_CONFIG: TableConfig = {
  title: 'Expense Categories',
  subtitle: 'Define expense categories with their group, type and billability',
  accent: '#0369a1',
  icon: <CategoryIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Category',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'name', label: 'Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'expensesGroup', label: 'Expenses Group' },
    { name: 'expensesType', label: 'Expenses Type' },
    { name: 'billable', label: 'Billable' },
    { name: 'itemization', label: 'Itemization' },
  ],
};

export const EXP_CATEGORY_SUBCATEGORY_CONFIG: TableConfig = {
  title: 'Expense Category Sub-Categories',
  subtitle: 'Define sub-categories for expense categories',
  accent: '#0369a1',
  icon: <AccountTreeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Sub-Category',
  fields: [
    { name: 'category', label: 'Category', required: true, bold: true },
    { name: 'subCategory', label: 'Sub-Category', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'expensesGroup', label: 'Expenses Group' },
    { name: 'expensesType', label: 'Expenses Type' },
    { name: 'billable', label: 'Billable' },
  ],
};

// ── Column Definitions ─────────────────────────────────────────────────────────

export const expenseProjectColumns: Column<IConfigExpenseProjectEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'name', label: 'Name', minWidth: 140, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 130, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip('#0369a1') },
  {
    id: 'itemization',
    label: 'Itemization',
    minWidth: 110,
    format: mkChip('#0369a1'),
  },
];

export const expenseProjectSubCategoryColumns: Column<IConfigExpenseProjectSubCategory>[] = [
  { id: 'project', label: 'Project', minWidth: 150, format: mkCell(true) },
  { id: 'subCategory', label: 'Sub-Category', minWidth: 150, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 140, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip('#0369a1') },
];

export const expenseCategoryColumns: Column<IConfigExpenseCategoryEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'name', label: 'Name', minWidth: 140, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 130, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip('#0369a1') },
  {
    id: 'itemization',
    label: 'Itemization',
    minWidth: 110,
    format: mkChip('#0369a1'),
  },
];

export const expenseSubCategoryColumns: Column<IConfigExpenseCategorySubCategory>[] = [
  { id: 'category', label: 'Category', minWidth: 150, format: mkCell(true) },
  { id: 'subCategory', label: 'Sub-Category', minWidth: 150, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 140, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip('#0369a1') },
];

export const expenseServiceLineColumns: Column<IConfigExpenseServiceLineEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'serviceLine', label: 'Service Line', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 110, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 110, format: mkCell() },
  { id: 'activate', label: 'Active', minWidth: 80, format: mkChip('#0369a1') },
  { id: 'maxAmountPerDay', label: 'Max Amount/Day', minWidth: 130, format: mkCell() },
];

export const expenseApplicationColumns: Column<IConfigExpenseApplicationEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'application', label: 'Application', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 110, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 110, format: mkCell() },
  { id: 'activate', label: 'Active', minWidth: 80, format: mkChip('#0369a1') },
  { id: 'maxAmountPerDay', label: 'Max Amount/Day', minWidth: 130, format: mkCell() },
];

export const expenseQueueColumns: Column<IConfigExpenseQueueEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'queue', label: 'Queue', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 110, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 110, format: mkCell() },
  { id: 'activate', label: 'Active', minWidth: 80, format: mkChip('#0369a1') },
  { id: 'maxAmountPerDay', label: 'Max Amount/Day', minWidth: 130, format: mkCell() },
];

export const expenseResourceColumns: Column<IConfigExpenseResourceEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'resource', label: 'Resource', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 110, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 110, format: mkCell() },
  { id: 'activate', label: 'Active', minWidth: 80, format: mkChip('#0369a1') },
  { id: 'maxAmountPerDay', label: 'Max Amount/Day', minWidth: 130, format: mkCell() },
];
