import { Box, Typography, Button, PageHeader } from '@serviceops/component';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';
import { useStyles } from './styles';

interface Config {
  title: string;
  prefix: string;
  numberLength: number;
  subtitle: string;
}

const CreateTicketDetail = ({ ticketType, onCancel }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const { config } = useCreateTicketDetail({ ticketType, onCancel }) as {
    config: Config;
  };

  return (
    <Box className={classes.formContainer}>
      <PageHeader
        title={config.title}
        description={config.subtitle}
        className={classes.pageHeader}
      />

      {/* No fields - placeholder */}
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ color: 'text.secondary' }}>
          Ticket creation is currently disabled.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant='outlined' onClick={onCancel}>
            Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateTicketDetail;
