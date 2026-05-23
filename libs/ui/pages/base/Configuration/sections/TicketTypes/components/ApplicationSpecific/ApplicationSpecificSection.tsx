import { Box, Typography } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from '../../styles';

const ApplicationSpecificSection = () => {
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
            <WebAssetIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Specific</Typography>
            <Typography className={classes.sectionSubtitle}>
              Ticket types tied to specific business applications
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails className={classes.sectionBody}>
        <Typography variant='body2' color='text.secondary'>
          Application-specific ticket types link your ticket system to individual applications in
          your portfolio.
        </Typography>
        <Box className={classes.sectionEmptyBox}>
          <Typography variant='body2' color='text.disabled'>
            No application-specific ticket types configured. Link applications in Application
            Settings to enable this feature.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { ApplicationSpecificSection };
