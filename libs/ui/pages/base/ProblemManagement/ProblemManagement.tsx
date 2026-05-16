import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const ProblemManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Problem Management'
        description='View and manage all problem management posts across the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default ProblemManagement;
