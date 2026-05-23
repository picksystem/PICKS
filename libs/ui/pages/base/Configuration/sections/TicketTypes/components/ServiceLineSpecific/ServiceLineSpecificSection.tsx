import { Box, Typography } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from '../../styles';

const ServiceLineSpecificSection = () => {
  const { classes } = useStyles();

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HubIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Service Line Specific</Typography>
            <Typography className={classes.sectionSubtitle}>
              Activate ticket types unique to a specific service line
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails className={classes.sectionBody}>
        <Typography variant='body2' color='text.secondary'>
          Service line specific ticket types allow you to create custom ticket categories scoped to
          individual business units or service lines.
        </Typography>
        <Box className={classes.sectionEmptyBox}>
          <Typography variant='body2' color='text.disabled'>
            No service-line ticket types configured. Contact your system administrator to enable
            this feature.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { ServiceLineSpecificSection };
