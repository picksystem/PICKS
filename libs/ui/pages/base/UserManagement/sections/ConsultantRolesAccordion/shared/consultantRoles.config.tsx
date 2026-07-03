import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Box, Column, Typography } from '@serviceops/component';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigUserConsultantRole } from '@serviceops/interfaces';
import { parseRichText } from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export const CONSULTANT_ROLES_ACCENT = '#0369a1';

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

export const consultantRoleColumns: Column<IConfigUserConsultantRole>[] = [
  { id: 'application', label: 'Application', minWidth: 150, format: mkCell(true) },
  { id: 'consultantRole', label: 'Consultant Roles', minWidth: 160, format: mkCell(true) },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200, format: mkRichTextCell },
  { id: 'description', label: 'Description', minWidth: 200, format: mkRichTextCell },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkRichTextCell },
  { id: 'isActive', label: 'Activation', minWidth: 110, format: (v) => mkActiveChip(v) },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const CONSULTANT_ROLES_TABLE: TableConfig = {
  title: 'Consultant Roles',
  subtitle: 'Define consultant roles available per application',
  accent: CONSULTANT_ROLES_ACCENT,
  icon: <GroupAddIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant Role',
  fields: [
    { name: 'application', label: 'Application', required: true, type: 'applicationSearch' },
    { name: 'consultantRole', label: 'Consultant Roles', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description', required: true, type: 'richText' },
    { name: 'description', label: 'Description', type: 'richText' },
    { name: 'internalNote', label: 'Internal Note', type: 'richText' },
    {
      name: 'isActive',
      label: 'Activation',
      type: 'activationToggle',
      defaultValue: true,
      activationDescriptionActive: 'This consultant role is active',
      activationDescriptionInactive: 'This consultant role is inactive',
      activationAccent: CONSULTANT_ROLES_ACCENT,
    },
  ],
};
