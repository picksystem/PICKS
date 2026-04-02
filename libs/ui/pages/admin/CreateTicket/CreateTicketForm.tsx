import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Alert } from '@serviceops/component';
import { CreateTicketDetail } from './components';
import { ROUTE_SLUG_MAP } from './utils/CreateTicket.utils';
import { TICKET_CONFIG } from './components/CreateTicketDetail/util';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';

const CreateTicketForm = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { AdminPath } = constants;
  const { classes } = useStyles();

  // Reverse-lookup: routeSlug → type key (e.g. "create-incident-request" → "incident")
  const typeKey =
    Object.entries(ROUTE_SLUG_MAP).find(([, slug]) => slug === type)?.[0] ??
    type?.replace(/^create-/, '').replace(/-/g, '_');

  const handleBack = () => navigate(AdminPath.CREATE_TICKET);
  const handleSuccess = () => navigate(AdminPath.INCIDENT_MANAGEMENT);

  if (!typeKey) {
    return (
      <Box className={classes.container} sx={{ p: 3 }}>
        <Alert severity='error'>Invalid ticket type. Please go back and select a valid type.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant='outlined' onClick={handleBack}>
            Back to Ticket Selection
          </Button>
        </Box>
      </Box>
    );
  }

  // Known ticket types render the unified dynamic form
  if (TICKET_CONFIG[typeKey]) {
    return (
      <Box className={classes.container}>
        <CreateTicketDetail ticketType={typeKey} onCancel={handleBack} onSuccess={handleSuccess} />
      </Box>
    );
  }

  // Unknown / future ticket types — coming soon
  return (
    <Box className={classes.container} sx={{ p: 3 }}>
      <Alert severity='info'>{typeKey.replace(/_/g, ' ')} form is coming soon.</Alert>
      <Box className={classes.comingSoonBox}>
        <Button variant='outlined' onClick={handleBack}>
          Back to Ticket Selection
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTicketForm;
