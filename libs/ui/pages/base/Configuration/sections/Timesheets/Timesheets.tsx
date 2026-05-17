import React, { useState, useEffect } from 'react';
import { Box, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, Typography, alpha } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  AccessTime as AccessTimeIcon,
  AccountTree as AccountTreeIcon,
  Apps as AppsIcon,
  Queue as QueueIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import {
  IConfigTimesheetProjectEntry,
  IConfigTimesheetProjectCategory,
  IConfigTimesheets,
} from '@serviceops/interfaces';

import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { AssocPanel, toAssocRows, fromAssocRows } from '../../shared/assocPanel';
import ConfigPanel, { TableConfigs } from './components/SharedComponents';
import { colorPalette } from './styles/Timesheets.styles.shared';

// ────────────────────────────────
// Types
// ────────────────────────────────
type PanelKey = 'timesheetProjects' | 'serviceLine' | 'application' | 'queue' | 'resource';

type AssocPanelKey = Exclude<PanelKey, 'timesheetProjects'>;

type TimesheetAssocKey =
  | 'serviceLineEntries'
  | 'applicationEntries'
  | 'queueEntries'
  | 'resourceEntries';

// ────────────────────────────────
// Mapping ONLY for association panels
// ────────────────────────────────
const assocMap: Record<AssocPanelKey, TimesheetAssocKey> = {
  serviceLine: 'serviceLineEntries',
  application: 'applicationEntries',
  queue: 'queueEntries',
  resource: 'resourceEntries',
};

// ────────────────────────────────
// Panel config
// ────────────────────────────────
const PANELS: Record<PanelKey, { label: string; color: string; Icon: React.ComponentType<any> }> = {
  timesheetProjects: {
    label: 'Timesheet Projects',
    color: colorPalette.main,
    Icon: AccessTimeIcon,
  },
  serviceLine: {
    label: 'Service Lines',
    color: colorPalette.sl,
    Icon: AccountTreeIcon,
  },
  application: {
    label: 'Applications',
    color: colorPalette.app,
    Icon: AppsIcon,
  },
  queue: {
    label: 'Queues',
    color: colorPalette.que,
    Icon: QueueIcon,
  },
  resource: {
    label: 'Resources',
    color: colorPalette.res,
    Icon: PersonIcon,
  },
};

// ────────────────────────────────
// Base builder
// ────────────────────────────────
const buildTimesheetBase = (
  apiTS: IConfigTimesheets | undefined,
  rows: IConfigTimesheetProjectEntry[],
): IConfigTimesheets => ({
  conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
  cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
  timesheetProjects: rows,
  serviceLineEntries: apiTS?.serviceLineEntries ?? [],
  applicationEntries: apiTS?.applicationEntries ?? [],
  queueEntries: apiTS?.queueEntries ?? [],
  resourceEntries: apiTS?.resourceEntries ?? [],
  projectCategories: apiTS?.projectCategories ?? [],
});

