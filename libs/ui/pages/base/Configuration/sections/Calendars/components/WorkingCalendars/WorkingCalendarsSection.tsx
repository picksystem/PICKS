import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { darken } from '@mui/material/styles';
import { SearchField } from '../../../../shared/SearchField';
import {
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { WorkingCalendarFormDialog } from '@serviceops/pages/base/Configuration/dialogs/WorkingCalendarFormDialog';
import { ComposeWorkingTimesFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ComposeWorkingTimesFormDialog';
import { TableFilterField } from '@serviceops/configcatorshared';
import { Box, Button, Divider, Tooltip, Typography } from '@serviceops/component';
import {
  TABLE_CONFIG,
  WORKING_TIMES_TABLE_CONFIG,
  COMPOSED_TIMES_TABLE_CONFIG,
  WORK_LOCATIONS_TABLE_CONFIG,
  CONSULTANTS_TABLE_CONFIG,
  workingCalendarColumns,
  composedTimesColumns,
  workLocationsColumns,
  consultantsColumns,
} from '../shared';
import { WCActiveView, WorkingCalendarsSectionProps } from './WorkingCalendarsSection.types';

const VIEW_BUTTONS: { key: WCActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'calendar',
    label: 'Working Calendars',
    icon: <CalendarTodayIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'workingTimes',
    label: 'Working Times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'workLocations',
    label: 'Work Locations',
    icon: <LocationOnIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'consultants',
    label: 'Associated Consultants',
    icon: <PeopleIcon sx={{ fontSize: '1rem' }} />,
  },
];

// Header content (icon/title/subtitle/accent) for the sub-view dialog,
// matching the gradient banner used by every Configuration form dialog
// (see ConfigFormDialog in @serviceops/configdialogs). Reuses the same
// TableConfig already driving the sub-view's own GenericPanel, so the
// dialog header and the data table underneath always agree.
const VIEW_DIALOG_CONFIG: Partial<
  Record<WCActiveView, { title: string; subtitle?: string; accent: string; icon: React.ReactNode }>
> = {
  workingTimes: WORKING_TIMES_TABLE_CONFIG,
  workLocations: WORK_LOCATIONS_TABLE_CONFIG,
  consultants: CONSULTANTS_TABLE_CONFIG,
};

const WorkingCalendarsSection = ({ data, onDataChange }: WorkingCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkingCalendar[]>([]);
  const [wcTimes, setWcTimes] = useState<IConfigWorkingCalendarTime[]>([]);
  const [composedTimes, setComposedTimes] = useState<IConfigComposedWorkingTime[]>([]);
  const [workLocations, setWorkLocations] = useState<IConfigCalendarWorkLocation[]>([]);
  const [consultants, setConsultants] = useState<IConfigCalendarConsultant[]>([]);

  const [activeView, setActiveView] = useState<WCActiveView>('calendar');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkingCalendar | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Sub-view filter state — one Calendar filter per sub-view (pre-filled
  // from the selected row when the dialog opens) plus one secondary filter
  // matching that table's other categorical column.
  const [ctCalendarFilter, setCtCalendarFilter] = useState('');
  const [ctDayFilter, setCtDayFilter] = useState('');
  const [wlCalendarFilter, setWlCalendarFilter] = useState('');
  const [wlLocationFilter, setWlLocationFilter] = useState('');
  const [coCalendarFilter, setCoCalendarFilter] = useState('');
  const [coRoleFilter, setCoRoleFilter] = useState('');
  const [coAppFilter, setCoAppFilter] = useState('');

  // "Composed Working Times" opens a single-purpose Compose form dialog
  // first (From date/To date, with Calendar/Holiday Calendar/Working Time
  // Template shown read-only from the selected Working Calendar row) —
  // matching a real "compose working times" action rather than a raw CRUD
  // table. Submitting adds the resulting entry to `composedTimes` and opens
  // the existing data table sub-view, which already carries every field the
  // compose form collected (see composedTimesColumns).
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

  const rowsFinal = data ?? rows;

  // Options for the Working Calendar dialog's "Holiday Calendar" search
  // field, sourced from Calendar > Holiday calendar (tab) > Holiday
  // calendar (field) — same list HolidayCalendarsSection manages.
  const holidayCalendarOptions = useMemo(
    () =>
      (apiCAL?.holidayCalendars ?? []).map((hc) => ({
        value: hc.name ?? '',
        label: hc.name ?? '',
      })),
    [apiCAL?.holidayCalendars],
  );

  // Options for the Working Calendar dialog's "Working Day Template" search
  // field, sourced from Calendar > Working day template (tab) > Working
  // day template (field) — same list WorkingDayTemplatesSection manages.
  const workingDayTemplateOptions = useMemo(
    () =>
      (apiCAL?.workingDayTemplates ?? []).map((wdt) => ({
        value: wdt.name ?? '',
        label: wdt.name ?? '',
      })),
    [apiCAL?.workingDayTemplates],
  );

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

  // The sub-view buttons only make sense in the context of a selected
  // working calendar, so they stay hidden until a row is selected —
  // mirroring the User Management toolbar (Holiday Calendar/Service
  // Lines/Applications/Application Queues use the same pattern). If the
  // selection is cleared while one of those views is active, fall back to
  // the main Working Calendars table so the user isn't left on a view
  // whose toolbar button just disappeared.
  useEffect(() => {
    if (!selectedRowId && activeView !== 'calendar') {
      setActiveView('calendar');
    }
    if (!selectedRowId) {
      setComposeDialogOpen(false);
    }
  }, [selectedRowId, activeView]);

  const selectedRow = rowsFinal.find((r) => r.id === selectedRowId) ?? null;

  // Reset (and pre-fill) each sub-view's Calendar filter every time its
  // dialog opens, so it starts scoped to the calendar that was selected —
  // the user can clear the filter (via its Clear icon) to see every
  // calendar's rows again.
  useEffect(() => {
    if (activeView === 'workingTimes') {
      setCtCalendarFilter(selectedRow?.name ?? '');
      setCtDayFilter('');
    } else if (activeView === 'workLocations') {
      setWlCalendarFilter(selectedRow?.name ?? '');
      setWlLocationFilter('');
    } else if (activeView === 'consultants') {
      setCoCalendarFilter(selectedRow?.name ?? '');
      setCoRoleFilter('');
      setCoAppFilter('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const handleSave = useCallback(
    (nextRows: IConfigWorkingCalendar[]) => {
      if (data !== undefined) {
        setRows(nextRows);
      }
      if (onDataChange) {
        onDataChange(nextRows);
      } else {
        saveSection('calendars', {
          workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
          workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
          holidayCalendars: apiCAL?.holidayCalendars ?? [],
          bankHolidays: apiCAL?.bankHolidays ?? [],
          workingCalendars: nextRows,
          workingCalendarTimes: wcTimes,
          composedWorkingTimes: composedTimes,
          calendarWorkLocations: workLocations,
          calendarConsultants: consultants,
          periodTypes: apiCAL?.periodTypes ?? [],
          timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
          workingShifts: apiCAL?.workingShifts ?? [],
          shiftConsultants: apiCAL?.shiftConsultants ?? [],
        });
      }
    },
    [data, onDataChange, apiCAL, saveSection, wcTimes, composedTimes, workLocations, consultants],
  );

  const handleSaveComposedTimes = useCallback(
    (next: IConfigComposedWorkingTime[]) => {
      setComposedTimes(next);
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: rowsFinal,
        workingCalendarTimes: wcTimes,
        composedWorkingTimes: next,
        calendarWorkLocations: workLocations,
        calendarConsultants: consultants,
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    },
    [apiCAL, saveSection, rowsFinal, wcTimes, workLocations, consultants],
  );

  const handleSaveWorkLocations = useCallback(
    (next: IConfigCalendarWorkLocation[]) => {
      setWorkLocations(next);
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: rowsFinal,
        workingCalendarTimes: wcTimes,
        composedWorkingTimes: composedTimes,
        calendarWorkLocations: next,
        calendarConsultants: consultants,
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    },
    [apiCAL, saveSection, rowsFinal, wcTimes, composedTimes, consultants],
  );

  const handleSaveConsultants = useCallback(
    (next: IConfigCalendarConsultant[]) => {
      setConsultants(next);
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: rowsFinal,
        workingCalendarTimes: wcTimes,
        composedWorkingTimes: composedTimes,
        calendarWorkLocations: workLocations,
        calendarConsultants: next,
        periodTypes: apiCAL?.periodTypes ?? [],
        timesheetPeriods: apiCAL?.timesheetPeriods ?? [],
        workingShifts: apiCAL?.workingShifts ?? [],
        shiftConsultants: apiCAL?.shiftConsultants ?? [],
      });
    },
    [apiCAL, saveSection, rowsFinal, wcTimes, composedTimes, workLocations],
  );

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rowsFinal.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingRow(selected);
      setDialogOpen(true);
    }
  }, [rowsFinal, selectedRowId]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleDialogSave = useCallback(
    (form: Partial<IConfigWorkingCalendar>) => {
      const myId = editingRow?.id;
      const next: IConfigWorkingCalendar[] = myId
        ? rowsFinal.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rowsFinal,
            {
              id: `${Date.now()}`,
              name: form.name ?? '',
              holidayCalendar: form.holidayCalendar ?? '',
              workingDayTemplate: form.workingDayTemplate ?? '',
              shortDescription: form.shortDescription ?? '',
              internalNote: form.internalNote ?? '',
            } as IConfigWorkingCalendar,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rowsFinal, editingRow, handleSave, handleDialogClose],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rowsFinal.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      setSelectedRowId(null);
    } catch {
      // Errors already surface via saveSection; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rowsFinal, handleSave]);

  // Search box in the custom toolbar (GenericPanel's own is hidden via
  // hideToolbar since New/Edit/Delete/Clear are driven externally) — matches
  // the "search across every visible field" behavior used elsewhere (e.g.
  // UserManagementSection's table search).
  const filteredRows = search
    ? rowsFinal.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : rowsFinal;

  // ── Working Times sub-view (shows composed working times) ────────────────
  const ctCalendarFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    composedTimes.forEach((r) => {
      const v = String(r.calendarName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [composedTimes]);
  const ctDayFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    composedTimes.forEach((r) => {
      const v = String(r.fromDate ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [composedTimes]);
  const filteredComposedTimes = useMemo(
    () =>
      composedTimes.filter(
        (r) =>
          (!ctCalendarFilter || r.calendarName === ctCalendarFilter) &&
          (!ctDayFilter || r.fromDate === ctDayFilter),
      ),
    [composedTimes, ctCalendarFilter, ctDayFilter],
  );
  const handleComposedTimesSave = (next: IConfigComposedWorkingTime[]) => {
    const untouched = composedTimes.filter(
      (r) => !filteredComposedTimes.some((fr) => fr.id === r.id),
    );
    handleSaveComposedTimes([...untouched, ...next]);
  };

  const handleComposeSubmit = useCallback(
    ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
      const newRow: IConfigComposedWorkingTime = {
        id: `${Date.now()}`,
        calendarName: selectedRow?.name ?? '',
        fromDate,
        toDate,
        workingCalendar: selectedRow?.name ?? '',
        holidayCalendar: selectedRow?.holidayCalendar ?? '',
        workingTimeTemplate: selectedRow?.workingDayTemplate ?? '',
      };
      handleComposedTimesSave([...filteredComposedTimes, newRow]);
      setComposeDialogOpen(false);
      setActiveView('workingTimes');
    },
    [selectedRow, filteredComposedTimes, handleComposedTimesSave],
  );

  // ── Work Locations sub-view ─────────────────────────────────────────────
  const wlCalendarFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    workLocations.forEach((r) => {
      const v = String(r.calendarName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [workLocations]);
  const wlLocationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    workLocations.forEach((r) => {
      const v = String(r.workLocation ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [workLocations]);
  const filteredWorkLocations = useMemo(
    () =>
      workLocations.filter(
        (r) =>
          (!wlCalendarFilter || r.calendarName === wlCalendarFilter) &&
          (!wlLocationFilter || r.workLocation === wlLocationFilter),
      ),
    [workLocations, wlCalendarFilter, wlLocationFilter],
  );
  const handleWorkLocationsSave = (next: IConfigCalendarWorkLocation[]) => {
    const untouched = workLocations.filter(
      (r) => !filteredWorkLocations.some((fr) => fr.id === r.id),
    );
    handleSaveWorkLocations([...untouched, ...next]);
  };

  // ── Associated Consultants sub-view ─────────────────────────────────────
  const coCalendarFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    consultants.forEach((r) => {
      const v = String(r.calendarName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [consultants]);
  const coRoleFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    consultants.forEach((r) => {
      const v = String(r.role ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [consultants]);
  const coAppFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    consultants.forEach((r) => {
      const v = String(r.application ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [consultants]);
  const filteredConsultants = useMemo(
    () =>
      consultants.filter(
        (r) =>
          (!coCalendarFilter || r.calendarName === coCalendarFilter) &&
          (!coRoleFilter || r.role === coRoleFilter) &&
          (!coAppFilter || r.application === coAppFilter),
      ),
    [consultants, coCalendarFilter, coRoleFilter, coAppFilter],
  );
  const handleConsultantsSave = (next: IConfigCalendarConsultant[]) => {
    const untouched = consultants.filter((r) => !filteredConsultants.some((fr) => fr.id === r.id));
    handleSaveConsultants([...untouched, ...next]);
  };

  return (
    <GenericAccordion
      title='Working Calendars'
      subtitle='Define working calendars with associated working times and consultants'
      icon={<CalendarTodayIcon sx={{ fontSize: '1rem' }} />}
      accent={TABLE_CONFIG.workingCalendar.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedRowId && (
            <Tooltip title='Create new working calendar'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleNewClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New Working Calendar
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Edit selected working calendar'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Edit
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Delete selected working calendar'>
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Delete
              </Button>
            </Tooltip>
          )}

          {selectedRowId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedRowId && (
            <Tooltip title='Compose working times for the selected calendar'>
              <Button
                size='small'
                variant={composeDialogOpen ? 'contained' : 'outlined'}
                startIcon={<EventNoteIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setComposeDialogOpen(true)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Compose Working Times
              </Button>
            </Tooltip>
          )}

          {selectedRowId &&
            VIEW_BUTTONS.filter((btn) => btn.key !== 'calendar').map((btn) => (
              <Tooltip key={btn.key} title={btn.label}>
                <Button
                  size='small'
                  variant={activeView === btn.key ? 'contained' : 'outlined'}
                  startIcon={btn.icon}
                  onClick={() => setActiveView(btn.key)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  {btn.label}
                </Button>
              </Tooltip>
            ))}

          {selectedRowId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedRowId && (
            <Tooltip title='Clear selection'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedRowId(null)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            </Tooltip>
          )}

          {!selectedRowId && (
            // SearchField's own wrapper defaults to width: 100% (meant for
            // standalone use), which forces it onto its own row inside a
            // flex toolbar — the `sx` prop can't win against that class
            // (same specificity, injection order dependent), so it's
            // wrapped in its own flexShrink:0 Box instead, keeping it
            // inline with the New button and pushed to the far right.
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <SearchField
                value={search}
                onChange={setSearch}
                className={classes.tableSearchField}
              />
            </Box>
          )}
        </Box>
      </GenericToolbar>

      {activeView === 'calendar' && (
        <>
          <GenericPanel
            config={TABLE_CONFIG.workingCalendar}
            data={filteredRows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={workingCalendarColumns as unknown as never}
            variant='standard'
            hideHeader
            hideToolbar
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />

          <WorkingCalendarFormDialog
            open={dialogOpen}
            editing={editingRow}
            existingCalendars={rowsFinal}
            holidayCalendarOptions={holidayCalendarOptions}
            workingDayTemplateOptions={workingDayTemplateOptions}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
            subtitle={TABLE_CONFIG.workingCalendar.subtitle}
          />

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            entityName='Working Calendar'
            itemName={editingRow?.name ?? selectedRow?.name ?? ''}
          />
        </>
      )}

      {/* Working Times/Work Locations/Consultants open as a dialog over the
          Working Calendars table (matching the User Management "Changes
          Log" dialog pattern and the Holiday Calendar/Service Lines/
          Applications/Application Queues sections) instead of swapping the
          inline accordion body. The header mirrors every Configuration form
          dialog's gradient banner (see ConfigFormDialog) — icon + title +
          subtitle on an accent gradient, with a close (X) button. Each
          panel keeps GenericPanel's own New/Edit/Delete toolbar, with
          hideHeader so its own icon+title banner doesn't duplicate this
          one. "Working Times" shows the composed working times (fromDate/
          toDate/workingCalendar/holidayCalendar/workingTimeTemplate) — the
          Compose Working Times action dialog is what feeds this table. */}
      <Dialog
        open={activeView !== 'calendar'}
        onClose={() => setActiveView('calendar')}
        maxWidth='xl'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '90vh' } }}
      >
        {(() => {
          const dlgConfig = VIEW_DIALOG_CONFIG[activeView];
          if (!dlgConfig) return null;
          return (
            <Box
              sx={{
                px: 3,
                py: 2.5,
                background: `linear-gradient(135deg, ${darken(dlgConfig.accent, 0.18)} 0%, ${dlgConfig.accent} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.75,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {dlgConfig.icon}
                  </Box>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
                  >
                    {dlgConfig.title}
                  </Typography>
                  {dlgConfig.subtitle && (
                    <Typography
                      sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}
                    >
                      {dlgConfig.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setActiveView('calendar')} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          );
        })()}
        <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
          {activeView === 'workingTimes' && (
            <GenericPanel
              config={COMPOSED_TIMES_TABLE_CONFIG}
              data={filteredComposedTimes as unknown as Record<string, unknown>[]}
              onSave={handleComposedTimesSave as (data: unknown[]) => void}
              customColumns={composedTimesColumns as unknown as never}
              variant='standard'
              hideHeader
              enableSuccessMessage
              toolbarExtra={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TableFilterField
                    label='Calendar'
                    value={ctCalendarFilter}
                    onChange={setCtCalendarFilter}
                    options={ctCalendarFilterOptions}
                  />
                  <TableFilterField
                    label='Day'
                    value={ctDayFilter}
                    onChange={setCtDayFilter}
                    options={ctDayFilterOptions}
                  />
                </Box>
              }
            />
          )}
          {activeView === 'workLocations' && (
            <GenericPanel
              config={WORK_LOCATIONS_TABLE_CONFIG}
              data={filteredWorkLocations as unknown as Record<string, unknown>[]}
              onSave={handleWorkLocationsSave as (data: unknown[]) => void}
              customColumns={workLocationsColumns as unknown as never}
              variant='standard'
              hideHeader
              enableSuccessMessage
              toolbarExtra={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TableFilterField
                    label='Calendar'
                    value={wlCalendarFilter}
                    onChange={setWlCalendarFilter}
                    options={wlCalendarFilterOptions}
                  />
                  <TableFilterField
                    label='Work Location'
                    value={wlLocationFilter}
                    onChange={setWlLocationFilter}
                    options={wlLocationFilterOptions}
                  />
                </Box>
              }
            />
          )}
          {activeView === 'consultants' && (
            <GenericPanel
              config={CONSULTANTS_TABLE_CONFIG}
              data={filteredConsultants as unknown as Record<string, unknown>[]}
              onSave={handleConsultantsSave as (data: unknown[]) => void}
              customColumns={consultantsColumns as unknown as never}
              variant='standard'
              hideHeader
              enableSuccessMessage
              toolbarExtra={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TableFilterField
                    label='Calendar'
                    value={coCalendarFilter}
                    onChange={setCoCalendarFilter}
                    options={coCalendarFilterOptions}
                  />
                  <TableFilterField
                    label='Role'
                    value={coRoleFilter}
                    onChange={setCoRoleFilter}
                    options={coRoleFilterOptions}
                  />
                  <TableFilterField
                    label='Application'
                    value={coAppFilter}
                    onChange={setCoAppFilter}
                    options={coAppFilterOptions}
                  />
                </Box>
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <ComposeWorkingTimesFormDialog
        open={composeDialogOpen}
        calendarName={selectedRow?.name}
        holidayCalendar={selectedRow?.holidayCalendar}
        workingTimeTemplate={selectedRow?.workingDayTemplate}
        existingComposedTimes={composedTimes}
        onClose={() => setComposeDialogOpen(false)}
        onSubmit={handleComposeSubmit}
      />
    </GenericAccordion>
  );
};

export { WorkingCalendarsSection };
