import { Box, Loader } from '@serviceops/component';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { TicketStatusesSection } from './components/TicketStatuses/TicketStatusesSection';
import { ReleaseCycleStatusesSection } from './components/ReleaseCycleStatuses/ReleaseCycleStatusesSection';

const Statuses = () => {
  const { classes } = useStyles();
  const { isLoading } = useConfiguration();
  const { data: ticketTypes = [] } = useGetTicketTypeQuery();

  const activeTicketTypeColumns =
    ticketTypes.length > 0
      ? ticketTypes
          .filter((t) => t.isActive)
          .map((t) => ({ key: t.type, label: t.displayName || t.type }))
      : [
          { key: 'incident', label: 'Incident' },
          { key: 'service_request', label: 'Service Request' },
          { key: 'advisory_request', label: 'Advisory' },
          { key: 'change_request', label: 'Change Request' },
          { key: 'problem_request', label: 'Problem Request' },
          { key: 'task', label: 'Task' },
        ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <TicketStatusesSection activeTicketTypeColumns={activeTicketTypeColumns} />
      <ReleaseCycleStatusesSection activeTicketTypeColumns={activeTicketTypeColumns} />
    </Box>
  );
};

export default Statuses;
