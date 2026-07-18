import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, Column, Typography } from '@serviceops/component';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigUserWorkLocation } from '@serviceops/interfaces';
import { parseRichText } from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export const WORK_LOCATIONS_ACCENT = '#0369a1';

const mkRichTextCell = (v: unknown): React.ReactNode => {
  const val = v as string | undefined;
  if (!val) return <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>—</Typography>;

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

// ── Column Definitions ─────────────────────────────────────────────────────────

export const workLocationColumns: Column<IConfigUserWorkLocation>[] = [
  { id: 'workLocation', label: 'Work Location', minWidth: 160, format: mkCell(true) },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'description', label: 'Description', minWidth: 200, format: mkRichTextCell },
  { id: 'street', label: 'Street', minWidth: 150, format: mkCell() },
  { id: 'city', label: 'City', minWidth: 130, format: mkCell() },
  { id: 'state', label: 'State/Province', minWidth: 140, format: mkCell() },
  { id: 'country', label: 'Country', minWidth: 130, format: mkCell() },
  { id: 'postCode', label: 'Post-code', minWidth: 110, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
  { id: 'isActive', label: 'Activation', minWidth: 110, format: (v) => mkActiveChip(v) },
  { id: 'workingCalendar', label: 'Working Calendar', minWidth: 160, format: mkCell() },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 160, format: mkCell() },
  { id: 'timezone', label: 'Timezone', minWidth: 140, format: mkCell() },
  { id: 'dateFormat', label: 'Date Format', minWidth: 120, format: mkCell() },
  { id: 'timeFormat', label: 'Time Format', minWidth: 120, format: mkCell() },
  { id: 'language', label: 'Language', minWidth: 120, format: mkCell() },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const WORK_LOCATIONS_TABLE: TableConfig = {
  title: 'Work Locations',
  subtitle: 'Manage work locations, addresses and their calendar/locale assignments',
  accent: WORK_LOCATIONS_ACCENT,
  icon: <LocationOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Work Location',
  fields: [
    { name: 'workLocation', label: 'Work Location', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description', required: true, type: 'richText' },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'street', label: 'Street' },
    { name: 'city', label: 'City', required: true },
    { name: 'state', label: 'State/Province', required: true },
    { name: 'country', label: 'Country', required: true },
    { name: 'postCode', label: 'Post-code', required: true },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
    {
      name: 'isActive',
      label: 'Activation',
      type: 'activationToggle',
      defaultValue: true,
      activationDescriptionActive: 'This work location is active',
      activationDescriptionInactive: 'This work location is inactive',
      activationAccent: WORK_LOCATIONS_ACCENT,
    },
    {
      name: 'workingCalendar',
      label: 'Working Calendar',
      required: true,
      type: 'workingCalendarSearch',
    },
    {
      name: 'holidayCalendar',
      label: 'Holiday Calendar',
      required: true,
      type: 'holidayCalendarSearch',
    },
    { name: 'timezone', label: 'Timezone', required: true },
    { name: 'dateFormat', label: 'Date Format', required: true },
    { name: 'timeFormat', label: 'Time Format', required: true },
    { name: 'language', label: 'Language', required: true },
  ],
};
