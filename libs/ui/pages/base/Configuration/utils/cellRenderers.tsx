import React from 'react';
import { alpha } from '@mui/material';
import { Box, Typography, Chip } from '@serviceops/component';
import { parseRichText } from '../shared/RichTextEditor';

export const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 700 : 400} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

export const mkDescCell = (v: unknown): React.ReactNode => (
  <Typography
    variant='body2'
    color='text.secondary'
    fontSize='0.8rem'
    noWrap
    sx={{ maxWidth: 260 }}
  >
    {String(v || '—')}
  </Typography>
);

export const mkChip =
  (accent: string) =>
  (v: unknown): React.ReactNode => (
    <Chip
      label={String(v || '—')}
      size='small'
      sx={{
        height: 20,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: alpha(accent, 0.12),
        color: accent,
      }}
    />
  );

// Pill-style active/inactive status badge with status dot
export const mkActiveChip = (v: unknown): React.ReactNode => {
  const on = Boolean(v);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.4,
        borderRadius: 999,
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        minWidth: 96,
        border: '1px solid',
        borderColor: on ? '#16a34a' : '#cbd5e1',
        bgcolor: on ? '#dcfce7' : '#f1f5f9',
        color: on ? '#15803d' : '#64748b',
      }}
    >
      <Box
        component='span'
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: on ? '#16a34a' : '#94a3b8',
          boxShadow: on ? '0 0 0 3px rgba(22, 163, 74, 0.18)' : 'none',
        }}
      />
      {on ? 'Active' : 'Inactive'}
    </Box>
  );
};

// Pill-style Yes/No badge for plain boolean toggle fields (not row activation)
export const mkYesNoChip = (v: unknown): React.ReactNode => {
  const on = Boolean(v);
  return (
    <Chip
      label={on ? 'Yes' : 'No'}
      size='small'
      sx={{
        height: 20,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: on ? alpha('#059669', 0.12) : alpha('#9ca3af', 0.12),
        color: on ? '#059669' : '#6b7280',
      }}
    />
  );
};

// Renders a serialized rich-text value (from RichTextEditor) preserving bold/italic/underline
export const mkRichTextCell = (v: unknown): React.ReactNode => {
  const val = v as string | undefined;
  if (!val) return <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>—</Typography>;

  const richTextValue = parseRichText(val);
  return (
    <Box
      sx={{
        fontSize: '0.8rem',
        color: 'text.secondary',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {richTextValue.segments.map((segment, index) => (
        <Typography
          key={index}
          component='span'
          sx={{
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
