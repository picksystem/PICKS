import type {
  TableField,
  TableConfig,
} from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';

export const TS_ACCENT = '#0369a1';

export { TableField, TableConfig };

export interface AccordionData {
  name: string;
  description: string;
}

export const TimesheetAccordionData: AccordionData = {
  name: 'Timesheets',
  description: 'Manage timesheet projects, categories, and reason codes',
};
