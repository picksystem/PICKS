import { Box, Typography } from '../';
import { useStyles } from './styles';

const NotFound = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Typography className={classes.code}>404</Typography>
      <Typography className={classes.message}>Page Not Found</Typography>
    </Box>
  );
};

export default NotFound;
