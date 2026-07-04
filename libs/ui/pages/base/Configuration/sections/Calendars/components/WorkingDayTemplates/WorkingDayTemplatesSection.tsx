import { useEffect, useMemo, useState } from 'react';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { WDTActiveView, WorkingDayTemplatesSectionProps } from './WorkingDayTemplatesSection.types';
import {
  DayOfWeek,
  IConfigWorkingDayTemplate,
  IConfigWorkingDayTemplateTime,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  WORKING_DAY_TEMPLATE_CONFIG,
  WORKING_DAY_TEMPLATE_TIMES_CONFIG,
  workingDayTemplateColumns,
  workingDayTemplateTimesColumns,
  WorkingTimeRow,
} from './WorkingDayTemplatesSection.config';
import { CreateWorkingTimesDialog } from './CreateWorkingTimesDialog';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const toMinutes = (t: string): number | null => {
  const m = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.exec(t || '');
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

const workingHoursFor = (block: IConfigWorkingDayTemplateTime): number => {
  const from = toMinutes(block.fromTime);
  const to = toMinutes(block.toTime);
  if (from === null || to === null || to <= from) return 0;
  return Number(((to - from) / 60).toFixed(2));
};

interface DialogContext {
  templateId?: string;
  day?: DayOfWeek;
  blockId?: string | null;
}

const WorkingDayTemplatesSection = ({
  data,
  workingTimeRows,
  onDataChange,
  onWorkingTimesChange,
}: WorkingDayTemplatesSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [workingTimes, setWorkingTimes] = useState<IConfigWorkingDayTemplateTime[]>([]);
  const [activeView, setActiveView] = useState<WDTActiveView>('templates');
  const [selectedWTRowId, setSelectedWTRowId] = useState<string | null>(null);
  const [wtDialogOpen, setWtDialogOpen] = useState(false);
  const [wtDialogCtx, setWtDialogCtx] = useState<DialogContext>({});

  const rows = data ?? apiCAL?.workingDayTemplates ?? [];
  const workingTimesFinal = workingTimeRows ?? workingTimes;

  useEffect(() => {
    if (workingTimeRows !== undefined) {
      setWorkingTimes(workingTimeRows);
    } else if (apiCAL?.workingDayTemplateTimes) {
      setWorkingTimes(apiCAL.workingDayTemplateTimes);
    }
  }, [workingTimeRows, apiCAL]);

  const handleSave = (next: IConfigWorkingDayTemplate[]) => {
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: next,
        workingDayTemplateTimes: workingTimesFinal,
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

  const handleSaveWorkingTimes = (next: IConfigWorkingDayTemplateTime[]) => {
    if (workingTimeRows !== undefined) {
      setWorkingTimes(next);
    }
    if (onWorkingTimesChange) {
      onWorkingTimesChange(next);
    } else {
      saveSection('calendars', {
        workingDayTemplates: rows,
        workingDayTemplateTimes: next,
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

  // Flattened rows for the data table: one row per time block, joined with
  // its template name and weekday label, plus the derived (display-only)
  // working hours for that block.
  const flattenedWorkingTimes: WorkingTimeRow[] = useMemo(
    () =>
      workingTimesFinal.map((block) => {
        const template = rows.find((t) => t.id === block.workingDayTemplateId);
        return {
          ...block,
          workingDayTemplateName: template?.name ?? '—',
          dayLabel: DAY_LABELS[block.dayOfWeek] ?? block.dayOfWeek,
          workingHours: workingHoursFor(block),
        };
      }),
    [workingTimesFinal, rows],
  );

  // GenericPanel's built-in Delete flow calls onSave with the flattened
  // (post-filter) rows — strip the display-only fields back off before
  // persisting.
  const handleDeleteFlattened = (next: WorkingTimeRow[]) => {
    handleSaveWorkingTimes(
      next.map(({ workingDayTemplateName: _n, dayLabel: _d, workingHours: _h, ...block }) => block),
    );
  };

  const handleOpenNewWorkingTime = () => {
    setWtDialogCtx({ templateId: rows[0]?.id, day: 'monday', blockId: null });
    setWtDialogOpen(true);
  };

  const handleOpenEditWorkingTime = () => {
    const row = flattenedWorkingTimes.find((r) => r.id === selectedWTRowId);
    if (!row) return;
    setWtDialogCtx({ templateId: row.workingDayTemplateId, day: row.dayOfWeek, blockId: row.id });
    setWtDialogOpen(true);
  };

  return (
    <GenericAccordion
      title={WORKING_DAY_TEMPLATE_CONFIG.title}
      subtitle={WORKING_DAY_TEMPLATE_CONFIG.subtitle}
      icon={WORKING_DAY_TEMPLATE_CONFIG.icon}
      accent={WORKING_DAY_TEMPLATE_CONFIG.accent}
      className={classes.sectionAccordion}
      defaultExpanded
    >
      <GenericToolbar
        buttons={[
          {
            key: 'templates',
            label: 'Working time template',
            icon: WORKING_DAY_TEMPLATE_CONFIG.icon,
            isActive: activeView === 'templates',
            onClick: () => setActiveView('templates'),
          },
          {
            key: 'workingTimes',
            label: 'Create working times',
            icon: WORKING_DAY_TEMPLATE_TIMES_CONFIG.icon,
            isActive: activeView === 'workingTimes',
            onClick: () => setActiveView('workingTimes'),
          },
        ]}
      />

      {activeView === 'templates' && (
        <GenericPanel
          config={WORKING_DAY_TEMPLATE_CONFIG}
          data={rows as any}
          onSave={handleSave}
          customColumns={workingDayTemplateColumns as any}
          variant='standard'
          hideHeader
          enableSuccessMessage
        />
      )}

      {activeView === 'workingTimes' && (
        <GenericPanel
          config={WORKING_DAY_TEMPLATE_TIMES_CONFIG}
          data={flattenedWorkingTimes as any}
          onSave={handleDeleteFlattened as any}
          customColumns={workingDayTemplateTimesColumns as any}
          variant='standard'
          hideHeader
          enableSuccessMessage
          selectedRowId={selectedWTRowId}
          onRowSelect={setSelectedWTRowId}
          onNewClick={handleOpenNewWorkingTime}
          onEditClick={handleOpenEditWorkingTime}
        />
      )}

      <CreateWorkingTimesDialog
        open={wtDialogOpen}
        onClose={() => setWtDialogOpen(false)}
        templates={rows}
        timeBlocks={workingTimesFinal}
        onSave={handleSaveWorkingTimes}
        initialTemplateId={wtDialogCtx.templateId}
        initialDay={wtDialogCtx.day}
        initialBlockId={wtDialogCtx.blockId}
      />
    </GenericAccordion>
  );
};

export { WorkingDayTemplatesSection };
