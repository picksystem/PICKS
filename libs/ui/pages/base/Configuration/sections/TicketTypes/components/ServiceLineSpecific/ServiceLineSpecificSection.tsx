import { Box, Typography } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStyles } from '../../styles';

const ServiceLineSpecificSection = () => {
  const { classes } = useStyles();

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CategoryIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
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
