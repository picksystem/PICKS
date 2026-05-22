import React from 'react';
import { alpha, Box, Typography } from '@mui/material';

export const PanelHeader = ({
  accent,
  icon,
  title,
}: {
  accent: string;
  icon: React.ReactNode;
  title: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      bgcolor: alpha(accent, 0.08),
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderRadius: '10px 10px 0 0',
      borderBottom: 'none',
    }}
  >
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
  </Box>
);
