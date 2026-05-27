import { useState, useEffect } from 'react';
import {
  IConfigTimesheetProjectEntry,
  IConfigTimesheetServiceLineEntry,
  IConfigTimesheetApplicationEntry,
  IConfigTimesheetQueueEntry,
  IConfigTimesheetResourceEntry,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import {
  TS_ACCENT,
  TIMESHEET_PROJECT_MAIN_CONFIG,
  SERVICE_LINE_CONFIG,
  APPLICATION_CONFIG,
  QUEUE_CONFIG,
  RESOURCE_CONFIG,
  timesheetProjectColumns,
  serviceLineColumns,
  applicationColumns,
  queueColumns,
  resourceColumns,
} from '../shared';
import { TSActiveView } from './TimesheetProjectsSection.types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonIcon from '@mui/icons-material/Person';

const VIEW_BUTTONS: { key: TSActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'project',
    label: 'Timesheet Projects',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'serviceLine',
    label: 'Add to Service Line',
    icon: <LayersIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'application',
    label: 'Add to Application',
    icon: <AppsIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'queue',
    label: 'Add to Queue',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'resource',
    label: 'Add to Resource',
    icon: <PersonIcon sx={{ fontSize: '1rem' }} />,
  },
];

interface TimesheetProjectsSectionProps {
  data?: IConfigTimesheetProjectEntry[];
  onDataChange?: (data: IConfigTimesheetProjectEntry[]) => void;
}

export const TimesheetProjectsSection = ({ data, onDataChange }: TimesheetProjectsSectionProps) => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<TSActiveView>('project');
  const [rows, setRows] = useState<IConfigTimesheetProjectEntry[]>([]);
  const [serviceLineRows, setServiceLineRows] = useState<IConfigTimesheetServiceLineEntry[]>([]);
  const [applicationRows, setApplicationRows] = useState<IConfigTimesheetApplicationEntry[]>([]);
  const [queueRows, setQueueRows] = useState<IConfigTimesheetQueueEntry[]>([]);
  const [resourceRows, setResourceRows] = useState<IConfigTimesheetResourceEntry[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiTS?.timesheetProjects) {
      setRows(apiTS.timesheetProjects);
    }
  }, [data, apiTS]);

  useEffect(() => {
    if (apiTS?.serviceLineEntries) setServiceLineRows(apiTS.serviceLineEntries);
    if (apiTS?.applicationEntries) setApplicationRows(apiTS.applicationEntries);
    if (apiTS?.queueEntries) setQueueRows(apiTS.queueEntries);
    if (apiTS?.resourceEntries) setResourceRows(apiTS.resourceEntries);
  }, [apiTS]);

  const handleSave = async (next: IConfigTimesheetProjectEntry[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      await saveSection('timesheets', {
        conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
        cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
        timesheetProjects: next,
        serviceLineEntries: serviceLineRows,
        applicationEntries: applicationRows,
        queueEntries: queueRows,
        resourceEntries: resourceRows,
        projectCategories: apiTS?.projectCategories ?? [],
      });
    }
  };

  const handleSaveServiceLine = async (next: IConfigTimesheetServiceLineEntry[]) => {
    setServiceLineRows(next);
    await saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: rows,
      serviceLineEntries: next,
      applicationEntries: applicationRows,
      queueEntries: queueRows,
      resourceEntries: resourceRows,
      projectCategories: apiTS?.projectCategories ?? [],
    });
  };

  const handleSaveApplication = async (next: IConfigTimesheetApplicationEntry[]) => {
    setApplicationRows(next);
    await saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: rows,
      serviceLineEntries: serviceLineRows,
      applicationEntries: next,
      queueEntries: queueRows,
      resourceEntries: resourceRows,
      projectCategories: apiTS?.projectCategories ?? [],
    });
  };

  const handleSaveQueue = async (next: IConfigTimesheetQueueEntry[]) => {
    setQueueRows(next);
    await saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: rows,
      serviceLineEntries: serviceLineRows,
      applicationEntries: applicationRows,
      queueEntries: next,
      resourceEntries: resourceRows,
      projectCategories: apiTS?.projectCategories ?? [],
    });
  };

  const handleSaveResource = async (next: IConfigTimesheetResourceEntry[]) => {
    setResourceRows(next);
    await saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: rows,
      serviceLineEntries: serviceLineRows,
      applicationEntries: applicationRows,
      queueEntries: queueRows,
      resourceEntries: next,
      projectCategories: apiTS?.projectCategories ?? [],
    });
  };

  return (
    <GenericAccordion
      title='Timesheet Projects'
      subtitle='Define timesheet project entries with their types and transition details'
      icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />}
      accent={TS_ACCENT}
      className={classes.sectionAccordion}
    >
      <GenericToolbar
        buttons={VIEW_BUTTONS.map((btn) => ({
          key: btn.key,
          label: btn.label,
          icon: btn.icon,
          isActive: activeView === btn.key,
          onClick: () => setActiveView(btn.key as TSActiveView),
        }))}
      />
      {activeView === 'project' && (
        <GenericPanel
          config={TIMESHEET_PROJECT_MAIN_CONFIG}
          data={rows}
          onSave={handleSave}
          customColumns={timesheetProjectColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'serviceLine' && (
        <GenericPanel
          config={SERVICE_LINE_CONFIG}
          data={serviceLineRows}
          onSave={handleSaveServiceLine}
          customColumns={serviceLineColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'application' && (
        <GenericPanel
          config={APPLICATION_CONFIG}
          data={applicationRows}
          onSave={handleSaveApplication}
          customColumns={applicationColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'queue' && (
        <GenericPanel
          config={QUEUE_CONFIG}
          data={queueRows}
          onSave={handleSaveQueue}
          customColumns={queueColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'resource' && (
        <GenericPanel
          config={RESOURCE_CONFIG}
          data={resourceRows}
          onSave={handleSaveResource}
          customColumns={resourceColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
    </GenericAccordion>
  );
};
