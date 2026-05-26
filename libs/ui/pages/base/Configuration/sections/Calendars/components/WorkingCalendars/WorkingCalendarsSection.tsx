import { useState, useEffect } from 'react';
import {
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  TABLE_CONFIG,
  WORKING_TIMES_TABLE_CONFIG,
  COMPOSED_TIMES_TABLE_CONFIG,
  WORK_LOCATIONS_TABLE_CONFIG,
  CONSULTANTS_TABLE_CONFIG,
  workingCalendarColumns,
  workingTimesColumns,
  composedTimesColumns,
  workLocationsColumns,
  consultantsColumns,
} from '../shared';
import { WORKING_CALENDAR_SECTION_CONFIG } from './WorkingCalendarsSection.config';
import { WCActiveView, WorkingCalendarsSectionProps } from './WorkingCalendarsSection.types';

const WorkingCalendarsSection = ({ data, onDataChange }: WorkingCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkingCalendar[]>([]);
  const [wcTimes, setWcTimes] = useState<IConfigWorkingCalendarTime[]>([]);
  const [composedTimes, setComposedTimes] = useState<IConfigComposedWorkingTime[]>([]);
  const [workLocations, setWorkLocations] = useState<IConfigCalendarWorkLocation[]>([]);
  const [consultants, setConsultants] = useState<IConfigCalendarConsultant[]>([]);

  const [activeView, setActiveView] = useState<WCActiveView>('calendar');

  const rowsFinal = data ?? rows;

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCAL?.workingCalendars) {
      setRows(apiCAL.workingCalendars);
    }
  }, [data, apiCAL]);

  useEffect(() => {
    if (apiCAL?.workingCalendarTimes) setWcTimes(apiCAL.workingCalendarTimes);
    if (apiCAL?.composedWorkingTimes) setComposedTimes(apiCAL.composedWorkingTimes);
    if (apiCAL?.calendarWorkLocations) setWorkLocations(apiCAL.calendarWorkLocations);
    if (apiCAL?.calendarConsultants) setConsultants(apiCAL.calendarConsultants);
  }, [apiCAL]);

  const handleSave = (nextRows: IConfigWorkingCalendar[]) => {
    if (data !== undefined) {
      setRows(nextRows);
    }
    if (onDataChange) {
      onDataChange(nextRows);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: nextRows,
        workingCalendarTimes: wcTimes,
        composedWorkingTimes: composedTimes,
        calendarWorkLocations: workLocations,
        calendarConsultants: consultants,
      });
    }
  };

  const handleSaveWcTimes = (next: IConfigWorkingCalendarTime[]) => {
    setWcTimes(next);
    saveSection('calendars', {
      workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
      holidayCalendars: apiCAL?.holidayCalendars ?? [],
      bankHolidays: apiCAL?.bankHolidays ?? [],
      workingCalendars: rowsFinal,
      workingCalendarTimes: next,
      composedWorkingTimes: composedTimes,
      calendarWorkLocations: workLocations,
      calendarConsultants: consultants,
    });
  };

  const handleSaveComposedTimes = (next: IConfigComposedWorkingTime[]) => {
    setComposedTimes(next);
    saveSection('calendars', {
      workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
      holidayCalendars: apiCAL?.holidayCalendars ?? [],
      bankHolidays: apiCAL?.bankHolidays ?? [],
      workingCalendars: rowsFinal,
      workingCalendarTimes: wcTimes,
      composedWorkingTimes: next,
      calendarWorkLocations: workLocations,
      calendarConsultants: consultants,
    });
  };

  const handleSaveWorkLocations = (next: IConfigCalendarWorkLocation[]) => {
    setWorkLocations(next);
    saveSection('calendars', {
      workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
      holidayCalendars: apiCAL?.holidayCalendars ?? [],
      bankHolidays: apiCAL?.bankHolidays ?? [],
      workingCalendars: rowsFinal,
      workingCalendarTimes: wcTimes,
      composedWorkingTimes: composedTimes,
      calendarWorkLocations: next,
      calendarConsultants: consultants,
    });
  };

  const handleSaveConsultants = (next: IConfigCalendarConsultant[]) => {
    setConsultants(next);
    saveSection('calendars', {
      workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
      holidayCalendars: apiCAL?.holidayCalendars ?? [],
      bankHolidays: apiCAL?.bankHolidays ?? [],
      workingCalendars: rowsFinal,
      workingCalendarTimes: wcTimes,
      composedWorkingTimes: composedTimes,
      calendarWorkLocations: workLocations,
      calendarConsultants: next,
    });
  };

  const toolbarButtons = WORKING_CALENDAR_SECTION_CONFIG.toolbarButtons.map((btn) => ({
    ...btn,
    isActive: btn.key === activeView,
    onClick: () => setActiveView(btn.key as WCActiveView),
  }));

  return (
    <GenericAccordion
      title={WORKING_CALENDAR_SECTION_CONFIG.title}
      subtitle={WORKING_CALENDAR_SECTION_CONFIG.subtitle}
      icon={WORKING_CALENDAR_SECTION_CONFIG.icon}
      accent={WORKING_CALENDAR_SECTION_CONFIG.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar buttons={toolbarButtons} />

      {activeView === 'calendar' && (
        <GenericPanel
          config={TABLE_CONFIG.workingCalendar}
          data={rowsFinal as unknown as Record<string, unknown>[]}
          onSave={handleSave as (data: unknown[]) => void}
          customColumns={workingCalendarColumns as unknown as never}
        />
      )}
      {activeView === 'workingTimes' && (
        <GenericPanel
          config={WORKING_TIMES_TABLE_CONFIG}
          data={wcTimes as unknown as Record<string, unknown>[]}
          onSave={handleSaveWcTimes as (data: unknown[]) => void}
          customColumns={workingTimesColumns as unknown as never}
        />
      )}
      {activeView === 'composedTimes' && (
        <GenericPanel
          config={COMPOSED_TIMES_TABLE_CONFIG}
          data={composedTimes as unknown as Record<string, unknown>[]}
          onSave={handleSaveComposedTimes as (data: unknown[]) => void}
          customColumns={composedTimesColumns as unknown as never}
        />
      )}
      {activeView === 'workLocations' && (
        <GenericPanel
          config={WORK_LOCATIONS_TABLE_CONFIG}
          data={workLocations as unknown as Record<string, unknown>[]}
          onSave={handleSaveWorkLocations as (data: unknown[]) => void}
          customColumns={workLocationsColumns as unknown as never}
        />
      )}
      {activeView === 'consultants' && (
        <GenericPanel
          config={CONSULTANTS_TABLE_CONFIG}
          data={consultants as unknown as Record<string, unknown>[]}
          onSave={handleSaveConsultants as (data: unknown[]) => void}
          customColumns={consultantsColumns as unknown as never}
        />
      )}
    </GenericAccordion>
  );
};

export { WorkingCalendarsSection };
