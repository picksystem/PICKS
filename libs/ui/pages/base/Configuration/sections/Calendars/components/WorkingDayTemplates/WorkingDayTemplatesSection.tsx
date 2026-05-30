import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
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
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
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
