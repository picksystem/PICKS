import { Column } from '@serviceops/component';
import EditNoteIcon from '@mui/icons-material/EditNote';
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
  title: 'Field Configuration',
  subtitle: 'Define field metadata',
  accent: '#0369a1',
  icon: <EditNoteIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Field Configuration',
  fields: [
    { name: 'date', label: 'Date', required: true, type: 'date' },
    { name: 'day', label: 'Day' },
    { name: 'calendarWeek', label: 'Calendar week' },
    { name: 'calendarMonth', label: 'Calendar month' },
    { name: 'control', label: 'Control', required: true },
  ],
};
