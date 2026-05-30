import { useState, useEffect } from 'react';
import {
  IConfigTimesheetProjectCategory,
  IConfigTimesheetConversionCode,
  IConfigTimesheetCancellationCode,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  PROJECT_CATEGORY_CONFIG,
  CONVERSION_CODE_CONFIG,
  CANCELLATION_CODE_CONFIG,
  projectCategoryColumns,
  conversionCodeColumns,
  cancellationCodeColumns,
} from '../shared';

interface ProjectCategorySectionProps {
  data?: IConfigTimesheetProjectCategory[];
  onDataChange?: (data: IConfigTimesheetProjectCategory[]) => void;
}

export const ProjectCategorySection = ({ data, onDataChange }: ProjectCategorySectionProps) => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigTimesheetProjectCategory[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiTS?.projectCategories) {
      setRows(apiTS.projectCategories);
    }
  }, [data, apiTS]);

  const handleSave = (next: IConfigTimesheetProjectCategory[]) => {
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
        projectCategories: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={PROJECT_CATEGORY_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={projectCategoryColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};
