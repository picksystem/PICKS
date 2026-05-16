import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const CabRequest = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Cab Request'
        description='View and manage all cab requests across different projects in the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default CabRequest;
