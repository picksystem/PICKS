import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import {
  TicketTypeConfigSection,
  ServiceLineSpecificSection,
  ApplicationSpecificSection,
} from './components';
import { ConfigurationSection } from '../../shared/ConfigurationSection/ConfigurationSection';

const TicketTypes = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Ticket Types Configuration...'>
        <TicketTypeConfigSection />
        <ServiceLineSpecificSection />
        <ApplicationSpecificSection />
      </ConfigurationSection>
    </Box>
  );
};

export default TicketTypes;
