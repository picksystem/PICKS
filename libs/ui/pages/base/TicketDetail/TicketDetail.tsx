import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import IncidentDetail from '../IncidentDetail/IncidentDetail';
import GenericTicketDetailView from './GenericTicketDetailView';

/** Detect ticket type from number prefix (e.g. INC0001234 → incident) */
const PREFIX_TYPE_MAP: Record<string, string> = {
  INC: 'incident',
  SRQ: 'service_request',
  ADV: 'advisory_request',
  CHG: 'change_request',
  PRB: 'problem_request',
  TSK: 'task',
};

const detectTypeFromNumber = (number?: string): string | null => {
  if (!number) return null;
  const prefix = number.match(/^([A-Z]+)/)?.[1];
  return prefix ? (PREFIX_TYPE_MAP[prefix] ?? null) : null;
};

/**
 * Unified Ticket Detail Page
 * Detects ticket type from the URL number param and renders the appropriate detail view.
 *
 * switch(ticketType) {
 *   case 'incident':          → IncidentDetail (full-featured existing component)
 *   case 'service_request':   → GenericTicketDetailView
 *   case 'advisory_request':  → GenericTicketDetailView
 *   case 'change_request':    → GenericTicketDetailView
 *   case 'problem_request':   → GenericTicketDetailView
 *   case 'task':              → GenericTicketDetailView
 *   default:                  → not-found message
 * }
 */
const TicketDetail = () => {
  const { number } = useParams<{ number: string }>();
  const ticketType = detectTypeFromNumber(number);

  switch (ticketType) {
    case 'incident':
      // IncidentDetail reads :number from useParams itself — no extra props needed
      return <IncidentDetail />;

    case 'service_request':
    case 'advisory_request':
    case 'change_request':
    case 'problem_request':
    case 'task':
      return <GenericTicketDetailView ticketType={ticketType} />;

    default:
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
            Unknown ticket type
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            Could not determine the ticket type from number: <strong>{number}</strong>
          </Typography>
        </Box>
      );
  }
};

export default TicketDetail;
