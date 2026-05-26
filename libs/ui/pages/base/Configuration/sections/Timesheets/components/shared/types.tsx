import { ReactNode } from 'react';

export const TS_ACCENT = '#0369a1';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'number' | 'toggle';
}

export interface TableConfig {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  entity: string;
  fields: TableField[];
}

export interface AccordionData {
  name: string;
  description: string;
}

export const TimesheetAccordionData: AccordionData = {
  name: 'Timesheets',
  description: 'Manage timesheet projects, categories, and reason codes',
};
