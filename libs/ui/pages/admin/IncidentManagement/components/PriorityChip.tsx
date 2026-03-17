import React from 'react';
import { Chip } from '@mui/material';

const PriorityChip = ({ value }: { value: unknown }) => {
  const p = String(value || '').toLowerCase();
  let color: 'error' | 'warning' | 'info' | 'success' | 'default' = 'default';
  if (p.startsWith('1')) color = 'error';
  else if (p.startsWith('2')) color = 'warning';
  else if (p.startsWith('3')) color = 'info';
  else if (p.startsWith('4')) color = 'success';
  return <Chip label={String(value || '-')} color={color} size='small' />;
};

export default PriorityChip;
