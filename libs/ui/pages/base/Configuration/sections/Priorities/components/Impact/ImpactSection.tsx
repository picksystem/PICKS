import { useState, useCallback } from 'react';
import { Box, Typography } from '@serviceops/component';
import { FormControlLabel, Switch } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { SimpleLevel } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

interface ImpactSectionProps {
  items: SimpleLevel[];
  onAdd: (data: Partial<SimpleLevel>) => void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => void;
  onDelete: (id: string) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
  activeTicketTypeColumns: { key: string; label: string }[];
  isLoading?: boolean;
}

const IMPACT_CONFIG = {
  title: 'Impact',
  subtitle: 'Define impact levels — how broadly a ticket affects the business',
  accent: '#0369a1',
  icon: <WhatshotIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Impact Level',
  fields: [
    { name: 'displayName', label: 'Display Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
  ],
};

const ImpactSection = ({
  items,
  onAdd,
  onEdit,
  onDelete,
  onToggleEnabledFor,
  activeTicketTypeColumns,
  isLoading,
}: ImpactSectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleLevel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SimpleLevel>>({});

  const handleSave = useCallback(
    async (data: SimpleLevel[]) => {
      try {
        if (editingItem) {
          await onEdit(
            editingItem.id,
            data.find((i) => i.id === editingItem.id) ?? data[data.length - 1],
          );
          success('Impact level updated successfully');
        } else {
          await onAdd(data[data.length - 1]);
          success('Impact level added successfully');
        }
      } catch (err) {
        showError('Failed to save impact level. Please try again.');
        throw err;
      }
    },
    [editingItem, onAdd, onEdit, success, showError],
  );

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (deleteId) {
        await onDelete(deleteId);
        success('Impact level deleted successfully');
      }
    } catch (err) {
      showError('Failed to delete impact level. Please try again.');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  }, [deleteId, onDelete, success, showError]);

  const customColumns = [
    {
      id: 'displayName',
      label: 'Impact Values',
      minWidth: 120,
      format: (_v: unknown, row: SimpleLevel): React.ReactNode => (
        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{row.displayName}</span>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 300,
      format: (...args: any) => {
        const v = args[0];
        return (
          <span style={{ color: 'text.secondary', fontSize: '0.78rem' }}>{String(v || '—')}</span>
        );
      },
    },
    ...activeTicketTypeColumns.map((t) => ({
      id: `enabledFor_${t.key}`,
      label: t.label,
      minWidth: 100,
      align: 'center' as const,
      format: (_v: unknown, row: SimpleLevel): React.ReactNode => (
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
        config={IMPACT_CONFIG}
        data={items as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        variant='plain'
        customColumns={customColumns as never}
        defaultExpanded={false}
        isLoading={isLoading}
        loaderMessage='Loading Impact levels...'
      />

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async () => {
          try {
            if (editingItem) {
              await onEdit(editingItem.id, form);
              success('Impact level updated successfully');
            } else {
              await onAdd(form);
              success('Impact level added successfully');
            }
          } catch (err) {
            showError('Failed to save impact level. Please try again.');
          } finally {
            setDialogOpen(false);
          }
        }}
        isEdit={!!editingItem}
        icon={<WhatshotIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#b91c1c'
        title='Impact Level'
        submitDisabled={!form.displayName}
        submitLabel={editingItem ? 'Save' : 'Submit'}
        maxWidth='sm'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant='body2' color='text.secondary'>
            {editingItem
              ? 'Edit the impact level details below.'
              : 'Configure the new impact level.'}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                color='success'
              />
            }
            label={<Typography sx={{ fontSize: '0.85rem' }}>Active</Typography>}
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Impact'
        itemName={items.find((i) => i.id === deleteId)?.displayName}
      />
    </div>
  );
};

export { ImpactSection };
