import { Box, Typography, Switch, Divider } from '@serviceops/component';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { IConfigGeneral } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { memo, useCallback } from 'react';

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = memo(({ label, checked, onChange }: ToggleRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', py: 0.75 }}>
    <Typography
      sx={{
        fontSize: '0.83rem',
        fontWeight: 500,
        color: 'text.primary',
        width: 240,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Switch
      size='small'
      color='primary'
      checked={checked!}
      onChange={(e) => onChange(e.target.checked)}
    />
  </Box>
));

ToggleRow.displayName = 'ToggleRow';

const RowDivider = memo(() => <Divider sx={{ opacity: 0.45 }} />);

const AdminControlsSection = ({
  form,
  update,
}: {
  form: IConfigGeneral;
  update: <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => void;
}) => {
  const { classes } = useStyles();

  const handleToggleDefaultHours = useCallback(
    (v: boolean) =>
      update('generalAdminControls', {
        ...form.generalAdminControls,
        activateDefaultApprovedHours: v,
      }),
    [update, form.generalAdminControls],
  );

  const handleToggleTimeEntries = useCallback(
    (v: boolean) =>
      update('generalAdminControls', { ...form.generalAdminControls, timeEntriesEnabled: v }),
    [update, form.generalAdminControls],
  );

  const handleChangeDisplayName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update('generalAdminControls', {
        ...form.generalAdminControls,
        changeDisplayName: {
          approved_estimates: e.target.value === 'approved_estimates',
          estimated_hours: e.target.value === 'estimated_hours',
        },
      }),
    [update, form.generalAdminControls],
  );

  return (
    <GenericAccordion
      title='General Admin Controls'
      subtitle='Core admin feature toggles and display preferences'
      icon={<SettingsIcon sx={{ fontSize: '1rem' }} />}
      accent='#0369a1'
      defaultExpanded
      className={classes.sectionAccordion}
    >
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
          label='Activate default approved hours'
          checked={form.generalAdminControls.activateDefaultApprovedHours}
          onChange={handleToggleDefaultHours}
        />
        <RowDivider />
        <ToggleRow
          label='Enable time entries on tickets'
          checked={form.generalAdminControls.timeEntriesEnabled}
          onChange={handleToggleTimeEntries}
        />
        <RowDivider />
        <Box sx={{ py: 1 }}>
          <Typography
            sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary', mb: 0.75 }}
          >
            Change display name
          </Typography>
          <RadioGroup
            value={
              form.generalAdminControls.changeDisplayName.approved_estimates
                ? 'approved_estimates'
                : 'estimated_hours'
            }
            onChange={handleChangeDisplayName}
            sx={{ pl: 0.5, gap: 0.25 }}
          >
            <FormControlLabel
              value='approved_estimates'
              control={<Radio size='small' color='primary' />}
              label={
                <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                  Approved estimates (hrs)
                </Typography>
              }
            />
            <FormControlLabel
              value='estimated_hours'
              control={<Radio size='small' color='primary' />}
              label={
                <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                  Estimated hours
                </Typography>
              }
            />
          </RadioGroup>
        </Box>
      </Box>
    </GenericAccordion>
  );
};

export { AdminControlsSection };
