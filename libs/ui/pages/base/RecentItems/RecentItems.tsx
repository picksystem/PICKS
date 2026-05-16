import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const RecentItems = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Recent Items'
        description='View your recently accessed items across the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default RecentItems;
