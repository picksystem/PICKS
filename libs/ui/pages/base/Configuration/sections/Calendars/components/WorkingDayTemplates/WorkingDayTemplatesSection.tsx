import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { WorkingDayTemplatesSectionProps } from './WorkingDayTemplatesSection.types';
import { IConfigWorkingDayTemplate } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  WORKING_DAY_TEMPLATE_CONFIG,
  workingDayTemplateColumns,
} from './WorkingDayTemplatesSection.config';

const WorkingDayTemplatesSection = ({ data, onDataChange }: WorkingDayTemplatesSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const rows = data ?? apiCAL?.workingDayTemplates ?? [];

  const handleSave = (next: IConfigWorkingDayTemplate[]) => {
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: next,
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: apiCAL?.workingCalendars ?? [],
        workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
        composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
        calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
        calendarConsultants: apiCAL?.calendarConsultants ?? [],
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={WORKING_DAY_TEMPLATE_CONFIG}
        data={rows as any}
        onSave={handleSave}
        customColumns={workingDayTemplateColumns as any}
        variant='plain'
        enableSuccessMessage
      />
    </div>
  );
};

export { WorkingDayTemplatesSection };
