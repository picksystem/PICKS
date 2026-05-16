import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const ProblemManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Problem Management
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Problem Management posts
      </Typography>
    </Box>
  );
};

export default ProblemManagement;
