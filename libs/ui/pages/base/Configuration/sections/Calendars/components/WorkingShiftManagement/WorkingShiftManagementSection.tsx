import { useEffect, useState } from 'react';
import { IConfigWorkingShift, IConfigShiftConsultant } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  WSActiveView,
  WorkingShiftManagementSectionProps,
} from './WorkingShiftManagementSection.types';
import {
  WORKING_SHIFTS_TABLE_CONFIG,
  SHIFT_CONSULTANTS_TABLE_CONFIG,
  workingShiftsColumns,
  shiftConsultantsColumns,
} from '../shared';
import { WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG } from './WorkingShiftManagementSection.config';

const WorkingShiftManagementSection = ({
  workingShiftRows,
  shiftConsultantRows,
  onDataChange,
}: WorkingShiftManagementSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [workingShifts, setWorkingShifts] = useState<IConfigWorkingShift[]>([]);
  const [shiftConsultants, setShiftConsultants] = useState<IConfigShiftConsultant[]>([]);
  const [activeView, setActiveView] = useState<WSActiveView>('workingShifts');

  const workingShiftsFinal = workingShiftRows ?? workingShifts;
  const shiftConsultantsFinal = shiftConsultantRows ?? shiftConsultants;

  useEffect(() => {
    if (workingShiftRows !== undefined) {
      setWorkingShifts(workingShiftRows);
    } else if (apiCAL?.workingShifts) {
      setWorkingShifts(apiCAL.workingShifts);
    }
  }, [workingShiftRows, apiCAL]);

  useEffect(() => {
    if (shiftConsultantRows !== undefined) {
      setShiftConsultants(shiftConsultantRows);
    } else if (apiCAL?.shiftConsultants) {
      setShiftConsultants(apiCAL.shiftConsultants);
    }
  }, [shiftConsultantRows, apiCAL]);

  const handleSaveWorkingShifts = (next: IConfigWorkingShift[]) => {
    if (workingShiftRows !== undefined) {
      setWorkingShifts(next);
    }
    if (onDataChange) {
      onDataChange(next, shiftConsultantsFinal);
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
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: next,
        shiftConsultants: shiftConsultantsFinal,
      });
    }
  };

  const handleSaveShiftConsultants = (next: IConfigShiftConsultant[]) => {
    if (shiftConsultantRows !== undefined) {
      setShiftConsultants(next);
    }
    if (onDataChange) {
      onDataChange(workingShiftsFinal, next);
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
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: workingShiftsFinal,
        shiftConsultants: next,
      });
    }
  };

  const toolbarButtons = WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG.toolbarButtons.map((btn) => ({
    ...btn,
    isActive: btn.key === activeView,
    onClick: () => setActiveView(btn.key as WSActiveView),
  }));

  return (
    <GenericAccordion
      title={WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG.title}
      subtitle={WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG.subtitle}
      icon={WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG.icon}
      accent={WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar buttons={toolbarButtons} />

      {activeView === 'workingShifts' && (
        <GenericPanel
          config={WORKING_SHIFTS_TABLE_CONFIG}
          data={workingShiftsFinal as unknown as Record<string, unknown>[]}
          onSave={handleSaveWorkingShifts as (data: unknown[]) => void}
          customColumns={workingShiftsColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'consultants' && (
        <GenericPanel
          config={SHIFT_CONSULTANTS_TABLE_CONFIG}
          data={shiftConsultantsFinal as unknown as Record<string, unknown>[]}
          onSave={handleSaveShiftConsultants as (data: unknown[]) => void}
          customColumns={shiftConsultantsColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
        />
      )}
    </GenericAccordion>
  );
};

export { WorkingShiftManagementSection };
