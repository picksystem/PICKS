import { useState, useEffect } from 'react';
import { IConfigTimesheetTaskCode } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { TASK_CODE_CONFIG, taskCodeColumns } from '../shared';

interface TaskCodesSectionProps {
  data?: IConfigTimesheetTaskCode[];
  onDataChange?: (data: IConfigTimesheetTaskCode[]) => void;
}

export const TaskCodesSection = ({ data, onDataChange }: TaskCodesSectionProps) => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigTimesheetTaskCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiTS?.taskCodes) {
      setRows(apiTS.taskCodes);
    }
  }, [data, apiTS]);

  const handleSave = (next: IConfigTimesheetTaskCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('timesheets', {
        conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
        cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
        timesheetProjects: apiTS?.timesheetProjects ?? [],
        serviceLineEntries: apiTS?.serviceLineEntries ?? [],
        applicationEntries: apiTS?.applicationEntries ?? [],
        queueEntries: apiTS?.queueEntries ?? [],
        resourceEntries: apiTS?.resourceEntries ?? [],
        projectCategories: apiTS?.projectCategories ?? [],
        taskCodes: next,
      });
    }
  };

  return (
    <div id='task-codes' className={classes.sectionAccordion}>
      <GenericPanel
        config={TASK_CODE_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={taskCodeColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};
