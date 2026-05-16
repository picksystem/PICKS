import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const TestScripts = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Test Scripts'
        description='View and manage all test scripts across the system. Click a row to open it in a new tab.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default TestScripts;
