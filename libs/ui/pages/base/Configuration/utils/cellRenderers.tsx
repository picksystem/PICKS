import React from 'react';
import { Typography, Chip, alpha } from '@mui/material';

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
