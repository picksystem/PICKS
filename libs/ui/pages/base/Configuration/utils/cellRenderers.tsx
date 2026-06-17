import React from 'react';
import { alpha } from '@mui/material';
import { Box, Typography, Chip } from '@serviceops/component';

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
