import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { WorkLocationsSection } from './components/WorkLocations';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';

const UserConfig = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading User Configuration...'>
        <WorkLocationsSection />
      </ConfigurationSection>
    </Box>
  );
};

export default UserConfig;
