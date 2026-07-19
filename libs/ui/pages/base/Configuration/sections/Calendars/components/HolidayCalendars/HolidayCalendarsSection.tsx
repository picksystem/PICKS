import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { darken } from '@mui/material/styles';
import { SearchField } from '../../../../shared/SearchField';
import { IConfigHolidayCalendar, IConfigBankHoliday } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { HolidayCalendarFormDialog } from '@serviceops/pages/base/Configuration/dialogs/HolidayCalendarFormDialog';
import { TableFilterField } from '@serviceops/configcatorshared';
import { Box, Button, Divider, Tooltip, Typography } from '@serviceops/component';
import { TABLE_CONFIG, holidayCalendarColumns, bankHolidayColumns } from '../shared';
import { HCActiveView, HolidayCalendarsSectionProps } from './HolidayCalendarsSection.types';

const VIEW_BUTTONS: { key: HCActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'holiday',
    label: 'Holiday Calendar',
    icon: <CalendarMonthIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'bankHolidays',
    label: 'Bank Holidays (Public Holidays)',
    icon: <BeachAccessIcon sx={{ fontSize: '1rem' }} />,
  },
];

// Header content (icon/title/subtitle/accent) for the sub-view dialog,
// matching the gradient banner used by every Configuration form dialog
// (see ConfigFormDialog in @serviceops/configdialogs). Reuses the same
// TableConfig already driving the sub-view's own GenericPanel, so the
// dialog header and the data table underneath always agree.
const VIEW_DIALOG_CONFIG: Partial<
  Record<HCActiveView, { title: string; subtitle?: string; accent: string; icon: React.ReactNode }>
> = {
  bankHolidays: TABLE_CONFIG.bankHoliday,
};

