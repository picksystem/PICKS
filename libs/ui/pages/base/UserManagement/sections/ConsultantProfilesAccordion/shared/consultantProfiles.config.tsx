import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { Box, Column, Typography } from '@serviceops/component';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigUserConsultantProfile } from '@serviceops/interfaces';
import { parseRichText } from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export const CONSULTANT_PROFILES_ACCENT = '#0369a1';

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

export const consultantProfileColumns: Column<IConfigUserConsultantProfile>[] = [
  { id: 'consultantName', label: 'Consultant Name', minWidth: 160, format: mkCell(true) },
  { id: 'application', label: 'Application', minWidth: 150, format: mkCell() },
  { id: 'consultantRole', label: 'Consultant Roles', minWidth: 150, format: mkCell() },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'activeFromDate', label: 'Active From Date', minWidth: 130, format: mkCell() },
  { id: 'activeToDate', label: 'Active To Date', minWidth: 130, format: mkCell() },
  { id: 'isActive', label: 'Activation', minWidth: 110, format: (v) => mkActiveChip(v) },
  { id: 'workLocation', label: 'Work Location', minWidth: 150, format: mkCell() },
  { id: 'workingCalendar', label: 'Working Calendar', minWidth: 160, format: mkCell() },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 160, format: mkCell() },
  { id: 'leadConsultant', label: 'Lead Consultant', minWidth: 150, format: mkCell() },
  { id: 'manager', label: 'Manager', minWidth: 150, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const CONSULTANT_PROFILES_TABLE: TableConfig = {
  title: 'Consultant Profiles',
  subtitle: 'Manage consultant profiles, calendar assignments and reporting lines',
  accent: CONSULTANT_PROFILES_ACCENT,
  icon: <BusinessCenterIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant Profile',
  fields: [
    { name: 'consultantName', label: 'Consultant Name', required: true, bold: true },
    { name: 'application', label: 'Application', required: true, type: 'applicationSearch' },
    { name: 'consultantRole', label: 'Consultant Roles' },
    { name: 'shortDescription', label: 'Short Description', required: true, type: 'richText' },
    { name: 'activeFromDate', label: 'Active From Date', required: true, type: 'date' },
    { name: 'activeToDate', label: 'Active To Date', required: true, type: 'date' },
    {
      name: 'isActive',
      label: 'Activation',
      required: true,
      type: 'activationToggle',
      defaultValue: true,
      activationDescriptionActive: 'This consultant profile is active',
      activationDescriptionInactive: 'This consultant profile is inactive',
      activationAccent: CONSULTANT_PROFILES_ACCENT,
    },
    { name: 'workLocation', label: 'Work Location', required: true, type: 'workLocationSearch' },
    { name: 'workingCalendar', label: 'Working Calendar', required: true },
    { name: 'holidayCalendar', label: 'Holiday Calendar', required: true },
    { name: 'leadConsultant', label: 'Lead Consultant', required: true },
    { name: 'manager', label: 'Manager', required: true },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
  ],
};
