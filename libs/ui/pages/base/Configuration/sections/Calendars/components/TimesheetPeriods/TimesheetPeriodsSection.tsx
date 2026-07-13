import { useState, useEffect } from 'react';
import { IConfigPeriodType } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { TIMESHEET_PERIOD_CONFIG, timesheetPeriodColumns } from '../shared';

interface TimesheetPeriodsSectionProps {
  data?: IConfigPeriodType[];
  onDataChange?: (data: IConfigPeriodType[]) => void;
}

const TimesheetPeriodsSection = ({ data, onDataChange }: TimesheetPeriodsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigPeriodType[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCAL?.periodTypes) {
      setRows(apiCAL.periodTypes);
    }
  }, [data, apiCAL]);

  const handleSave = (next: IConfigPeriodType[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: apiCAL?.workingCalendars ?? [],
        workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
        composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
        calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
        calendarConsultants: apiCAL?.calendarConsultants ?? [],
        periodTypes: next,
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TIMESHEET_PERIOD_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={timesheetPeriodColumns as unknown as never}
        variant='plain'
        defaultExpanded={false}
        enableSuccessMessage
      />
    </div>
  );
};

export { TimesheetPeriodsSection };
