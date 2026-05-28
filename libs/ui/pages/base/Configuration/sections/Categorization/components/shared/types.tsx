import { ReactNode } from 'react';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import type { TableField, TableConfig } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';

export const CATEG_ACCENT = '#0369a1';

export type CategorizationActiveView =
  | 'businessCategory'
  | 'serviceLine'
  | 'application'
  | 'applicationQueue'
  | 'applicationCategory'
  | 'applicationSubCategory'
  | 'applicationNumberSequence';

export { TableField, TableConfig };

export interface AccordionData {
  name: string;
  description: string;
}

export const AccordionData: AccordionData = {
  name: 'Categorization',
  description: 'Manage business categories, service lines, applications, and queues',
};

export const TABLE_CONFIG: Record<
  Exclude<
    CategorizationActiveView,
    | 'businessCategory'
    | 'applicationCategory'
    | 'applicationSubCategory'
    | 'applicationNumberSequence'
  >,
  TableConfig
> = {
  serviceLine: {
    title: 'Service Lines',
    subtitle: 'Define service lines and associate them with business categories',
    accent: CATEG_ACCENT,
    icon: <LinearScaleIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Service Line',
    fields: [
      { name: 'businessCategoryName', label: 'Business Category', required: true, bold: true },
      { name: 'name', label: 'Service Line Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
      { name: 'manager', label: 'Service Line Manager' },
    ],
  },
  application: {
    title: 'Applications',
    subtitle: 'Manage applications linked to service lines',
    accent: CATEG_ACCENT,
    icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Application',
    fields: [
      { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
      { name: 'name', label: 'Application Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
      { name: 'applicationLead', label: 'Application Lead' },
      { name: 'managerLevel1', label: 'Manager Level 1' },
      { name: 'managerLevel2', label: 'Manager Level 2' },
    ],
  },
  applicationQueue: {
    title: 'Application Queues',
    subtitle: 'Manage application queues and configure their routing settings',
    accent: CATEG_ACCENT,
    icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Application Queue',
    fields: [
      { name: 'applicationName', label: 'Application', required: true, bold: true },
      { name: 'name', label: 'Queue Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
      { name: 'queueSpecificLead', label: 'Queue Specific Lead' },
      { name: 'managerLevel1', label: 'Manager Level 1' },
      { name: 'managerLevel2', label: 'Manager Level 2' },
    ],
  },
};
