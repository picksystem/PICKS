import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Alert, Loader } from '@serviceops/component';
import { CreateTicketDetail } from './components';
import { ROUTE_SLUG_MAP } from './utils/CreateTicket.utils';
import { useGetTicketTypeQuery } from '../../../../services';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';

const CreateTicketForm = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { BasePath } = constants;
  const { classes } = useStyles();
  const { data: ticketTypes, isLoading } = useGetTicketTypeQuery();

  // Reverse-lookup: routeSlug → type key (e.g. "create-incident-request" → "incident")
  const typeKey =
    Object.entries(ROUTE_SLUG_MAP).find(([, slug]) => slug === type)?.[0] ??
    type?.replace(/^create-/, '').replace(/-/g, '_');

  const record = ticketTypes?.find((t) => t.type === typeKey && t.isActive);

  const handleBack = () => navigate(BasePath.CREATE_TICKET);
  const handleSuccess = () => navigate(BasePath.INCIDENT_MANAGEMENT);

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

  if (isLoading) {
    return (
      <Box className={classes.container} sx={{ p: 3 }}>
        <Loader />
      </Box>
    );
  }

  // Any active ticket type configured in Configuration → Ticket Types renders
  // the unified generic form
  if (record) {
    return (
      <Box className={classes.container}>
        <CreateTicketDetail ticketType={typeKey} onCancel={handleBack} onSuccess={handleSuccess} />
      </Box>
    );
  }

  // Invalid, deactivated, or deleted ticket type slug
  return (
    <Box className={classes.container} sx={{ p: 3 }}>
      <Alert severity='info'>This ticket type is not available.</Alert>
      <Box className={classes.comingSoonBox}>
        <Button variant='outlined' onClick={handleBack}>
          Back to Ticket Selection
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTicketForm;
