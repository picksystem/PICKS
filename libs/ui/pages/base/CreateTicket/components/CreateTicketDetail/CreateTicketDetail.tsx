import { Box, Typography, Button } from '@serviceops/component';
import { alpha, darken } from '@mui/material';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';
import { useStyles } from './styles';
import {
  getIconComponent,
  loadIconMap,
} from '@serviceops/pages/base/Configuration/utils/ticketTypeIcons';

interface ConfigWithAccent {
  title: string;
  prefix: string;
  numberLength: number;
  subtitle: string;
  heroGradient: string;
  heroShadow: string;
  heroAccent: string;
}

const CreateTicketDetail = ({ ticketType, onCancel }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const { config } = useCreateTicketDetail({ ticketType, onCancel }) as {
    config: ConfigWithAccent;
  };
  const iconMap = loadIconMap();

  return (
    <Box className={classes.formContainer}>
      {/* Hero header */}
      <Box
        className={classes.ticketHero}
        sx={{
          borderLeft: `5px solid ${config.heroAccent}`,
          background: `linear-gradient(135deg, ${darken(config.heroAccent, 0.15)} 0%, ${config.heroAccent} 100%)`,
          boxShadow: `0 4px 14px ${config.heroShadow}`,
          color: '#fff',
        }}
      >
        <Box
          className={classes.ticketHeroIcon}
          sx={{
            background: `linear-gradient(135deg, ${darken(config.heroAccent, 0.2)} 0%, ${alpha(config.heroAccent, 0.9)} 100%)`,
            border: '1.5px solid rgba(255,255,255,0.35)',
            boxShadow: `0 6px 18px ${config.heroShadow}`,
            color: '#fff',
          }}
        >
          {getIconComponent(iconMap[ticketType], { fontSize: 26, color: '#fff' })}
        </Box>
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Typography className={classes.ticketHeroTitle} sx={{ color: '#fff' }}>
            {config.title}
          </Typography>
          <Typography className={classes.ticketHeroSub} sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {config.subtitle}
          </Typography>
        </Box>
      </Box>

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
