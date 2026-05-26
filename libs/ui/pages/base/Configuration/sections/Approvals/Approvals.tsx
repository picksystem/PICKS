import { Box } from '@serviceops/component';
import { ApprovalsSection } from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useStyles } from './styles';

const Approvals = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Approvals Configuration...'>
        <ApprovalsSection />
      </ConfigurationSection>
    </Box>
  );
};

export default Approvals;
