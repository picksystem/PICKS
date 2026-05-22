import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { WorkLocations } from './components/WorkLocations';

const UserConfig = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <WorkLocations />
    </Box>
  );
};

export default UserConfig;
