import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const Timesheet = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Timesheet'
        description='View, log, and manage timesheet entries across different projects in the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default Timesheet;
