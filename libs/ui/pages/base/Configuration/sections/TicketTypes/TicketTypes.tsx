import { useState } from 'react';
import { Box, Alert } from '@serviceops/component';
import { Loader } from '../../../../../components';
import { useStyles } from './styles';
import { TicketTypeConfigSection } from './components/TicketTypeConfig/TicketTypeConfigSection';
import { ServiceLineSpecificSection } from './components/ServiceLineSpecific/ServiceLineSpecificSection';
import { ApplicationSpecificSection } from './components/ApplicationSpecific/ApplicationSpecificSection';
import { useTicketTypes } from '../../hooks/useTicketTypes';

const TicketTypes = () => {
  const { classes } = useStyles();
  const { isLoading, error } = useTicketTypes();
  const [advancedDisplaySequences, setAdvancedDisplaySequences] = useState(false);

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Alert severity='error' sx={{ mt: 2 }}>
          Failed to load ticket types. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <TicketTypeConfigSection
        advancedDisplaySequences={advancedDisplaySequences}
        setAdvancedDisplaySequences={setAdvancedDisplaySequences}
      />
      <ServiceLineSpecificSection />
      <ApplicationSpecificSection />
    </Box>
  );
};

export default TicketTypes;
