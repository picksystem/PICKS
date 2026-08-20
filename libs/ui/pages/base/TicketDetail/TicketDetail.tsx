import TicketDetailView from './TicketDetailView';

/**
 * Thin wrapper — delegates entirely to TicketDetailView which fetches
 * the ticket via the API and derives the ticket type from the response.
 * No hardcoded prefix map; every ticket type the API knows about works.
 */
const TicketDetail = () => {
  return <TicketDetailView />;
};

export default TicketDetail;
