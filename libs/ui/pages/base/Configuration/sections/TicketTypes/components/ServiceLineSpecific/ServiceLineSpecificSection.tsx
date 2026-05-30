import { Box, Typography } from '@serviceops/component';
import HubIcon from '@mui/icons-material/Hub';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { useStyles } from '../../styles';

const ServiceLineSpecificSection = () => {
  const { classes } = useStyles();

  return (
    <GenericAccordion
      title='Service Line Specific Ticket Type'
      subtitle='Activate ticket types unique to a specific service line'
      icon={<HubIcon sx={{ fontSize: '1rem' }} />}
      accent='#0369a1'
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <Box className={classes.sectionBody}>
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
      </Box>
    </GenericAccordion>
  );
};

export { ServiceLineSpecificSection };
