import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import type { TableConfig } from '@serviceops/genericpanel';

export const APP_EXPENSES_CONFIG: TableConfig = {
  title: 'Add Expenses Projects',
  subtitle: 'Configure expense projects per application',
  accent: '#0369a1',
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' as const },
    { name: 'toDate', label: 'To Date', type: 'date' as const },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number' as const, defaultValue: 0 },
    {
      name: 'activate',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This expense project is enabled',
      activationDescriptionInactive: 'This expense project is disabled',
      activationAccent: '#0369a1',
      defaultValue: true,
    },
  ],
};
