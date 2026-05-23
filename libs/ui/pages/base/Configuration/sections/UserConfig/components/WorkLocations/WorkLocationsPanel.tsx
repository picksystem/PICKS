import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LinkIcon from '@mui/icons-material/Link';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';
import { UC_COLORS, UC_FORM_LABELS, workLocationColumns } from '../shared/userConfig.config';
import { WorkingTimesPanel } from './WorkingTimesPanel';
import { AssocProfilesPanel } from './AssocProfilesPanel';
import { ShiftsPanel } from './ShiftsPanel';
import { WorkLocationAssociationsPanel } from './WorkLocationAssociationsPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivePanel = 'location' | 'workingTimes' | 'associatedProfiles' | 'shifts' | 'associations';

// ── Work Locations Panel ───────────────────────────────────────────────────────

const WorkLocationsPanel = () => {
  const { userConfig: apiUC, saveSection } = useConfiguration();
  const [rows, setRows] = useState<RowData>([]);

  useEffect(() => {
    if (apiUC?.workLocations) setRows(apiUC.workLocations);
  }, [apiUC]);

  const handleSave = (next: RowData) => {
    setRows(next);
    saveSection('userConfig', {
      ...apiUC,
      workLocations: next,
      workingTimes: apiUC?.workingTimes ?? [],
      associatedProfiles: apiUC?.associatedProfiles ?? [],
      shifts: apiUC?.shifts ?? [],
      workLocationAssociations: apiUC?.workLocationAssociations ?? [],
    });
  };

  const config = {
    title: 'Work Locations',
    accent: UC_COLORS.workLocation,
    icon: <LocationOnIcon fontSize='small' />,
    panelTitle: 'Work Locations',
    columns: workLocationColumns,
    formConfig: UC_FORM_LABELS.workLocation,
    searchFields: ['name', 'description'],
    getSelectedLabel: (row: RowData) => String(row.name ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'wl',
  };

  return <GenericCRUDPanel config={config} data={rows} onSave={handleSave} />;
};

// ── Work Locations Section ─────────────────────────────────────────────────────

const WorkLocationsSection = () => {
  const { classes } = useStyles();
  const { userConfig: apiUC, saveSection } = useConfiguration();
  const [activePanel, setActivePanel] = useState<ActivePanel>('location');

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: UC_COLORS.workLocation,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocationOnIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Work Locations</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define work locations and configure their regional, time and calendar settings
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              size='small'
              variant={activePanel === 'location' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('location')}
              startIcon={<LocationOnIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'location' ? '#2d5ebb' : undefined,
                color: activePanel === 'location' ? '#fff' : '#2d5ebb',
              }}
            >
              Work Locations
            </Button>
            <Button
              size='small'
              variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('workingTimes')}
              startIcon={<AccessTimeIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'workingTimes' ? '#2d5ebb' : undefined,
                color: activePanel === 'workingTimes' ? '#fff' : '#2d5ebb',
              }}
            >
              Working Times
            </Button>
            <Button
              size='small'
              variant={activePanel === 'associatedProfiles' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('associatedProfiles')}
              startIcon={<GroupIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'associatedProfiles' ? '#2d5ebb' : undefined,
                color: activePanel === 'associatedProfiles' ? '#fff' : '#2d5ebb',
              }}
            >
              Associated Consultant Profiles
            </Button>
            <Button
              size='small'
              variant={activePanel === 'shifts' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('shifts')}
              startIcon={<WatchLaterIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'shifts' ? '#2d5ebb' : undefined,
                color: activePanel === 'shifts' ? '#fff' : '#2d5ebb',
              }}
            >
              Shift Management
            </Button>
            <Button
              size='small'
              variant={activePanel === 'associations' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('associations')}
              startIcon={<LinkIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'associations' ? '#2d5ebb' : undefined,
                color: activePanel === 'associations' ? '#fff' : '#2d5ebb',
              }}
            >
              Work Location Associations
            </Button>
          </Box>
        </Paper>

        {activePanel === 'location' && <WorkLocationsPanel />}
        {activePanel === 'workingTimes' && (
          <WorkingTimesPanel
            locations={apiUC?.workLocations ?? []}
            workingTimes={apiUC?.workingTimes ?? []}
            defaultLocationId={null}
            onSave={(wt) =>
              saveSection('userConfig', {
                ...apiUC,
                workLocations: apiUC?.workLocations ?? [],
                workingTimes: wt,
                associatedProfiles: apiUC?.associatedProfiles ?? [],
                shifts: apiUC?.shifts ?? [],
                workLocationAssociations: apiUC?.workLocationAssociations ?? [],
              })
            }
          />
        )}
        {activePanel === 'associatedProfiles' && (
          <AssocProfilesPanel
            locations={apiUC?.workLocations ?? []}
            associatedProfiles={apiUC?.associatedProfiles ?? []}
            defaultLocationId={null}
            onSave={(ap) =>
              saveSection('userConfig', {
                ...apiUC,
                workLocations: apiUC?.workLocations ?? [],
                workingTimes: apiUC?.workingTimes ?? [],
                associatedProfiles: ap,
                shifts: apiUC?.shifts ?? [],
                workLocationAssociations: apiUC?.workLocationAssociations ?? [],
              })
            }
          />
        )}
        {activePanel === 'shifts' && (
          <ShiftsPanel
            locations={apiUC?.workLocations ?? []}
            shifts={apiUC?.shifts ?? []}
            defaultLocationId={null}
            onSave={(sh) =>
              saveSection('userConfig', {
                ...apiUC,
                workLocations: apiUC?.workLocations ?? [],
                workingTimes: apiUC?.workingTimes ?? [],
                associatedProfiles: apiUC?.associatedProfiles ?? [],
                shifts: sh,
                workLocationAssociations: apiUC?.workLocationAssociations ?? [],
              })
            }
          />
        )}
        {activePanel === 'associations' && (
          <WorkLocationAssociationsPanel
            locations={apiUC?.workLocations ?? []}
            associations={apiUC?.workLocationAssociations ?? []}
            defaultLocationId={null}
            onSave={(wla) =>
              saveSection('userConfig', {
                ...apiUC,
                workLocations: apiUC?.workLocations ?? [],
                workingTimes: apiUC?.workingTimes ?? [],
                associatedProfiles: apiUC?.associatedProfiles ?? [],
                shifts: apiUC?.shifts ?? [],
                workLocationAssociations: wla,
              })
            }
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { WorkLocationsSection };
