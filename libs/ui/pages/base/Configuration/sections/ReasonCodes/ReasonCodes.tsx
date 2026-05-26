import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import {
  PriorityChangeSection,
  RoleChangeSection,
  ResolutionSection,
  CancellationSection,
  ReopenSection,
  ConversionSection,
} from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';

const ReasonCodes = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Reason Codes Configuration...'>
        <PriorityChangeSection />
        <RoleChangeSection />
        <ResolutionSection />
        <CancellationSection />
        <ReopenSection />
        <ConversionSection />
      </ConfigurationSection>
    </Box>
  );
};

export default ReasonCodes;
