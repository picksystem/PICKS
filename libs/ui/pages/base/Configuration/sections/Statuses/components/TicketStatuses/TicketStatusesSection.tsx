import { useState, useEffect, useCallback, useRef } from 'react';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { TICKET_STATUSES_CONFIG, ticketStatusColumns } from '../../Statuses.config';
import StatusFormDialog from '@serviceops/pages/base/Configuration/dialogs/StatusFormDialog';

interface TicketStatusesSectionProps {
  activeTicketTypeColumns: Array<{ key: string; label: string }>;
}

const TicketStatusesSection = ({ activeTicketTypeColumns }: TicketStatusesSectionProps) => {
  const { classes } = useStyles();
  const { statuses: apiStatuses, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigStatusLevel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IConfigStatusLevel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const lastSyncedIdsRef = useRef<Set<string>>(new Set());

  // Sync local rows from API, but never clobber an optimistic update with a
  // stale refetch that doesn't yet contain the just-added item.
  useEffect(() => {
    if (!apiStatuses) return;
    const apiIds = new Set((apiStatuses.items ?? []).map((r) => r.id));
    const everyKnownPresent = Array.from(lastSyncedIdsRef.current).every((id) => apiIds.has(id));
    if (everyKnownPresent || lastSyncedIdsRef.current.size === 0) {
      setRows((apiStatuses.items ?? []) as IConfigStatusLevel[]);
      lastSyncedIdsRef.current = apiIds;
    }
  }, [apiStatuses]);

  const handleUpdateRow = useCallback(
    (id: string, patch: Partial<IConfigStatusLevel>) => {
      setRows((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
        saveSection('statuses', { items: next });
        return next;
      });
    },
    [saveSection],
  );

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
          `status_${Date.now()}`;
        const newItem: IConfigStatusLevel = {
          id,
          name: data.displayName ?? id,
          displayName: data.displayName ?? '',
          shortDescription: data.shortDescription ?? '',
          description: data.description ?? '',
          color: data.color ?? '#fff',
          bgColor: data.bgColor ?? '',
          sortOrder: data.sortOrder ?? rows.length + 1,
          isActive: data.isActive ?? true,
          slaActive: data.slaActive ?? true,
          isFinal: data.isFinal ?? false,
          enabledFor: data.enabledFor ?? {},
          internalNote: data.internalNote ?? '',
        };
        // Add the new item to the TOP of the list so it's immediately visible
        // in the first page of the table.
        next = [newItem, ...rows];
      }
      setRows(next);
      lastSyncedIdsRef.current = new Set(next.map((r) => r.id));
      try {
        await saveSection('statuses', { items: next });
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
      await saveSection('statuses', { items: next });
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
        config={TICKET_STATUSES_CONFIG}
        data={rows}
        onSave={(next) => {
          setRows(next as IConfigStatusLevel[]);
          lastSyncedIdsRef.current = new Set((next as IConfigStatusLevel[]).map((r) => r.id));
          saveSection('statuses', { items: next as IConfigStatusLevel[] });
        }}
        customColumns={
          ticketStatusColumns(activeTicketTypeColumns, handleUpdateRow) as unknown as undefined
        }
        variant='plain'
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
        subtitle={TICKET_STATUSES_CONFIG.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName='Status'
        itemName={rows.find((r) => r.id === deleteId)?.displayName}
      />
    </div>
  );
};

export { TicketStatusesSection };
