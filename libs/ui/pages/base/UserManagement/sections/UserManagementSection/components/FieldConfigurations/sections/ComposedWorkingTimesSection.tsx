import { useState, useEffect, useCallback } from 'react';
import { IConfigComposedWorkingTime } from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  COMPOSED_WORKING_TIME_CONFIG,
  composedWorkingTimeColumns,
} from '../shared/userConfig.config';

interface ComposeWorkingTimesSectionProps {
  data?: IConfigComposedWorkingTime[];
  onDataChange?: (data: IConfigComposedWorkingTime[]) => void;
}

const ComposeWorkingTimesSection = ({ data, onDataChange }: ComposeWorkingTimesSectionProps) => {
  const [rows, setRows] = useState<IConfigComposedWorkingTime[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  const handleSave = (next: unknown[]) => {
    setRows(next as IConfigComposedWorkingTime[]);
    if (onDataChange) {
      onDataChange(next as IConfigComposedWorkingTime[]);
    }
  };

  // From date, To date, Working calendar, Holiday calendar and Working time
  // template are all "Not allowed" for duplicates — the full combination of
  // all five must be unique, so composing the exact same range for the same
  // calendar/holiday-calendar/template twice is rejected. Same pattern used
  // by the Config > Calendars > Working Calendars > Compose Working Times
  // dialog.
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
      const isDuplicate = rows.some(
        (r) =>
          r.id !== editingId &&
          norm(r.fromDate) === norm(form.fromDate) &&
          norm(r.toDate) === norm(form.toDate) &&
          norm(r.workingCalendar) === norm(form.workingCalendar) &&
          norm(r.holidayCalendar) === norm(form.holidayCalendar) &&
          norm(r.workingTimeTemplate) === norm(form.workingTimeTemplate),
      );
      return isDuplicate
        ? `A Composed Working Time from ${String(form.fromDate ?? '')} to ${String(form.toDate ?? '')} already exists for "${String(form.workingCalendar ?? '')}". Please use a different date range.`
        : null;
    },
    [rows],
  );

  return (
    <GenericAccordion
      title={COMPOSED_WORKING_TIME_CONFIG.title}
      subtitle={COMPOSED_WORKING_TIME_CONFIG.subtitle}
      icon={COMPOSED_WORKING_TIME_CONFIG.icon}
      accent={COMPOSED_WORKING_TIME_CONFIG.accent}
      defaultExpanded={false}
    >
      <GenericPanel
        config={COMPOSED_WORKING_TIME_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={composedWorkingTimeColumns as unknown as never}
        variant='standard'
        enableSuccessMessage
        summaryValidator={summaryValidator as unknown as never}
      />
    </GenericAccordion>
  );
};

export { ComposeWorkingTimesSection };
