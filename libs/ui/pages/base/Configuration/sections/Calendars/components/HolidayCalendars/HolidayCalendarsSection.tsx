import { useState, useEffect } from 'react';
import { IConfigHolidayCalendar, IConfigBankHoliday } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { TABLE_CONFIG, holidayCalendarColumns, bankHolidayColumns } from '../shared';
import { HCActiveView, HolidayCalendarsSectionProps } from './HolidayCalendarsSection.types';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { HOLIDAY_CALENDAR_SECTION_CONFIG } from './HolidayCalendarsSection.config';

const HolidayCalendarsSection = ({
  holidayRows,
  bankHolidays: initialBH,
  onDataChange,
  onSaveBankHolidays,
}: HolidayCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [holidayRowsState, setHolidayRows] = useState<IConfigHolidayCalendar[]>([]);
  const [bankHolidaysState, setBankHolidays] = useState<IConfigBankHoliday[]>([]);
  const [activeView, setActiveView] = useState<HCActiveView>('holiday');

  const holidayRowsFinal = holidayRows ?? holidayRowsState;
  const bankHolidaysFinal =
    bankHolidaysState.length > 0 ? bankHolidaysState : (initialBH ?? apiCAL?.bankHolidays ?? []);

  useEffect(() => {
    if (holidayRows !== undefined) {
      setHolidayRows(holidayRows);
    } else if (apiCAL?.holidayCalendars) {
      setHolidayRows(apiCAL.holidayCalendars);
    }
  }, [holidayRows, apiCAL]);

  useEffect(() => {
    if (initialBH !== undefined) {
      setBankHolidays(initialBH);
    } else if (apiCAL?.bankHolidays) {
      setBankHolidays(apiCAL.bankHolidays);
    }
  }, [initialBH, apiCAL]);

  const handleSave = (nextRows: IConfigHolidayCalendar[]) => {
    if (holidayRows !== undefined) {
      setHolidayRows(nextRows);
    }
    if (onDataChange) {
      onDataChange(nextRows, bankHolidaysFinal);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: nextRows,
        bankHolidays: bankHolidaysFinal,
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

  const handleSaveBankHolidays = (next: IConfigBankHoliday[]) => {
    setBankHolidays(next);
    if (onSaveBankHolidays) {
      onSaveBankHolidays(next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: holidayRowsFinal,
        bankHolidays: next,
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

  const toolbarButtons = HOLIDAY_CALENDAR_SECTION_CONFIG.toolbarButtons.map((btn) => ({
    ...btn,
    isActive: btn.key === activeView,
    onClick: () => setActiveView(btn.key as HCActiveView),
  }));

  return (
    <GenericAccordion
      title={HOLIDAY_CALENDAR_SECTION_CONFIG.title}
      subtitle={HOLIDAY_CALENDAR_SECTION_CONFIG.subtitle}
      icon={HOLIDAY_CALENDAR_SECTION_CONFIG.icon}
      accent={HOLIDAY_CALENDAR_SECTION_CONFIG.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar buttons={toolbarButtons} />

      {activeView === 'holiday' && (
        <GenericPanel
          config={TABLE_CONFIG.holidayCalendar}
          data={holidayRowsFinal}
          onSave={handleSave}
          customColumns={holidayCalendarColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'bankHolidays' && (
        <GenericPanel
          config={TABLE_CONFIG.bankHoliday}
          data={bankHolidaysFinal}
          onSave={handleSaveBankHolidays}
          customColumns={bankHolidayColumns as any}
          variant='standard'
          enableSuccessMessage
        />
      )}
    </GenericAccordion>
  );
};

export { HolidayCalendarsSection };
