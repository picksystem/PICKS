import { Column } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { mkCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigField } from '../FieldConfigurations/FieldConfigurationsSection.types';

export const FIELD_CONFIG_COLUMNS: Column<IConfigField>[] = [
  { id: 'date', label: 'Date', minWidth: 150, format: mkCell(true) },
  { id: 'day', label: 'Day', minWidth: 150, format: mkCell() },
  { id: 'calendarWeek', label: 'Calendar week', minWidth: 150, format: mkCell() },
  { id: 'calendarMonth', label: 'Calendar month', minWidth: 150, format: mkCell() },
  { id: 'control', label: 'Control', minWidth: 150, format: mkCell() },
];

export const FIELD_CONFIG_TABLE: TableConfig = {
  title: 'Working Times',
  subtitle: 'Define field metadata',
  accent: '#0369a1',
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Time',
  fields: [
    { name: 'date', label: 'Date', required: true, type: 'date' },
    { name: 'day', label: 'Day' },
    { name: 'calendarWeek', label: 'Calendar week' },
    { name: 'calendarMonth', label: 'Calendar month' },
    { name: 'control', label: 'Control', required: true },
  ],
};
