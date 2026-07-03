import DescriptionIcon from '@mui/icons-material/Description';
import { Column } from '@serviceops/component';
import { mkCell, mkActiveChip, mkRichTextCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigProjectContract } from '@serviceops/interfaces';

export const ACCENT = '#0369a1';

export const PROJECT_CONTRACTS_ICON = <DescriptionIcon sx={{ fontSize: '1.1rem' }} />;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const projectContractColumns: Column<IConfigProjectContract>[] = [
  { id: 'contractId', label: 'Contract ID', minWidth: 120, format: mkCell(true) },
  { id: 'contractName', label: 'Contract Name', minWidth: 160, format: mkCell() },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'description', label: 'Description', minWidth: 200, format: mkRichTextCell },
  { id: 'clientId', label: 'Client ID', minWidth: 110, format: mkCell() },
  { id: 'clientName', label: 'Client Name', minWidth: 150, format: mkCell() },
  { id: 'billingAddress', label: 'Billing Address', minWidth: 180, format: mkCell() },
  {
    id: 'multipleFundingSources',
    label: 'Multiple Funding Sources',
    minWidth: 170,
    format: mkActiveChip,
  },
  { id: 'termsOfPayment', label: 'Terms of Payment', minWidth: 150, format: mkCell() },
  { id: 'language', label: 'Language', minWidth: 110, format: mkCell() },
  { id: 'contractStartDate', label: 'Contract Start Date', minWidth: 140, format: mkCell() },
  { id: 'contractEndDate', label: 'Contract End Date', minWidth: 140, format: mkCell() },
  { id: 'lockSalesCurrency', label: 'Lock Sales Currency', minWidth: 150, format: mkActiveChip },
  { id: 'indirectCost', label: 'Indirect Cost', minWidth: 130, format: mkCell() },
  { id: 'priceGroup', label: 'Price Group', minWidth: 130, format: mkCell() },
  { id: 'salesCurrency', label: 'Sales Currency', minWidth: 130, format: mkCell() },
  { id: 'billingFrequency', label: 'Billing Frequency', minWidth: 150, format: mkCell() },
  { id: 'clientBankAccount', label: 'Client Bank Account', minWidth: 170, format: mkCell() },
  { id: 'paymentMethod', label: 'Payment Method', minWidth: 150, format: mkCell() },
  { id: 'invoiceNote', label: 'Invoice Note', minWidth: 200, format: mkRichTextCell },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const PROJECT_CONTRACTS_TABLE_CONFIG: TableConfig = {
  title: 'Project Contracts',
  subtitle: 'Manage project contracts and their billing terms',
  accent: ACCENT,
  icon: PROJECT_CONTRACTS_ICON,
  entity: 'Project Contract',
  fields: [
    { name: 'contractId', label: 'Contract ID', required: true, bold: true },
    { name: 'contractName', label: 'Contract Name', required: true },
    { name: 'shortDescription', label: 'Short Description', type: 'richText' },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'clientId', label: 'Client ID' },
    { name: 'clientName', label: 'Client Name' },
    { name: 'billingAddress', label: 'Billing Address' },
    {
      name: 'multipleFundingSources',
      label: 'Multiple Funding Sources',
      type: 'activationToggle',
      activationDescriptionActive: 'This contract has multiple funding sources',
      activationDescriptionInactive: 'This contract has a single funding source',
      activationAccent: ACCENT,
    },
    { name: 'termsOfPayment', label: 'Terms of Payment' },
    { name: 'language', label: 'Language' },
    { name: 'contractStartDate', label: 'Contract Start Date', type: 'date' },
    { name: 'contractEndDate', label: 'Contract End Date', type: 'date' },
    {
      name: 'lockSalesCurrency',
      label: 'Lock Sales Currency',
      type: 'activationToggle',
      activationDescriptionActive: 'Sales currency is locked and cannot be changed',
      activationDescriptionInactive: 'Sales currency is unlocked and can be changed',
      activationAccent: ACCENT,
    },
    { name: 'indirectCost', label: 'Indirect Cost' },
    { name: 'priceGroup', label: 'Price Group' },
    { name: 'salesCurrency', label: 'Sales Currency' },
    { name: 'billingFrequency', label: 'Billing Frequency' },
    { name: 'clientBankAccount', label: 'Client Bank Account' },
    { name: 'paymentMethod', label: 'Payment Method' },
    { name: 'invoiceNote', label: 'Invoice Note', type: 'richText' },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
  ],
};
