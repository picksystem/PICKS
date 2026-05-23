import {
  Box,
  Typography,
  Paper,
  Switch,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigGeneral } from '@serviceops/interfaces';
import { useStyles } from '../../styles';

const AdminControlsSection = ({
  form,
  update,
}: {
  form: IConfigGeneral;
  update: <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => void;
}) => {
  const { classes } = useStyles();

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
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
            <SettingsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>General Admin Controls</Typography>
            <Typography className={classes.sectionSubtitle}>
              Core admin feature toggles and display preferences
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' sx={{ borderRadius: 1.5, overflow: 'hidden', px: 1.5, py: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.75,
            }}
          >
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary' }}>
              Activate default approved hours
            </Typography>
            <Switch
              size='small'
              color='primary'
              checked={form.activateDefaultApprovedHours}
              onChange={(e) => update('activateDefaultApprovedHours', e.target.checked)}
              sx={{ flexShrink: 0 }}
            />
          </Box>

          <Divider sx={{ opacity: 0.45 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.75,
            }}
          >
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary' }}>
              Enable time entries on tickets
            </Typography>
            <Switch
              size='small'
              color='primary'
              checked={form.timeEntriesEnabled}
              onChange={(e) => update('timeEntriesEnabled', e.target.checked)}
              sx={{ flexShrink: 0 }}
            />
          </Box>

          <Divider sx={{ opacity: 0.45 }} />

          <Box sx={{ py: 1 }}>
            <Typography
              sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary', mb: 0.75 }}
            >
              Change display name
            </Typography>
            <RadioGroup
              value={form.timeEntriesDisplayName}
              onChange={(e) =>
                update(
                  'timeEntriesDisplayName',
                  e.target.value as IConfigGeneral['timeEntriesDisplayName'],
                )
              }
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
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export { AdminControlsSection };
