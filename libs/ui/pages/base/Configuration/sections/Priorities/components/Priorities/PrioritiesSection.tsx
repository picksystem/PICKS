import { useState, useCallback } from 'react';
import { Switch } from '@mui/material';
import { PriorityLevel } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
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
  setSelectedPriorityId,
  setSelectedPriority,
  setConfirmDeleteOpen,
  onToggleEnabledFor,
}: PrioritiesSectionProps) => {
  const { classes } = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityLevel | null>(null);

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

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={PRIORITY_TABLE_CONFIG}
        data={priorities}
        onSave={handleSave}
        variant='plain'
        customColumns={customColumns as never}
      />
      <PriorityFormDialog
        open={dialogOpen}
        editing={editingPriority}
        onClose={() => setDialogOpen(false)}
        onSave={handleSavePriority}
        ticketTypeColumns={activeTicketTypeColumns}
      />
    </div>
  );
};

export { PrioritiesSection };
