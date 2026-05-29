import { useState, useCallback } from 'react';
import { Switch } from '@mui/material';
import { PriorityLevel } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { ConfigDeleteDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import PriorityFormDialog from '@serviceops/pages/base/Configuration/dialogs/PriorityFormDialog/PriorityFormDialog';
import { PRIORITY_TABLE_CONFIG } from '../shared/PrioritiesPanelConfig';

interface PrioritiesSectionProps {
  priorities: PriorityLevel[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityLevel[]>>;
  onPersist: (priorities: PriorityLevel[]) => void;
  activeTicketTypeColumns: { key: string; label: string }[];
  selectedPriorityId: string | null;
  setSelectedPriorityId: (id: string | null) => void;
  setSelectedPriority: (priority: PriorityLevel | null) => void;
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
}

const PrioritiesSection = ({
  priorities,
  setPriorities,
  onPersist,
  activeTicketTypeColumns,
  selectedPriorityId,
  setSelectedPriorityId,
  setSelectedPriority,
  setConfirmDeleteOpen,
  onToggleEnabledFor,
}: PrioritiesSectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityLevel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = useCallback(
    (data: PriorityLevel[]) => {
      setPriorities(data);
      onPersist(data);
    },
    [setPriorities, onPersist],
  );

  const handleSavePriority = useCallback(
    (data: Partial<PriorityLevel>) => {
      let next: PriorityLevel[];
      if (editingPriority) {
        next = priorities.map((p) => (p.id === editingPriority.id ? { ...p, ...data } : p));
      } else {
        const id =
          (data.name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `priority_${Date.now()}`;
        const newItem: PriorityLevel = {
          id,
          name: data.name ?? id,
          description: data.description ?? '',
          color: '#fff',
          bgColor: data.bgColor ?? '#2563eb',
          sortOrder: priorities.length + 1,
          enabledFor:
            data.enabledFor ??
            Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
        };
        next = [...priorities, newItem];
      }
      handleSave(next);
      setDialogOpen(false);
      setEditingPriority(null);
    },
    [editingPriority, priorities, activeTicketTypeColumns, handleSave],
  );

  const handleNewClick = useCallback(() => {
    setEditingPriority(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = priorities.find((p) => p.id === selectedPriorityId);
    if (selected) {
      setEditingPriority(selected);
      setDialogOpen(true);
    }
  }, [priorities, selectedPriorityId]);

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPriorityId) return;
    try {
      const next = priorities.filter((p) => p.id !== selectedPriorityId);
      handleSave(next);
      success('Priority deleted successfully');
      setSelectedPriorityId(null);
      setSelectedPriority(null);
    } catch (err) {
      showError('Failed to delete priority. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [
    selectedPriorityId,
    priorities,
    handleSave,
    success,
    showError,
    setSelectedPriorityId,
    setSelectedPriority,
  ]);

  const customColumns = [
    {
      id: 'name',
      label: 'Priority Name',
      minWidth: 130,
      format: (_v: unknown, row: Record<string, unknown>): React.ReactNode => (
        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{String(row.name)}</span>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 300,
      format: (v: unknown): React.ReactNode => (
        <span style={{ color: 'text.secondary', fontSize: '0.78rem' }}>{String(v || '—')}</span>
      ),
    },
    ...activeTicketTypeColumns.map((t) => ({
      id: `enabledFor_${t.key}`,
      label: t.label,
      minWidth: 100,
      align: 'center' as const,
      format: (_v: unknown, row: PriorityLevel): React.ReactNode => (
        <Switch
          size='small'
          checked={row.enabledFor[t.key] ?? false}
          onChange={(e) => {
            e.stopPropagation();
            onToggleEnabledFor(row.id, t.key);
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    })),
  ];

  // Use GenericPanel without dialog for table display only, with custom toolbar
  const handleTableSave = useCallback(
    (data: PriorityLevel[]) => {
      // This is called for delete operations from GenericPanel
      setPriorities(data);
      onPersist(data);
    },
    [setPriorities, onPersist],
  );

  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={PRIORITY_TABLE_CONFIG}
        data={priorities}
        onSave={handleTableSave}
        variant='plain'
        customColumns={customColumns as never}
        enableNewButton={false}
        enableEditButton={false}
        enableDeleteButton={false}
        selectedRowId={selectedPriorityId}
        onRowSelect={(id) => {
          setSelectedPriorityId(id);
          setSelectedPriority(priorities.find((p) => p.id === id) ?? null);
        }}
      />

      {/* Custom toolbar for selected row */}
      {selectedPriority && (
        <div className={classes.selectedRowToolbar}>
          <button className={classes.editButton} onClick={handleEditClick}>
            Edit
          </button>
          <button className={classes.deleteButton} onClick={handleDeleteClick}>
            Delete
          </button>
          <button
            className={classes.clearButton}
            onClick={() => {
              setSelectedPriorityId(null);
              setSelectedPriority(null);
            }}
          >
            Clear
          </button>
        </div>
      )}

      <PriorityFormDialog
        open={dialogOpen}
        editing={editingPriority}
        onClose={() => {
          setDialogOpen(false);
          setEditingPriority(null);
        }}
        onSave={handleSavePriority}
        ticketTypeColumns={activeTicketTypeColumns}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Priority'
        itemName={selectedPriority?.name ?? ''}
      />
    </div>
  );
};

export { PrioritiesSection };
