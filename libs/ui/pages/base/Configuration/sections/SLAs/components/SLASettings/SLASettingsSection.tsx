import React from 'react';
import { Box, Typography, Switch } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigSLAAdminControls, ITicketType } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

interface SLASettingsSectionProps {
  ctrl: IConfigSLAAdminControls;
  onUpdate: <K extends keyof IConfigSLAAdminControls>(
    key: K,
    value: IConfigSLAAdminControls[K],
  ) => void;
  activeTicketTypes: ITicketType[];
  toggleTicketTypeActivation: (typeKey: string, value: boolean) => void;
}

const SLASettingsSection = ({
  ctrl,
  onUpdate,
  activeTicketTypes,
  toggleTicketTypeActivation,
}: SLASettingsSectionProps) => {
  const { classes } = useStyles();
  const off = !ctrl.enabled;

  return (
    <Accordion
      defaultExpanded
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
            <TimerIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>SLA Admin Controls</Typography>
            <Typography className={classes.sectionSubtitle}>
              Master switch and ticket-type activation for SLA tracking
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
              justifyContent: 'space-between',
              py: 0.625,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Enable SLAs</Typography>
              <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>
                Master switch — activates all SLA tracking across the system
              </Typography>
            </Box>
            <Switch
              checked={ctrl.enabled}
              onChange={(e) => onUpdate('enabled', e.target.checked)}
              color='primary'
              sx={{ flexShrink: 0 }}
            />
          </Box>

          <Divider sx={{ opacity: 0.45 }} />

          <Box sx={{ py: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.83rem',
                fontWeight: 600,
                color: off ? 'text.disabled' : 'text.primary',
                transition: 'color 0.18s',
                mb: 1,
              }}
            >
              Activate SLAs on tickets
            </Typography>

            {activeTicketTypes.length === 0 ? (
              <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', py: 0.5 }}>
                No active ticket types — configure them in the Ticket Types section.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {activeTicketTypes.map((tt, idx) => {
                  const isOn = (ctrl.activateOnTicketTypes ?? {})[tt.type] ?? true;
                  return (
                    <React.Fragment key={tt.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.5,
                          opacity: off ? 0.42 : 1,
                          transition: 'opacity 0.18s',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                          {tt.displayName || tt.name}
                        </Typography>
                        <Switch
                          size='small'
                          checked={isOn}
                          disabled={off}
                          onChange={(e) => toggleTicketTypeActivation(tt.type, e.target.checked)}
                          color='primary'
                        />
                      </Box>
                      {idx < activeTicketTypes.length - 1 && <Divider sx={{ opacity: 0.45 }} />}
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export { SLASettingsSection };