const HolidayCalendarsSection = ({
  holidayRows,
  bankHolidays: initialBH,
  onDataChange,
  onSaveBankHolidays,
}: HolidayCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [activeView, setActiveView] = useState<HCActiveView>('holiday');
  const [rows, setRows] = useState<IConfigHolidayCalendar[]>([]);
  const [bankHolidaysState, setBankHolidaysState] = useState<IConfigBankHoliday[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigHolidayCalendar | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bhCalendarFilter, setBhCalendarFilter] = useState('');
  const [bhYearFilter, setBhYearFilter] = useState('');

  useEffect(() => {
    if (holidayRows !== undefined) {
      setRows(holidayRows);
    } else if (apiCAL?.holidayCalendars) {
      setRows(apiCAL.holidayCalendars);
    }
  }, [holidayRows, apiCAL]);

  useEffect(() => {
    if (initialBH !== undefined) {
      setBankHolidaysState(initialBH);
    } else if (apiCAL?.bankHolidays) {
      setBankHolidaysState(apiCAL.bankHolidays);
    }
  }, [initialBH, apiCAL]);

  // The Bank Holidays button only makes sense in the context of a selected
  // holiday calendar, so it stays hidden until a row is selected —
  // mirroring the User Management toolbar (Service Lines/Applications/
  // Application Queues use the same pattern). If the selection is cleared
  // while that view is active, fall back to the main Holiday Calendar
  // table so the user isn't left on a view whose toolbar button just
  // disappeared.
  useEffect(() => {
    if (!selectedRowId && activeView !== 'holiday') {
      setActiveView('holiday');
    }
  }, [selectedRowId, activeView]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  // Reset (and pre-fill) the Bank Holidays filters every time the sub-view
  // dialog opens, so it starts scoped to the calendar that was selected —
  // the user can clear the filter (via its Clear icon) to see every
  // calendar's bank holidays.
  useEffect(() => {
    if (activeView === 'bankHolidays') {
      setBhCalendarFilter(selectedRow?.name ?? '');
      setBhYearFilter('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const handleSave = useCallback(
    (next: IConfigHolidayCalendar[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next, bankHolidaysState);
      } else {
        saveSection('calendars', {
          workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
          workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
          holidayCalendars: next,
          bankHolidays: bankHolidaysState,
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
    },
    [onDataChange, apiCAL, saveSection, bankHolidaysState],
  );

  const handleSaveBankHolidays = useCallback(
    (next: IConfigBankHoliday[]) => {
      setBankHolidaysState(next);
      if (onSaveBankHolidays) {
        onSaveBankHolidays(next);
      } else {
        saveSection('calendars', {
          workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
          workingDayTemplateTimes: apiCAL?.workingDayTemplateTimes ?? [],
          holidayCalendars: rows,
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
    },
    [onSaveBankHolidays, apiCAL, saveSection, rows],
  );

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingRow(selected);
      setDialogOpen(true);
    }
  }, [rows, selectedRowId]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleDialogSave = useCallback(
    (form: Partial<IConfigHolidayCalendar>) => {
      const myId = editingRow?.id;
      const next: IConfigHolidayCalendar[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              name: form.name ?? '',
              shortDescription: form.shortDescription ?? '',
              description: form.description ?? '',
              internalNote: form.internalNote ?? '',
            } as IConfigHolidayCalendar,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      setSelectedRowId(null);
    } catch {
      // Errors already surface via saveSection; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave]);

  // Search box in the custom toolbar (GenericPanel's own is hidden via
  // hideToolbar since New/Edit/Delete/Clear are driven externally) — matches
  // the "search across every visible field" behavior used elsewhere (e.g.
  // UserManagementSection's table search).
  const filteredRows = search
    ? rows.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : rows;

  // Filter dropdown options for the Bank Holidays sub-view — distinct
  // values currently present in the table, so picking one always yields
  // at least one result.
  const bhCalendarFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    bankHolidaysState.forEach((r) => {
      const v = String(r.calendarName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [bankHolidaysState]);

  const bhYearFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    bankHolidaysState.forEach((r) => {
      const v = String(r.calendarYear ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [bankHolidaysState]);

  const filteredBankHolidays = useMemo(
    () =>
      bankHolidaysState.filter(
        (r) =>
          (!bhCalendarFilter || r.calendarName === bhCalendarFilter) &&
          (!bhYearFilter || String(r.calendarYear) === bhYearFilter),
      ),
    [bankHolidaysState, bhCalendarFilter, bhYearFilter],
  );

  // Pre-fill the Add dialog's Holiday Calendar field with the calendar this
  // sub-view was opened from, so the user isn't asked to re-pick a value
  // that's already implied by the selection.
  const bankHolidayConfig = useMemo(
    () => ({
      ...TABLE_CONFIG.bankHoliday,
      fields: TABLE_CONFIG.bankHoliday.fields.map((field) =>
        field.name === 'calendarName'
          ? { ...field, defaultValue: selectedRow?.name ?? '' }
          : field,
      ),
    }),
    [selectedRow],
  );

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredBankHolidays}) — merge
  // it back with whatever fell outside the active filters so other
  // calendars' bank holidays aren't wiped out.
  const handleBankHolidaySave = (next: IConfigBankHoliday[]) => {
    const untouched = bankHolidaysState.filter(
      (r) => !filteredBankHolidays.some((fr) => fr.id === r.id),
    );
    handleSaveBankHolidays([...untouched, ...next]);
  };

  // Only Holiday Calendar is checked for duplicates — Calendar Year, Date,
  // Day and Holiday Detail all allow duplicates, so a given Holiday
  // Calendar can only ever have a single Bank Holiday row. Checked against
  // the full, unfiltered bank holiday list (not just the active filter's
  // subset), same "already exists" dialog-level Alert pattern used by the
  // Working Time Template / Holiday Calendar dialogs.
  const bankHolidaySummaryValidator = useCallback(
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
      const isDuplicate = bankHolidaysState.some(
        (r) => r.id !== editingId && norm(r.calendarName) === norm(form.calendarName),
      );

      return isDuplicate
        ? `Bank Holiday for "${String(form.calendarName ?? '')}" already exists. Please use a different value.`
        : null;
    },
    [bankHolidaysState],
  );

  return (
    <GenericAccordion
      title='Holiday Calendar'
      subtitle='Manage holiday calendars and their public bank holidays'
      icon={<CalendarMonthIcon sx={{ fontSize: '1rem' }} />}
      accent={TABLE_CONFIG.holidayCalendar.accent}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedRowId && (
            <Tooltip title='Create new holiday calendar'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleNewClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New Holiday Calendar
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Edit selected holiday calendar'>
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
            <Tooltip title='Delete selected holiday calendar'>
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

          {selectedRowId &&
            VIEW_BUTTONS.filter((btn) => btn.key !== 'holiday').map((btn) => (
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
              <SearchField value={search} onChange={setSearch} className={classes.tableSearchField} />
            </Box>
          )}
        </Box>
      </GenericToolbar>

      {activeView === 'holiday' && (
        <>
          <GenericPanel
            config={TABLE_CONFIG.holidayCalendar}
            data={filteredRows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={holidayCalendarColumns as unknown as undefined}
            variant='standard'
            hideHeader
            hideToolbar
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />

          <HolidayCalendarFormDialog
            open={dialogOpen}
            editing={editingRow}
            existingCalendars={rows}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
            subtitle={TABLE_CONFIG.holidayCalendar.subtitle}
          />

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            entityName='Holiday Calendar'
            itemName={editingRow?.name ?? selectedRow?.name ?? ''}
          />
        </>
      )}

      {/* Bank Holidays opens as a dialog over the Holiday Calendar table
          (matching the User Management "Changes Log" dialog pattern and
          the Service Lines/Applications/Application Queues sections)
          instead of swapping the inline accordion body. The header
          mirrors every Configuration form dialog's gradient banner (see
          ConfigFormDialog) — icon + title + subtitle on an accent
          gradient, with a close (X) button. The panel keeps GenericPanel's
          own New/Edit/Delete toolbar (Bank Holiday fields are plain text/
          date, so the built-in config-driven form is enough — no custom
          FormDialog needed), with hideHeader so its own icon+title banner
          doesn't duplicate this one. */}
      <Dialog
        open={activeView !== 'holiday'}
        onClose={() => setActiveView('holiday')}
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
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
                      {dlgConfig.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setActiveView('holiday')} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          );
        })()}
        <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
          {activeView === 'bankHolidays' && (
            <GenericPanel
              config={bankHolidayConfig}
              data={filteredBankHolidays as unknown as Record<string, unknown>[]}
              onSave={handleBankHolidaySave as (data: unknown[]) => void}
              customColumns={bankHolidayColumns as unknown as undefined}
              variant='standard'
              hideHeader
              enableSuccessMessage
              summaryValidator={bankHolidaySummaryValidator as unknown as never}
              toolbarExtra={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TableFilterField
                    label='Holiday Calendar'
                    value={bhCalendarFilter}
                    onChange={setBhCalendarFilter}
                    options={bhCalendarFilterOptions}
                  />
                  <TableFilterField
                    label='Calendar Year'
                    value={bhYearFilter}
                    onChange={setBhYearFilter}
                    options={bhYearFilterOptions}
                  />
                </Box>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </GenericAccordion>
  );
};

export { HolidayCalendarsSection };
