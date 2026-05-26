import CodeIcon from '@mui/icons-material/Code';
import type { TableConfig } from '@serviceops/pages/base/Configuration/sections/Approvals/components/shared/types';

export const APP_BILLING_CODES_CONFIG: TableConfig = {
  title: 'Billing Codes',
  subtitle: 'Configure billing codes per application',
  accent: '#0369a1',
  icon: <CodeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Billing Code',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'billingCode', label: 'Billing Code', required: true, bold: true },
    { name: 'billingCodeName', label: 'Billing Code Name', required: true },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
  ],
};
