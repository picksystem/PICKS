import React from 'react';
import { Box, Typography, Switch } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigSLAAdminControls } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

interface DueDateAdminControlsSectionProps {
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
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
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
    <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary', pr: 1 }}>
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

const DueDateAdminControlsSection = ({ ctrl, onUpdate }: DueDateAdminControlsSectionProps) => {
  const { classes } = useStyles();
  const off = !ctrl.enabled;
  const dueDateOff = off || !ctrl.dueDateAdminEnabled;

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
            <TodayIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Due Date Admin Controls</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage due date settings, consultant permissions, and SLA alignment
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
            label='Enable due date admin controls'
            checked={ctrl.dueDateAdminEnabled}
            disabled={off}
            onChange={(v) => onUpdate('dueDateAdminEnabled', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Enable dates'
            checked={ctrl.dueDateEnableDates}
            disabled={dueDateOff}
            onChange={(v) => onUpdate('dueDateEnableDates', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Editable by consultants'
            checked={ctrl.dueDateEditableByConsultants}
            disabled={dueDateOff}
            onChange={(v) => onUpdate('dueDateEditableByConsultants', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Equal to SLA dates'
            checked={ctrl.dueDateEqualToSLADates}
            disabled={dueDateOff}
            onChange={(v) => onUpdate('dueDateEqualToSLADates', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Extend due dates'
            checked={ctrl.dueDateExtendDueDates}
            disabled={dueDateOff}
            onChange={(v) => onUpdate('dueDateExtendDueDates', v)}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { DueDateAdminControlsSection };
