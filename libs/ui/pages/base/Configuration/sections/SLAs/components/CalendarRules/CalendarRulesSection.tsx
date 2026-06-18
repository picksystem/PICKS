import React from 'react';
import { Box, Typography, Switch } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import RuleIcon from '@mui/icons-material/Rule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigSLAAdminControls } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

interface CalendarRulesSectionProps {
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
      py: 0.75,
      opacity: disabled ? 0.42 : 1,
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
      {label}
    </Typography>
    <Switch
      size='small'
      color='primary'
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  </Box>
);

const RowDivider = () => <Divider sx={{ opacity: 0.45 }} />;

const CalendarRulesSection = ({ ctrl, onUpdate }: CalendarRulesSectionProps) => {
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
            <RuleIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Calendar Rules</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define which calendars and non-working periods the SLA clock respects
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
          {(
            [
              [
                'basedOnCallerCalendar',
                "Change to Calculate SLAs Based on caller's working calendar",
              ],
              [
                'basedOnConsultantCalendar',
                "Change to Calculate SLAs based on Based on consultant's working calendar",
              ],
              [
                'excludeCallerBankHolidays',
                'Change to Exclude Caller’s bank holidays (Public Holidays)',
              ],
              ['excludeCallerLeaves', "Exclude caller's leaves"],
              [
                'excludeConsultantBankHolidays',
                'Change to Exclude Consultant’s Bank Holidays (Public Holidays)',
              ],
              ['excludeConsultantLeaves', "Exclude consultant's leaves"],
              ['excludeSaturdaysAndSundays', 'Exclude Saturdays and Sundays'],
              ['excludeFridaysAndSaturdays', 'Exclude Fridays and Saturdays'],
              ['excludeFridaysOnly', 'Exclude Fridays only'],
              ['excludeSaturdaysOnly', 'Exclude Saturdays only'],
              ['excludeSundaysOnly', 'Exclude Sundays only'],
            ] as [keyof IConfigSLAAdminControls, string][]
          ).map(([key, label], i, arr) => (
            <React.Fragment key={key}>
              <ToggleRow
                label={label}
                checked={ctrl[key] as boolean}
                disabled={off}
                onChange={(v) => onUpdate(key, v)}
              />
              {i < arr.length - 1 && <RowDivider />}
            </React.Fragment>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { CalendarRulesSection };
