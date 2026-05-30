import type { ReactNode } from 'react';
import { Box, Typography } from '@serviceops/component';

interface DetailFieldProps {
  label: string;
  value?: ReactNode;
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Box>{value ?? '-'}</Box>
  </Box>
);

export default DetailField;
