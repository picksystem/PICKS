import React from 'react';
import { Box, Typography } from '@mui/material';

interface ReadFieldProps {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}

const ReadField = ({ label, value, muted }: ReadFieldProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant='caption' color='text.secondary' display='block'>
      {label}
    </Typography>
    <Typography variant='body2' color={muted ? 'text.disabled' : 'text.primary'}>
      {(value as string) || '-'}
    </Typography>
  </Box>
);

export default ReadField;
