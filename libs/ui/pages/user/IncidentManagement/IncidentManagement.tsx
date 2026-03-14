import { Box, Typography } from '@picks/component';
import { useStyles } from './styles';

const IncidentManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.pageHeader}>
      <Box className={classes.pageHeaderRow}>
        <Typography variant='h5' className={classes.title}>
          Incident Management
        </Typography>
      </Box>
      <Typography variant='body2' className={classes.description}>
        Here you can manage your Incident Management posts
      </Typography>
    </Box>
  );
};

export default IncidentManagement;
