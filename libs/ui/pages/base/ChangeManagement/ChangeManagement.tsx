import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const ChangeManagement = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Change Management'
        description='View and manage all change management posts across different projects in the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default ChangeManagement;
