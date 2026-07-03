import BusinessIcon from '@mui/icons-material/Business';
import { Column } from '@serviceops/component';
import { mkCell, mkActiveChip, mkRichTextCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigClient } from '@serviceops/interfaces';

export const ACCENT = '#0369a1';

export const CLIENTS_ICON = <BusinessIcon sx={{ fontSize: '1.1rem' }} />;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const clientColumns: Column<IConfigClient>[] = [
  { id: 'clientId', label: 'Client ID', minWidth: 110, format: mkCell(true) },
  { id: 'clientName', label: 'Client Name', minWidth: 160, format: mkCell() },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'termsOfPayment', label: 'Terms of Payment', minWidth: 150, format: mkCell() },
  { id: 'language', label: 'Language', minWidth: 110, format: mkCell() },
  { id: 'salesCurrency', label: 'Sales Currency', minWidth: 130, format: mkCell() },
  { id: 'lockSalesCurrency', label: 'Lock Sales Currency', minWidth: 150, format: mkActiveChip },
  { id: 'clientBankAccount', label: 'Client Bank Account', minWidth: 170, format: mkCell() },
  { id: 'paymentMethod', label: 'Payment Method', minWidth: 150, format: mkCell() },
  { id: 'defaultAddress', label: 'Default Address', minWidth: 180, format: mkCell() },
  { id: 'primaryContact', label: 'Primary Contact', minWidth: 150, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const CLIENTS_TABLE_CONFIG: TableConfig = {
  title: 'Clients',
  subtitle: 'Manage client master records and billing details',
  accent: ACCENT,
  icon: CLIENTS_ICON,
  entity: 'Client',
  fields: [
    { name: 'clientId', label: 'Client ID', required: true, bold: true },
    { name: 'clientName', label: 'Client Name', required: true },
    { name: 'shortDescription', label: 'Short Description', type: 'richText' },
    { name: 'termsOfPayment', label: 'Terms of Payment' },
    { name: 'language', label: 'Language' },
    { name: 'salesCurrency', label: 'Sales Currency' },
    {
      name: 'lockSalesCurrency',
      label: 'Lock Sales Currency',
      type: 'activationToggle',
      activationDescriptionActive: 'Sales currency is locked and cannot be changed',
      activationDescriptionInactive: 'Sales currency is unlocked and can be changed',
      activationAccent: ACCENT,
    },
    { name: 'clientBankAccount', label: 'Client Bank Account' },
    { name: 'paymentMethod', label: 'Payment Method' },
    { name: 'defaultAddress', label: 'Default Address' },
    { name: 'primaryContact', label: 'Primary Contact' },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
  ],
};
