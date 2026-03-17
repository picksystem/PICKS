import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const TimeManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Time Management
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Time Management posts
      </Typography>
    </Box>
  );
};

export default TimeManagement;
