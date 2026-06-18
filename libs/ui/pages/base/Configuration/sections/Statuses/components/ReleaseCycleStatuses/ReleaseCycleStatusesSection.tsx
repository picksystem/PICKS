import { useState, useEffect, useCallback, useRef } from 'react';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { RELEASE_CYCLE_STATUSES_CONFIG, releaseStatusColumns } from '../../Statuses.config';
import StatusFormDialog from '@serviceops/pages/base/Configuration/dialogs/StatusFormDialog';

interface ReleaseCycleStatusesSectionProps {
  activeTicketTypeColumns: Array<{ key: string; label: string }>;
}

const ReleaseCycleStatusesSection = ({
  activeTicketTypeColumns,
}: ReleaseCycleStatusesSectionProps) => {
  const { classes } = useStyles();
  const { releaseStatuses: apiReleaseStatuses, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigStatusLevel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IConfigStatusLevel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const lastSyncedIdsRef = useRef<Set<string>>(new Set());

  // Sync local rows from API. We track which ids we've already seen so that
  // a stale refetch (returning fewer items than the local state has) doesn't
  // clobber an optimistic update. This handles the race where the PATCH
  // invalidates the tag before the DB has committed the new item.
  useEffect(() => {
    if (!apiReleaseStatuses) return;
    const apiIds = new Set((apiReleaseStatuses.items ?? []).map((r) => r.id));
    const everyKnownPresent = Array.from(lastSyncedIdsRef.current).every((id) => apiIds.has(id));
    if (everyKnownPresent || lastSyncedIdsRef.current.size === 0) {
      setRows((apiReleaseStatuses.items ?? []) as IConfigStatusLevel[]);
      lastSyncedIdsRef.current = apiIds;
    }
  }, [apiReleaseStatuses]);

  const handleNewClick = useCallback(() => {
    setEditingItem(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingItem(selected);
      setDialogOpen(true);
    }
  }, [rows, selectedRowId]);

  const handleDeleteClick = useCallback(() => {
    setDeleteId(selectedRowId);
    setDeleteOpen(true);
  }, [selectedRowId]);

  const handleSave = useCallback(
    async (data: Partial<IConfigStatusLevel>) => {
      let next: IConfigStatusLevel[];
      if (editingItem) {
        next = rows.map((r) =>
          r.id === editingItem.id ? ({ ...r, ...data } as IConfigStatusLevel) : r,
        );
      } else {
        const id =
          (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') ||
          `release_status_${Date.now()}`;
        const newItem: IConfigStatusLevel = {
          id,
          name: data.displayName ?? id,
          displayName: data.displayName ?? '',
          shortDescription: data.shortDescription ?? '',
          description: data.description ?? '',
          color: data.color ?? '#fff',
          bgColor: data.bgColor ?? '#2563eb',
          sortOrder: data.sortOrder ?? rows.length + 1,
          isActive: data.isActive ?? true,
          slaActive: data.slaActive ?? true,
          isFinal: data.isFinal ?? false,
          enabledFor: data.enabledFor ?? {},
          internalNote: data.internalNote ?? '',
        };
        // Add the new item to the TOP of the list so it's immediately visible
        // in the first page of the table (paginatedData shows the first N rows).
        next = [newItem, ...rows];
      }
      setRows(next);
      // Mark the new id as known so the post-PATCH refetch doesn't clobber
      // our optimistic update.
      lastSyncedIdsRef.current = new Set(next.map((r) => r.id));
      try {
        await saveSection('releaseStatuses', { items: next });
      } catch {
        return;
      }
      setDialogOpen(false);
      setEditingItem(null);
    },
    [editingItem, rows, saveSection],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;
    const next = rows.filter((r) => r.id !== deleteId);
    setRows(next);
    lastSyncedIdsRef.current = new Set(next.map((r) => r.id));
    try {
      await saveSection('releaseStatuses', { items: next });
    } catch {
      return;
    }
    setSelectedRowId(null);
    setDeleteOpen(false);
    setDeleteId(null);
  }, [deleteId, rows, saveSection]);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedRowId(id);
  }, []);

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={RELEASE_CYCLE_STATUSES_CONFIG}
        data={rows}
        onSave={(next) => {
          setRows(next as IConfigStatusLevel[]);
          lastSyncedIdsRef.current = new Set((next as IConfigStatusLevel[]).map((r) => r.id));
          saveSection('releaseStatuses', { items: next as IConfigStatusLevel[] });
        }}
        customColumns={releaseStatusColumns(activeTicketTypeColumns) as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <StatusFormDialog
        open={dialogOpen}
        editing={editingItem}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        ticketTypeColumns={activeTicketTypeColumns}
        existingStatuses={rows}
        displayNameLabel='Release cycle status'
        subtitle={RELEASE_CYCLE_STATUSES_CONFIG.subtitle}
        title='Release Cycle Status'
        hideFinalStatus
        successMessage={{
          add: 'Release status added successfully',
          edit: 'Release status updated successfully',
        }}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName='Release Status'
        itemName={rows.find((r) => r.id === deleteId)?.displayName}
      />
    </div>
  );
};

export { ReleaseCycleStatusesSection };
