import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const TimeManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Time Management'
        description='View and manage all time entries across different projects in the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default TimeManagement;
