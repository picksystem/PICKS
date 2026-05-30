import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { UserConfigSection } from './components/UserConfigSection';
import { ConfigurationSection } from '@serviceops/configsection';

const UserConfig = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading User Configuration...'>
        <UserConfigSection />
      </ConfigurationSection>
    </Box>
  );
};

export default UserConfig;
