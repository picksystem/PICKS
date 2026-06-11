import { useState, useCallback, useMemo } from 'react';
import { Box, Typography } from '@serviceops/component';
import { FormControlLabel, Switch } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { SimpleLevel } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigFormDialog, ConfigDeleteDialog } from '@serviceops/configdialogs';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
  segmentsToHtml,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

const renderRichTextCell = (v: unknown, maxWidth: number): React.ReactNode => {
  const raw = String(v || '');
  if (!raw) {
    return (
      <Typography
        variant='body2'
        color='text.secondary'
        fontSize='0.78rem'
        sx={{ fontStyle: 'italic' }}
      >
        —
      </Typography>
    );
  }
  const html = segmentsToHtml(parseRichText(raw).segments);
  const plainText = parseRichText(raw)
    .segments.map((s) => s.text)
    .join(' • ');
  return (
    <Box
      title={plainText}
      sx={{
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        color: 'text.secondary',
        lineHeight: 1.5,
        '& b': { fontWeight: 700, color: 'text.primary' },
        '& i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface UrgencySectionProps {
  items: SimpleLevel[];
  onAdd: (data: Partial<SimpleLevel>) => void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => void;
  onDelete: (id: string) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
  activeTicketTypeColumns: { key: string; label: string }[];
  isLoading?: boolean;
}

const URGENCY_CONFIG = {
  title: 'Urgency',
  subtitle: 'Define urgency levels — how time-sensitive a ticket is',
  accent: '#0369a1',
  icon: <SpeedIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Urgency Level',
  fields: [
    { name: 'displayName', label: 'Display Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
  ],
};

const UrgencySection = ({
  items,
  onAdd,
  onEdit,
  onDelete,
  onToggleEnabledFor,
  activeTicketTypeColumns,
  isLoading,
}: UrgencySectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleLevel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SimpleLevel>>({});
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const handleNewClick = useCallback(() => {
    setEditingItem(null);
    setForm({ isActive: true });
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = items.find((i) => i.id === selectedRowId);
    if (selected) {
      setEditingItem(selected);
      setForm({
        displayName: selected.displayName,
        shortDescription: selected.shortDescription ?? '',
        description: selected.description,
        internalNote: selected.internalNote ?? '',
        isActive: selected.isActive,
      });
      setDialogOpen(true);
    }
  }, [items, selectedRowId]);

  const handleDeleteClick = useCallback(() => {
    setDeleteId(selectedRowId);
    setDeleteOpen(true);
  }, [selectedRowId]);

  const handleSubmit = useCallback(async () => {
    try {
      if (editingItem) {
        await onEdit(editingItem.id, form);
        success('Urgency updated successfully');
      } else {
        await onAdd(form);
        success('Urgency added successfully');
      }
    } catch (err) {
      showError('Failed to save urgency level. Please try again.');
      throw err;
    } finally {
      setDialogOpen(false);
      setEditingItem(null);
      setForm({});
    }
  }, [editingItem, form, onEdit, onAdd, success, showError]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (deleteId) {
        await onDelete(deleteId);
        success('Urgency deleted successfully');
        setSelectedRowId(null);
      }
    } catch (err) {
      showError('Failed to delete urgency level. Please try again.');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  }, [deleteId, onDelete, success, showError]);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedRowId(id);
  }, []);

  const customColumns = useMemo(
    () => [
      {
        id: 'displayName',
        label: 'Urgency Values',
        minWidth: 120,
        format: (_v: unknown, row: Record<string, unknown>): React.ReactNode => (
          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{String(row.displayName)}</span>
        ),
      },
      {
        id: 'shortDescription',
        label: 'Short Description',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
      },
      {
        id: 'description',
        label: 'Description',
        minWidth: 240,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 300),
      },
      {
        id: 'internalNote',
        label: 'Internal note',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
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
    ],
    [activeTicketTypeColumns, onToggleEnabledFor],
  );

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={URGENCY_CONFIG}
        data={items as unknown as Record<string, unknown>[]}
        onSave={() => {}}
        variant='plain'
        customColumns={customColumns as unknown as undefined}
        defaultExpanded={false}
        isLoading={isLoading}
        loaderMessage='Loading Urgency levels...'
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
      />

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
          setForm({});
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingItem}
        icon={<SpeedIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#ca8a04'
        title='Urgency Level'
        submitDisabled={!form.displayName}
        submitLabel={editingItem ? 'Save' : 'Submit'}
        maxWidth='sm'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant='body2' color='text.secondary'>
            {editingItem
              ? 'Edit the urgency level details below.'
              : 'Configure the new urgency level.'}
          </Typography>

          <Box>
            <RichTextEditor
              value={parseRichText(form.shortDescription ?? '')}
              onChange={(value) =>
                setForm((f) => ({ ...f, shortDescription: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Short Description'
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
            >
              Brief summary shown in compact views
            </Typography>
          </Box>

          <Box>
            <RichTextEditor
              value={parseRichText(form.description ?? '')}
              onChange={(value) =>
                setForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Description'
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
            >
              Describe when this urgency level should be used
            </Typography>
          </Box>

          <Box>
            <RichTextEditor
              value={parseRichText(form.internalNote ?? '')}
              onChange={(value) =>
                setForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Internal note'
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
            >
              Internal note for this urgency level (not visible to end users)
            </Typography>
          </Box>

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
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName='Urgency'
        itemName={items.find((i) => i.id === deleteId)?.displayName}
      />
    </div>
  );
};

export { UrgencySection };
