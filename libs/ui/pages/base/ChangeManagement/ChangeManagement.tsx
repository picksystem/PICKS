import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const ChangeManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Change Management
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Change Management posts
      </Typography>
    </Box>
  );
};

export default ChangeManagement;
