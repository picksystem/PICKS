import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const CabRequest = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Cab Request
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Cab Request posts
      </Typography>
    </Box>
  );
};

export default CabRequest;
