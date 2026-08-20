import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const TicketBundle = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Ticket Bundle'
        description='Manage pre-defined ticket templates to streamline ticket creation with pre-filled fields and standardised workflows.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default TicketBundle;
