import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Column } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import {
  ServiceLineTimesheetFormDialog,
  ServiceLineTimesheetRow,
} from '@serviceops/pages/base/Configuration/dialogs/ServiceLineTimesheetFormDialog';
import { SERVICE_LINE_TIMESHEET_CONFIG, TableFilterField } from '@serviceops/configcatorshared';
import { serviceLineTimesheetColumns } from '../../../shared/CategorizationPanelConfig';
import {
  ServiceLineTimesheetSectionProps,
  FlatServiceLineTSRow,
} from './ServiceLineTimesheetSection.types';

export const ServiceLineTimesheetSection = ({
  data,
  onDataChange,
  serviceLineOptions = [],
  projectOptions = [],
  onTimesheetSave,
  onTimesheetDelete,
  hideHeader,
  initialServiceLineFilter,
}: ServiceLineTimesheetSectionProps) => {
  const [rows, setRows] = useState<FlatServiceLineTSRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<FlatServiceLineTSRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [serviceLineFilter, setServiceLineFilter] = useState(initialServiceLineFilter ?? '');
  const [projectFilter, setProjectFilter] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  // Persist the local rows back through the section's parent. The
  // ServiceLinesSection (the parent) flattens the per-service-line
  // timesheet projects, so we just pass the list along — it knows how
  // to attach them to the right `serviceLineId`.
  const handleSave = useCallback(
    (next: FlatServiceLineTSRow[]) => {
      setRows(next);
      onDataChange?.(next);
    },
    [onDataChange],
  );

  // Custom columns: bold SL + project, plain dates, chip renderers for
  // activate + useInExpenses, plain text for everything else. The
  // application / maxHours / internalNote columns use the default
  // `mkCell` (no special rendering).
  const columns: Column<FlatServiceLineTSRow>[] = useMemo(
    () => serviceLineTimesheetColumns as unknown as Column<FlatServiceLineTSRow>[],
    [],
  );

  // Filter dropdown options — distinct values currently present in the
  // timesheet table, so picking one always yields at least one result.
  const serviceLineFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.serviceLineName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const projectFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.project ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const applicationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.application ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!serviceLineFilter || r.serviceLineName === serviceLineFilter) &&
          (!projectFilter || r.project === projectFilter) &&
          (!applicationFilter || r.application === applicationFilter),
      ),
    [rows, serviceLineFilter, projectFilter, applicationFilter],
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
    (form: Partial<ServiceLineTimesheetRow>) => {
      const slName = String(form.serviceLineName ?? '').trim();

      const myId = editingRow?.id;
      const previousUseInExpenses = editingRow?.useInExpenses ?? false;
      const nextUseInExpenses = form.useInExpenses ?? false;

      const next: FlatServiceLineTSRow[] = myId
        ? rows.map((r) =>
            r.id === myId
              ? {
                  ...r,
                  ...form,
                  id: r.id,
                  serviceLineName: slName,
                  useInExpenses: nextUseInExpenses,
                }
              : r,
          )
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              serviceLineId: form.serviceLineId ?? '',
              serviceLineName: slName,
              project: form.project ?? '',
              application: form.application,
              fromDate: form.fromDate ?? '',
              toDate: form.toDate ?? '',
              activate: form.activate ?? true,
              maxHoursPerDayPerResource: form.maxHoursPerDayPerResource,
              useInExpenses: nextUseInExpenses,
              internalNote: form.internalNote,
            } as FlatServiceLineTSRow,
          ];
      handleSave(next);

      // Fire the mirror hook so the parent can create the expense
      // mirror when useInExpenses just flipped 0→1, or remove it when
      // it just flipped 1→0.
      onTimesheetSave?.({
        row: next.find((r) => r.id === myId) ?? (next[next.length - 1] as FlatServiceLineTSRow),
        previousUseInExpenses,
      });
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose, onTimesheetSave],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const removed = rows.find((r) => r.id === selectedRowId);
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      // If the removed row had useInExpenses === true, fire the
      // delete hook so the parent can drop the mirror expense row.
      if (removed && removed.useInExpenses) {
        onTimesheetDelete?.({ row: removed });
      }
      setSelectedRowId(null);
    } catch {
      // Errors already surface via the parent; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave, onTimesheetDelete]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <>
      <GenericPanel
        config={
          SERVICE_LINE_TIMESHEET_CONFIG as unknown as Parameters<typeof GenericPanel>[0]['config']
        }
        data={filteredRows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={columns as unknown as undefined}
        variant='standard'
        hideHeader={hideHeader}
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        toolbarExtra={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TableFilterField
              label='Service Line'
              value={serviceLineFilter}
              onChange={setServiceLineFilter}
              options={serviceLineFilterOptions}
            />
            <TableFilterField
              label='Project'
              value={projectFilter}
              onChange={setProjectFilter}
              options={projectFilterOptions}
            />
            <TableFilterField
              label='Application'
              value={applicationFilter}
              onChange={setApplicationFilter}
              options={applicationFilterOptions}
            />
          </Box>
        }
      />

      <ServiceLineTimesheetFormDialog
        open={dialogOpen}
        editing={editingRow as ServiceLineTimesheetRow | null}
        existingTimesheetProjects={rows as unknown as ServiceLineTimesheetRow[]}
        serviceLineOptions={serviceLineOptions}
        projectOptions={projectOptions}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        subtitle={SERVICE_LINE_TIMESHEET_CONFIG.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Timesheet Project'
        itemName={selectedRow?.project ?? ''}
      />
    </>
  );
};