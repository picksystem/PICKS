import React from 'react';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IConfigWorkingDayTemplate, IConfigWorkingDayTemplateTime } from '@serviceops/interfaces';
import { Box, Column, Typography, Chip } from '@serviceops/component';
import { mkCell } from '@serviceops/configutils';
import { parseRichText } from '@serviceops/pages/base/Configuration/shared/RichTextEditor';
import { TableConfig } from '../shared';

const mkRichTextCell = (v: unknown): React.ReactNode => {
  const val = v as string | undefined;
  if (!val) return <Typography sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>—</Typography>;

  const richTextValue = parseRichText(val);
  return (
    <Box
      sx={{
        fontSize: '0.82rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {richTextValue.segments.map((segment, index) => (
        <Typography
          key={index}
          component='span'
          sx={{
            fontSize: '0.82rem',
            fontWeight: segment.bold ? 700 : 400,
            fontStyle: segment.italic ? 'italic' : 'normal',
            textDecoration: segment.underline ? 'underline' : 'normal',
            display: 'inline',
          }}
        >
          {segment.text}
        </Typography>
      ))}
    </Box>
  );
};

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

export const EfficiencyCell = (v: unknown): React.ReactNode => {
  const val = Number(v ?? 0);
  return (
    <Typography
      variant='body2'
      fontSize='0.82rem'
      fontWeight={val > 0 ? 700 : 400}
      color={val > 0 ? AccentColor : 'text.disabled'}
    >
      {val > 0 ? `${val}%` : '—'}
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
  { id: 'name', label: 'Working time template', minWidth: 180, format: mkCell(true) },
  { id: 'shortDescription', label: 'Short description', minWidth: 180, format: mkRichTextCell },
  { id: 'description', label: 'Description', minWidth: 200, format: mkRichTextCell },
  { id: 'internalNote', label: 'Internal note', minWidth: 200, format: mkRichTextCell },
  { id: 'mondayHours', label: 'Monday', minWidth: 80, format: HoursCell(AccentColor) },
  { id: 'tuesdayHours', label: 'Tuesday', minWidth: 80, format: HoursCell(AccentColor) },
  { id: 'wednesdayHours', label: 'Wednesday', minWidth: 90, format: HoursCell(AccentColor) },
  { id: 'thursdayHours', label: 'Thursday', minWidth: 85, format: HoursCell(AccentColor) },
  { id: 'fridayHours', label: 'Friday', minWidth: 75, format: HoursCell(AccentColor) },
  { id: 'saturdayHours', label: 'Saturday', minWidth: 85, format: HoursCell('#ea580c') },
  { id: 'sundayHours', label: 'Sunday', minWidth: 80, format: HoursCell('#dc2626') },
  { id: 'total', label: 'Total working hours', minWidth: 140, format: TotalCell },
];

export const WORKING_DAY_TEMPLATE_CONFIG: TableConfig = {
  title: 'Working Time Templates',
  subtitle: 'Define reusable weekly working hour schedules for SLA and calendar calculations',
  accent: AccentColor,
  icon: <ViewWeekIcon sx={{ fontSize: '1rem', color: '#fff' }} />,
  entity: 'Working Time Template',
  fields: [
    { name: 'name', label: 'Working time template', required: true, bold: true },
    { name: 'shortDescription', label: 'Short description', type: 'richText', required: true },
    { name: 'description', label: 'Description', type: 'richText', required: true },
    { name: 'internalNote', label: 'Internal note', type: 'richText', required: true },
    {
      name: 'mondayHours',
      label: 'Monday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'monday',
      defaultValue: 8,
    },
    {
      name: 'tuesdayHours',
      label: 'Tuesday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'tuesday',
      defaultValue: 8,
    },
    {
      name: 'wednesdayHours',
      label: 'Wednesday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'wednesday',
      defaultValue: 8,
    },
    {
      name: 'thursdayHours',
      label: 'Thursday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'thursday',
      defaultValue: 8,
    },
    {
      name: 'fridayHours',
      label: 'Friday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'friday',
      defaultValue: 8,
    },
    {
      name: 'saturdayHours',
      label: 'Saturday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'saturday',
      defaultValue: 0,
    },
    {
      name: 'sundayHours',
      label: 'Sunday (HH:MM)',
      type: 'dayWorkingTimes',
      day: 'sunday',
      defaultValue: 0,
    },
    {
      name: 'totalWorkingHours',
      label: 'Total working hours',
      type: 'computedSum',
      sumFields: [
        'mondayHours',
        'tuesdayHours',
        'wednesdayHours',
        'thursdayHours',
        'fridayHours',
        'saturdayHours',
        'sundayHours',
      ],
    },
  ],
};

// Flattened row used by the data table: one row per time block, joined
// with its template name and weekday label for display, plus the
// derived (display-only) working hours for that block.
export interface WorkingTimeRow extends IConfigWorkingDayTemplateTime {
  workingDayTemplateName: string;
  dayLabel: string;
  workingHours: number;
}

export const workingDayTemplateTimesColumns: Column<WorkingTimeRow>[] = [
  {
    id: 'workingDayTemplateName',
    label: 'Working time template',
    minWidth: 170,
    format: mkCell(true),
  },
  { id: 'dayLabel', label: 'Day', minWidth: 100, format: mkCell() },
  { id: 'fromTime', label: 'From', minWidth: 90, format: mkCell() },
  { id: 'toTime', label: 'To', minWidth: 90, format: mkCell() },
  { id: 'workingHours', label: 'Working hours', minWidth: 130, format: HoursCell(AccentColor) },
  { id: 'efficiency', label: 'Efficiency', minWidth: 120, format: EfficiencyCell },
];

export const WORKING_DAY_TEMPLATE_TIMES_CONFIG: TableConfig = {
  title: 'Create Working Times',
  subtitle: 'Define time blocks with working hours and efficiency for each working day template',
  accent: AccentColor,
  icon: <AccessTimeIcon sx={{ fontSize: '1rem', color: '#fff' }} />,
  entity: 'Working Time',
  fields: [
    { name: 'workingDayTemplateName', label: 'Working time template', bold: true },
    { name: 'dayLabel', label: 'Day' },
    { name: 'fromTime', label: 'From' },
    { name: 'toTime', label: 'To' },
    { name: 'efficiency', label: 'Efficiency' },
  ],
};
