import { useEffect, useState } from 'react';
import { IConfigPeriodType, IConfigTimesheetPeriod } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { PTActiveView, PeriodTypesSectionProps } from './PeriodTypesSection.types';
import {
  PERIOD_TYPES_TABLE_CONFIG,
  TIMESHEET_PERIODS_TABLE_CONFIG,
  periodTypesColumns,
  timesheetPeriodsColumns,
} from '../shared';
import { PERIOD_TYPES_SECTION_CONFIG } from './PeriodTypesSection.config';

const PeriodTypesSection = ({
  periodTypeRows,
  timesheetPeriodRows,
  onDataChange,
}: PeriodTypesSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [periodTypes, setPeriodTypes] = useState<IConfigPeriodType[]>([]);
  const [timesheetPeriods, setTimesheetPeriods] = useState<IConfigTimesheetPeriod[]>([]);
  const [activeView, setActiveView] = useState<PTActiveView>('periodTypes');

  const periodTypesFinal = periodTypeRows ?? periodTypes;
  const timesheetPeriodsFinal = timesheetPeriodRows ?? timesheetPeriods;

  useEffect(() => {
    if (periodTypeRows !== undefined) {
      setPeriodTypes(periodTypeRows);
    } else if (apiCAL?.periodTypes) {
      setPeriodTypes(apiCAL.periodTypes);
    }
  }, [periodTypeRows, apiCAL]);

  useEffect(() => {
    if (timesheetPeriodRows !== undefined) {
      setTimesheetPeriods(timesheetPeriodRows);
    } else if (apiCAL?.timesheetPeriods) {
      setTimesheetPeriods(apiCAL.timesheetPeriods);
    }
  }, [timesheetPeriodRows, apiCAL]);

  const handleSavePeriodTypes = (next: IConfigPeriodType[]) => {
    if (periodTypeRows !== undefined) {
      setPeriodTypes(next);
    }
    if (onDataChange) {
      onDataChange(next, timesheetPeriodsFinal);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: apiCAL?.workingCalendars ?? [],
        workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
        composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
        calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
        calendarConsultants: apiCAL?.calendarConsultants ?? [],
        periodTypes: next,
        timesheetPeriods: timesheetPeriodsFinal,
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    }
  };

  const handleSaveTimesheetPeriods = (next: IConfigTimesheetPeriod[]) => {
    if (timesheetPeriodRows !== undefined) {
      setTimesheetPeriods(next);
    }
    if (onDataChange) {
      onDataChange(periodTypesFinal, next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: apiCAL?.workingCalendars ?? [],
        workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
        composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
        calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
        calendarConsultants: apiCAL?.calendarConsultants ?? [],
        periodTypes: periodTypesFinal,
        timesheetPeriods: next,
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    }
  };

  const toolbarButtons = PERIOD_TYPES_SECTION_CONFIG.toolbarButtons.map((btn) => ({
    ...btn,
    isActive: btn.key === activeView,
    onClick: () => setActiveView(btn.key as PTActiveView),
  }));

  return (
    <GenericAccordion
      title={PERIOD_TYPES_SECTION_CONFIG.title}
      subtitle={PERIOD_TYPES_SECTION_CONFIG.subtitle}
      icon={PERIOD_TYPES_SECTION_CONFIG.icon}
      accent={PERIOD_TYPES_SECTION_CONFIG.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar buttons={toolbarButtons} />

      {activeView === 'periodTypes' && (
        <GenericPanel
          config={PERIOD_TYPES_TABLE_CONFIG}
          data={periodTypesFinal as unknown as Record<string, unknown>[]}
          onSave={handleSavePeriodTypes as (data: unknown[]) => void}
          customColumns={periodTypesColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'timesheetPeriods' && (
        <GenericPanel
          config={TIMESHEET_PERIODS_TABLE_CONFIG}
          data={timesheetPeriodsFinal as unknown as Record<string, unknown>[]}
          onSave={handleSaveTimesheetPeriods as (data: unknown[]) => void}
          customColumns={timesheetPeriodsColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
        />
      )}
    </GenericAccordion>
  );
};

export { PeriodTypesSection };
