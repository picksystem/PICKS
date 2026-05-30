import { Box, Typography } from '@serviceops/component';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { useStyles } from '../../styles';

const ApplicationSpecificSection = () => {
  const { classes } = useStyles();

  return (
    <GenericAccordion
      title='Application Specific Ticket Type'
      subtitle='Ticket types tied to specific business applications'
      icon={<WebAssetIcon sx={{ fontSize: '1rem' }} />}
      accent='#0369a1'
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <Box className={classes.sectionBody}>
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
      </Box>
    </GenericAccordion>
  );
};

export { ApplicationSpecificSection };
