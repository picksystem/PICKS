import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const Reports = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Reports Management'
        description='View and manage all reports across the system. Click a row to open it in a new tab.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default Reports;
