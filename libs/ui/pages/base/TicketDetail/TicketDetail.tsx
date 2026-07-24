import { useParams } from 'react-router-dom';
import { Box, Typography } from '@serviceops/component';
import TicketDetailView from './TicketDetailView';

/** Detect ticket type from number prefix (e.g. INC0001234 → incident) */
const PREFIX_TYPE_MAP: Record<string, string> = {
  INC: 'incident',
  SRQ: 'service_request',
  ADV: 'advisory_request',
  CHG: 'change_request',
  PRB: 'problem_request',
  TSK: 'task',
};

const SUPPORTED_TYPES = new Set(['incident', 'service_request', 'advisory_request']);

const detectTypeFromNumber = (number?: string): string | null => {
  if (!number) return null;
  const prefix = number.match(/^([A-Z]+)/)?.[1];
  return prefix ? (PREFIX_TYPE_MAP[prefix] ?? null) : null;
};

/**
 * Unified Ticket Detail Page — one component handles every ticket type.
 * Change Request / Problem Request / Task have no backend support yet
 * (no data model, no API), so they show a friendly "not available" state
 * instead of attempting to load.
 */
const TicketDetail = () => {
  const { number } = useParams<{ number: string }>();
  const ticketType = detectTypeFromNumber(number);

  if (ticketType && SUPPORTED_TYPES.has(ticketType)) {
    return <TicketDetailView />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant='h6' color='text.secondary'>
        {ticketType ? 'Ticket type not yet available' : 'Unknown ticket type'}
      </Typography>
      <Typography variant='body2' color='text.disabled'>
        {ticketType
          ? `Detail pages for this ticket type are not yet supported.`
          : `Could not determine the ticket type from number: `}
        <strong>{number}</strong>
      </Typography>
    </Box>
  );
};

export default TicketDetail;
