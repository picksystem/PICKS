import { Chip } from '@serviceops/component';
import { alpha } from '@mui/material';

const TICKET_TYPE_COLORS: Record<string, string> = {
  incident: '#dc2626',
  service_request: '#2563eb',
  advisory_request: '#7c3aed',
};
const FALLBACK_COLOR = '#64748b';

const TicketTypeChip = ({ type, name }: { type: string; name: string }) => {
  const color = TICKET_TYPE_COLORS[type] ?? FALLBACK_COLOR;
  return (
    <Chip
      label={name}
      size='small'
      sx={{
        bgcolor: alpha(color, 0.12),
        color,
        fontWeight: 600,
        border: `1px solid ${alpha(color, 0.35)}`,
      }}
    />
  );
};

export default TicketTypeChip;