// ────────────────────────────────
// Timesheet Projects
// ────────────────────────────────
const TimesheetProjects = () => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTimesheetProjectEntry[]>([]);
  const [activePanel, setActivePanel] = useState<PanelKey>('timesheetProjects');

  useEffect(() => {
    setRows(apiTS?.timesheetProjects ?? []);
  }, [apiTS]);

  const handleSaveProjects = (next: IConfigTimesheetProjectEntry[]) => {
    setRows(next);
    saveSection('timesheets', buildTimesheetBase(apiTS, next));
  };

  const isAssocPanel = activePanel !== 'timesheetProjects';

  const currentAssocKey: TimesheetAssocKey | null = isAssocPanel
    ? assocMap[activePanel as AssocPanelKey]
    : null;

  const currentAssocRows = currentAssocKey && apiTS ? (apiTS[currentAssocKey] ?? []) : [];

  return (
    <Accordion defaultExpanded className={useStyles().classes.sectionAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box className={useStyles().classes.sectionHeaderRoot}>
          <Box
            className={useStyles().classes.sectionIconBox}
            sx={{ backgroundColor: colorPalette.main }}
          >
            <AccessTimeIcon className={useStyles().classes.sectionIcon} />
          </Box>

          <Box>
            <Typography className={useStyles().classes.sectionTitle}>
              Timesheet Configuration
            </Typography>
            <Typography className={useStyles().classes.sectionSubtitle}>
              Manage projects and associations
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails className={useStyles().classes.details}>
        {/* Tabs */}
        <Box className={useStyles().classes.panelTabs}>
          {Object.entries(PANELS).map(([key, cfg]) => {
            const { Icon } = cfg;
            const isActive = activePanel === key;

            return (
              <Button
                key={key}
                size='small'
                startIcon={<Icon />}
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => setActivePanel(key as PanelKey)}
                sx={{
                  textTransform: 'none',
                  borderColor: cfg.color,
                  color: isActive ? '#fff' : cfg.color,
                  backgroundColor: isActive ? cfg.color : undefined,
                  '&:hover': {
                    backgroundColor: isActive ? cfg.color : alpha(cfg.color, 0.08),
                    borderColor: cfg.color,
                  },
                }}
              >
                {cfg.label}
              </Button>
            );
          })}
        </Box>

        {/* Main Table */}
        {activePanel === 'timesheetProjects' && (
          <ConfigPanel
            config={{
              accent: colorPalette.main,
              icon: <AccessTimeIcon />,
              title: 'Timesheet Projects',
              tableName: 'timesheetProjects',
            }}
            data={rows}
            onSave={handleSaveProjects}
            fields={TableConfigs.timesheetProjects.fields}
            deleteEntityName={TableConfigs.timesheetProjects.deleteEntityName}
            deleteItemNameField={TableConfigs.timesheetProjects.deleteItemNameField as any}
            selectedId={undefined}
            onSelectId={function (id: string | null): void {
              throw new Error('Function not implemented.');
            }}
          />
        )}

        {/* Associations */}
        {isAssocPanel && currentAssocKey && (
          <AssocPanel
            Icon={PANELS[activePanel].Icon}
            accent={PANELS[activePanel].color}
            title={`${PANELS[activePanel].label} Associations`}
            entityName={`${PANELS[activePanel].label} Entry`}
            assocLabel={PANELS[activePanel].label}
            idPrefix={`ts-${activePanel}`}
            rows={toAssocRows(currentAssocRows, activePanel)}
            onSave={(next) =>
              saveSection('timesheets', {
                ...buildTimesheetBase(apiTS, rows),
                [currentAssocKey]: fromAssocRows(next, activePanel),
              })
            }
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// ────────────────────────────────
// Categories
// ────────────────────────────────
const ProjectCategoryPanel = () => {
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigTimesheetProjectCategory[]>([]);

  useEffect(() => {
    setRows(apiTS?.projectCategories ?? []);
  }, [apiTS]);

  return (
    <ConfigPanel
      config={{
        accent: colorPalette.cat,
        icon: <CategoryIcon />,
        title: 'Project Categories',
        tableName: 'projectCategories',
      }}
      data={rows}
      onSave={(next) => {
        setRows(next);
        saveSection('timesheets', {
          ...apiTS,
          projectCategories: next,
        });
      }}
      fields={TableConfigs.projectCategories.fields}
      deleteEntityName={TableConfigs.projectCategories.deleteEntityName}
      deleteItemNameField={TableConfigs.projectCategories.deleteItemNameField as any}
      selectedId={undefined}
      onSelectId={function (id: string | null): void {
        throw new Error('Function not implemented.');
      }}
    />
  );
};

// ────────────────────────────────
// Page
// ────────────────────────────────
const Timesheets = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <TimesheetProjects />

      <Accordion className={classes.sectionAccordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box className={classes.sectionHeaderRoot}>
            <Box className={classes.sectionIconBox} sx={{ backgroundColor: colorPalette.cat }}>
              <CategoryIcon className={classes.sectionIcon} />
            </Box>

            <Box>
              <Typography className={classes.sectionTitle}>Project Categories</Typography>
              <Typography className={classes.sectionSubtitle}>Define project categories</Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails className={useStyles().classes.details}>
          <ProjectCategoryPanel />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Timesheets;
