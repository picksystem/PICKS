import { useCallback, useState, useEffect } from 'react';
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

  // Both "Timesheet Period" (name) and "Day Week Starts On" are marked "Not
  // allowed" for duplicates, so each is checked independently — a row is
  // rejected if either value already appears on another row. "Day Week
  // Starts On" is optional, so a blank value isn't checked against other
  // blanks. Same "already exists" dialog-level Alert pattern used by the
  // Working Time Template / Holiday Calendar dialogs.
  const summaryValidator = useCallback(
    (
      form: Record<string, unknown>,
      _all: unknown[],
      editingRow: Record<string, unknown> | null,
    ): string | null => {
      const norm = (v: unknown) =>
        String(v ?? '')
          .trim()
          .toLowerCase();
      const editingId = (editingRow?.id as string | undefined) ?? null;
      const others = rows.filter((r) => r.id !== editingId);

      const nameVal = norm(form.name);
      if (nameVal && others.some((r) => norm(r.name) === nameVal)) {
        return `Timesheet Period "${String(form.name ?? '')}" already exists. Please use a different name.`;
      }

      const weekStartsOnVal = norm(form.weekStartsOn);
      if (weekStartsOnVal && others.some((r) => norm(r.weekStartsOn) === weekStartsOnVal)) {
        return `Day Week Starts On "${String(form.weekStartsOn ?? '')}" already exists. Please use a different value.`;
      }

      return null;
    },
    [rows],
  );

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
        summaryValidator={summaryValidator as unknown as never}
      />
    </div>
  );
};

export { TimesheetPeriodsSection };
