import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ value }: { value: unknown }) => {
  const s = String(value || '').toLowerCase();
  let color: 'error' | 'warning' | 'info' | 'success' | 'default' = 'default';
  if (s === 'new') color = 'info';
  else if (s === 'in_progress' || s === 'assigned') color = 'warning';
  else if (s === 'resolved' || s === 'closed') color = 'success';
  else if (s === 'cancelled') color = 'error';
  const label = String(value || '-')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return <Chip label={label} color={color} size='small' variant='outlined' />;
};

export default StatusChip;
