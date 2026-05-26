import React from 'react';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import { IConfigWorkingDayTemplate } from '@serviceops/interfaces';
import { Column, Typography, Chip } from '@serviceops/component';
import { TableConfig } from '../shared';

export const AccentColor = '#0369a1';

export const fmtHours = (h: number) => (h > 0 ? `${h}h` : '—');

export const HoursCell =
  (color: string) =>
  (v: unknown): React.ReactNode => {
    const h = Number(v ?? 0);
    return (
      <Typography
        variant='body2'
        fontSize='0.82rem'
        fontWeight={h > 0 ? 700 : 400}
        color={h > 0 ? color : 'text.disabled'}
      >
        {fmtHours(h)}
      </Typography>
    );
  };

export const TotalCell = (_v: unknown, row: IConfigWorkingDayTemplate): React.ReactNode => {
  const total =
    (row.mondayHours ?? 0) +
    (row.tuesdayHours ?? 0) +
    (row.wednesdayHours ?? 0) +
    (row.thursdayHours ?? 0) +
    (row.fridayHours ?? 0) +
    (row.saturdayHours ?? 0) +
    (row.sundayHours ?? 0);
  return (
    <Chip
      label={`${total}h`}
      size='small'
      sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.78rem' }}
    />
  );
};

export const workingDayTemplateColumns: Column<IConfigWorkingDayTemplate>[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 160,
    format: (v) => (
      <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
        {String(v || '—')}
      </Typography>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 200,
    format: (v) => (
      <Typography
        variant='body2'
        color='text.secondary'
        fontSize='0.8rem'
        noWrap
        sx={{ maxWidth: 220 }}
      >
        {String(v || '—')}
      </Typography>
    ),
  },
  { id: 'mondayHours', label: 'Monday', minWidth: 80, format: HoursCell(AccentColor) },
  { id: 'tuesdayHours', label: 'Tuesday', minWidth: 80, format: HoursCell(AccentColor) },
  { id: 'wednesdayHours', label: 'Wednesday', minWidth: 90, format: HoursCell(AccentColor) },
  { id: 'thursdayHours', label: 'Thursday', minWidth: 85, format: HoursCell(AccentColor) },
  { id: 'fridayHours', label: 'Friday', minWidth: 75, format: HoursCell(AccentColor) },
  { id: 'saturdayHours', label: 'Saturday', minWidth: 85, format: HoursCell('#ea580c') },
  { id: 'sundayHours', label: 'Sunday', minWidth: 80, format: HoursCell('#dc2626') },
  { id: 'total', label: 'Total Working Hours', minWidth: 140, format: TotalCell },
];

export const WORKING_DAY_TEMPLATE_CONFIG: TableConfig = {
  title: 'Working Day Templates',
  subtitle: 'Define reusable weekly working hour schedules for SLA and calendar calculations',
  accent: AccentColor,
  icon: <ViewWeekIcon sx={{ fontSize: '1rem', color: '#fff' }} />,
  entity: 'Working Day Template',
  fields: [
    { name: 'name', label: 'Template Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
  ],
};
