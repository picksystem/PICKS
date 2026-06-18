import React from 'react';
import { Box, Typography, Switch } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigSLAAdminControls } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

interface TimeLogAdminControlsSectionProps {
  ctrl: IConfigSLAAdminControls;
  onUpdate: <K extends keyof IConfigSLAAdminControls>(
    key: K,
    value: IConfigSLAAdminControls[K],
  ) => void;
}

const TimeLogAdminControlsSection = ({ ctrl, onUpdate }: TimeLogAdminControlsSectionProps) => {
  const { classes } = useStyles();

  return (
    <Accordion
      className={classes.sectionAccordion}
      elevation={0}
      sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '12px !important' }}
    >
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
            <HourglassEmptyIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Time Log Admin Controls</Typography>
            <Typography className={classes.sectionSubtitle}>
              Configure time-logging permissions and resolution requirements
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Box
          sx={{
            borderRadius: 1.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            px: 1.5,
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.83rem',
                fontWeight: 500,
                color: 'text.primary',
                width: 390,
                flexShrink: 0,
              }}
            >
              Active time log
            </Typography>
            <Switch
              size='small'
              color='primary'
              checked={ctrl.timeLogAdminEnabled}
              onChange={(e) => onUpdate('timeLogAdminEnabled', e.target.checked)}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { TimeLogAdminControlsSection };
