import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const Reports = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Reports Management
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Reports Management posts
      </Typography>
    </Box>
  );
};

export default Reports;
