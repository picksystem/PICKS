import React from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';

export const PanelTable = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
  <Paper
    elevation={1}
    sx={{
      borderRadius: '0 0 10px 10px',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderTop: 'none',
    }}
  >
    {children}
  </Paper>
);

export const NoPick = ({ text }: { text: string }) => (
  <Box
    sx={{
      py: 6,
      textAlign: 'center',
      border: '1px solid',
      borderTop: 'none',
      borderColor: 'divider',
      borderRadius: '0 0 10px 10px',
      bgcolor: 'grey.50',
    }}
  >
    <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
      {text}
    </Typography>
  </Box>
);
