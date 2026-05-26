import React from 'react';
import { Box, Typography, Switch } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigSLAAdminControls } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

interface ETAdminControlsSectionProps {
  ctrl: IConfigSLAAdminControls;
  onUpdate: <K extends keyof IConfigSLAAdminControls>(
    key: K,
    value: IConfigSLAAdminControls[K],
  ) => void;
}

const ToggleRow = ({
  label,
  checked,
  onChange,
  disabled = false,
  subtle = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  subtle?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 0.625,
      opacity: disabled ? 0.42 : 1,
    }}
  >
    <Typography
      sx={{
        fontSize: subtle ? '0.8rem' : '0.83rem',
        fontWeight: subtle ? 400 : 500,
        color: subtle ? 'text.secondary' : 'text.primary',
        pr: 1,
      }}
    >
      {label}
    </Typography>
    <Switch
      size='small'
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      color='primary'
    />
  </Box>
);

const RowDivider = () => <Divider sx={{ opacity: 0.45 }} />;

const ETAdminControlsSection = ({ ctrl, onUpdate }: ETAdminControlsSectionProps) => {
  const { classes } = useStyles();
  const off = !ctrl.enabled;

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
            <PendingActionsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>ETA Admin Controls</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage agent permissions for ETA setting and override
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
          <ToggleRow
            label='Enable ETAs'
            checked={ctrl.etaEnabled}
            disabled={off}
            onChange={(v) => onUpdate('etaEnabled', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Editable by consultants'
            checked={ctrl.etaEditableByConsultants}
            disabled={off}
            onChange={(v) => onUpdate('etaEditableByConsultants', v)}
            subtle
          />
          <RowDivider />
          <ToggleRow
            label='Equal to due dates'
            checked={ctrl.etaEqualToDueDates}
            disabled={off}
            onChange={(v) => onUpdate('etaEqualToDueDates', v)}
            subtle
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { ETAdminControlsSection };
