import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Column } from '@serviceops/component';
import {
  mkCell,
  mkChip,
  mkDescCell,
} from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type {
  IConfigExpenseProjectEntry,
  IConfigExpenseCategoryEntry,
  IConfigExpenseCategorySubCategory,
} from '@serviceops/interfaces';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const EXP_COLORS = {
  category: '#0369a1',
  itemization: '#0891b2',
} as const;

// ── View Toggle Buttons ────────────────────────────────────────────────────────

export const EXP_PROJECT_VIEWS = [
  { key: 'project', label: 'Expense Project', icon: <ReceiptLongIcon /> },
  { key: 'serviceLine', label: 'Add to Service Line', icon: <AccountTreeIcon /> },
  { key: 'application', label: 'Add to Application', icon: <AccountTreeIcon /> },
  { key: 'queue', label: 'Add to Queue', icon: <AccountTreeIcon /> },
  { key: 'resource', label: 'Add to Resource', icon: <AccountTreeIcon /> },
] as const;

export const EXP_CATEGORY_VIEWS = [
  { key: 'category', label: 'Expense Category', icon: <CategoryIcon /> },
  { key: 'subCategory', label: 'Sub-Category', icon: <AccountTreeIcon /> },
] as const;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const expenseProjectColumns: Column<IConfigExpenseProjectEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'name', label: 'Name', minWidth: 140, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 130, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(EXP_COLORS.category) },
  {
    id: 'itemization',
    label: 'Itemization',
    minWidth: 110,
    format: mkChip(EXP_COLORS.itemization),
  },
];

export const expenseCategoryColumns: Column<IConfigExpenseCategoryEntry>[] = [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'name', label: 'Name', minWidth: 140, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 130, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(EXP_COLORS.category) },
  {
    id: 'itemization',
    label: 'Itemization',
    minWidth: 110,
    format: mkChip(EXP_COLORS.itemization),
  },
];

export const expenseSubCategoryColumns: Column<IConfigExpenseCategorySubCategory>[] = [
  { id: 'category', label: 'Category', minWidth: 150, format: mkCell(true) },
  { id: 'subCategory', label: 'Sub-Category', minWidth: 150, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 140, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(EXP_COLORS.category) },
];

// ── Form Config ────────────────────────────────────────────────────────────────

export const EXP_FORM_LABELS = {
  project: {
    title: 'Expense Project',
    subtitle: 'Define an expense project with its group, type and billability',
    entity: 'Expense Project',
    fields: [
      { name: 'project', label: 'Project', required: true, placeholder: 'e.g. Q2 Infrastructure' },
      {
        name: 'name',
        label: 'Name',
        required: true,
        placeholder: 'e.g. Field Operations, IT Upgrade',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Brief description of this expense project',
      },
      { name: 'expensesGroup', label: 'Expenses Group', placeholder: 'e.g. Operations, Admin' },
      { name: 'expensesType', label: 'Expenses Type', placeholder: 'e.g. Direct, Indirect' },
      { name: 'billable', label: 'Billable', placeholder: 'e.g. Billable, Non-Billable' },
      { name: 'itemization', label: 'Itemization', placeholder: 'e.g. Required, Optional' },
    ],
  },
  category: {
    title: 'Expense Category',
    subtitle: 'Define an expense category with its group, type and billability',
    entity: 'Expense Category',
    fields: [
      { name: 'project', label: 'Project', required: true, placeholder: 'e.g. Q2 Infrastructure' },
      { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Travel, Supplies' },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Brief description of this expense category',
      },
      { name: 'expensesGroup', label: 'Expenses Group', placeholder: 'e.g. Operations, Admin' },
      { name: 'expensesType', label: 'Expenses Type', placeholder: 'e.g. Direct, Indirect' },
      { name: 'billable', label: 'Billable', placeholder: 'e.g. Billable, Non-Billable' },
      { name: 'itemization', label: 'Itemization', placeholder: 'e.g. Required, Optional' },
    ],
  },
  subCategory: {
    title: 'Expense Category Sub-Category',
    subtitle: 'Define a sub-category for an expense category',
    entity: 'Expense Category Sub-Category',
    fields: [
      {
        name: 'category',
        label: 'Category',
        required: true,
        placeholder: 'e.g. Travel, Equipment',
      },
      {
        name: 'subCategory',
        label: 'Sub-Category',
        required: true,
        placeholder: 'e.g. Flights, Laptops',
      },
      { name: 'description', label: 'Description', placeholder: 'Brief description' },
      { name: 'expensesGroup', label: 'Expenses Group', placeholder: 'e.g. Operations' },
      { name: 'expensesType', label: 'Expenses Type', placeholder: 'e.g. Direct, Indirect' },
      { name: 'billable', label: 'Billable', placeholder: 'e.g. Billable, Non-Billable' },
    ],
  },
} as const;
