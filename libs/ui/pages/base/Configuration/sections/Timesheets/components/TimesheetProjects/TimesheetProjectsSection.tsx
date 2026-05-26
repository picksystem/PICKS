import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericCRUDPanel, RowData } from '../../../../shared/GenericTablePanel/GenericTablePanel';
import {
  TS_COLORS,
  TS_FORM_LABELS,
  TS_PROJECT_VIEWS,
  timesheetProjectColumns,
} from '../shared/timesheets.config';

type ActiveView = 'project';

const TimesheetProjectPanel = () => {
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [rows, setRows] = useState<RowData>([]);

  useEffect(() => {
    if (apiTS?.timesheetProjects) setRows(apiTS.timesheetProjects);
  }, [apiTS]);

  const handleSave = (next: RowData) => {
    setRows(next);
    saveSection('timesheets', { ...apiTS, timesheetProjects: next });
  };

  const config = {
    title: 'Timesheet Projects',
    accent: TS_COLORS.timesheet,
    icon: <AccessTimeIcon fontSize='small' />,
    panelTitle: 'Timesheet Projects',
    columns: timesheetProjectColumns,
    formConfig: TS_FORM_LABELS.project,
    searchFields: ['name', 'description', 'projectType', 'transitionType'],
    getSelectedLabel: (row: RowData) => String(row.name ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'tsp',
  };

  return <GenericCRUDPanel config={config} data={rows} onSave={handleSave} />;
};

// ── Timesheet Projects Section ─────────────────────────────────────────────────

const TimesheetProjectsSection = () => {
  const { classes } = useStyles();
  const [activeView] = useState<ActiveView>('project');

  return (
    <Accordion defaultExpanded elevation={0} className={classes.sectionAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: TS_COLORS.timesheet,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ScheduleSendIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Timesheet Projects</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define and manage timesheet project entries with their types and associations
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
            {TS_PROJECT_VIEWS.map((view) => (
              <Button
                key={view.key}
                size='small'
                variant={activeView === view.key ? 'contained' : 'outlined'}
                startIcon={view.icon}
                sx={{
                  textTransform: 'none',
                  bgcolor: activeView === view.key ? '#2d5ebb' : undefined,
                  color: activeView === view.key ? '#fff' : '#2d5ebb',
                }}
              >
                {view.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {activeView === 'project' && <TimesheetProjectPanel />}
      </AccordionDetails>
    </Accordion>
  );
};

export { TimesheetProjectsSection };
