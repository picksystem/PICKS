import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { ConfigurationSection } from '@serviceops/configsection';
import { TicketStatusesSection, ReleaseCycleStatusesSection } from './components';
import { useSharedTicketTypes } from '../../hooks/useSharedTicketTypes';

const Statuses = () => {
  const { classes } = useStyles();
  const { ticketTypes } = useSharedTicketTypes();

  const activeTicketTypeColumns =
    ticketTypes.length > 0
      ? ticketTypes.filter((t) => t.isActive).map((t) => ({ key: t.type, label: t.name }))
      : [
          { key: 'incident', label: 'Incident' },
          { key: 'service_request', label: 'Service Request' },
          { key: 'advisory_request', label: 'Advisory' },
          { key: 'change_request', label: 'Change Request' },
          { key: 'problem_request', label: 'Problem Request' },
          { key: 'task', label: 'Task' },
        ];

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Statuses Configuration...'>
        <TicketStatusesSection activeTicketTypeColumns={activeTicketTypeColumns} />
        <ReleaseCycleStatusesSection activeTicketTypeColumns={activeTicketTypeColumns} />
      </ConfigurationSection>
    </Box>
  );
};

export default Statuses;
