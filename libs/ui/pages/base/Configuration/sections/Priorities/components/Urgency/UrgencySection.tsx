import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  Tooltip,
  Switch,
  DataTable,
  Column,
} from '@serviceops/component';
import { InputAdornment, FormControlLabel, Divider, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { SimpleLevel } from '../../util';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const PRESET_COLORS = [
  '#b91c1c',
  '#ea580c',
  '#ca8a04',
  '#2563eb',
  '#0f766e',
  '#7c3aed',
  '#db2777',
  '#15803d',
  '#1d4ed8',
  '#374151',
];

interface SimpleLevelFormDialogProps {
  open: boolean;
  noun: string;
  accent: string;
  icon: React.ReactNode;
  editing: SimpleLevel | null;
  onClose: () => void;
  onSave: (data: Partial<SimpleLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

const SimpleLevelFormDialog = ({
  open,
  noun,
  accent,
  icon,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
}: SimpleLevelFormDialogProps) => {
  const [form, setForm] = useState<Partial<SimpleLevel>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            displayName: editing.displayName,
            description: editing.description,
            bgColor: editing.bgColor,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            displayName: '',
            description: '',
            bgColor: '#2563eb',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  }, [open, editing, ticketTypeColumns]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      isEdit={!!editing}
      icon={icon}
      accent={accent}
      title={noun}
      submitDisabled={!form.displayName}
      submitLabel={editing ? 'Save Changes' : `Add ${noun}`}
      maxWidth='sm'
    >
      <TextField
        label={`${noun} Display Name`}
        size='small'
        value={form.displayName ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
        helperText='e.g. 1 - High, 2 - Medium, 3 - Low'
        required
      />
      <TextField
        label='Description'
        size='small'
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        multiline
        rows={2}
      />
      <Box>
        <Typography
          variant='caption'
          fontWeight={700}
          color='text.secondary'
          sx={{ mb: 0.75, display: 'block' }}
        >
          Badge Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => setForm((f) => ({ ...f, bgColor: c }))}
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: c,
                cursor: 'pointer',
                border: form.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                boxShadow: form.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                transition: 'all 0.15s',
                '&:hover': { transform: 'scale(1.18)' },
              }}
            />
          ))}
          <TextField
            size='small'
            value={form.bgColor ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
            sx={{ ml: 0.5 }}
          />
          {form.bgColor && (
            <Chip
              label={form.displayName || 'Preview'}
              size='small'
              sx={{ bgcolor: form.bgColor, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
        </Box>
      </Box>
      <Box>
        <Typography
          variant='caption'
          fontWeight={700}
          color='text.secondary'
          sx={{ mb: 1, display: 'block' }}
        >
          Enable for Ticket Types
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {ticketTypeColumns.map((t) => (
            <FormControlLabel
              key={t.key}
              labelPlacement='end'
              control={
                <Switch
                  size='small'
                  checked={form.enabledFor?.[t.key] ?? true}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      enabledFor: { ...(f.enabledFor ?? {}), [t.key]: e.target.checked },
                    }))
                  }
                  color='success'
                />
              }
              label={<Typography sx={{ fontSize: '0.8rem' }}>{t.label}</Typography>}
              sx={{ mr: 2 }}
            />
          ))}
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

interface UrgencySectionProps {
  items: SimpleLevel[];
  onAdd: (data: Partial<SimpleLevel>) => void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => void;
  onDelete: (id: string) => void;
  onReset: (defaults: SimpleLevel[]) => void;
  onToggleActive?: (id: string) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
  defaultItems: SimpleLevel[];
  activeTicketTypeColumns: { key: string; label: string }[];
}

const UrgencySection = ({
  items,
  onAdd,
  onEdit,
  onDelete,
  onReset,
  onToggleEnabledFor,
  defaultItems,
  activeTicketTypeColumns,
}: UrgencySectionProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadDefaults, setLoadDefaults] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleLevel | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setDialogOpen(true);
    }
  };

  const handleSave = (data: Partial<SimpleLevel>) => {
    if (editingItem) {
      onEdit(editingItem.id, data);
    } else {
      onAdd(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedId) {
      onDelete(selectedId);
      setSelectedId(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadDefaults(checked);
    if (checked) {
      onReset(defaultItems);
      setSelectedId(null);
    }
  };

  const columns: Column<SimpleLevel>[] = [
    {
      id: 'displayName',
      label: 'Urgency Values',
      minWidth: 120,
      format: (_v, row): React.ReactNode => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: row.bgColor,
              flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.12)',
            }}
          />
          <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
            {row.displayName}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    ...activeTicketTypeColumns.map(
      (t): Column<SimpleLevel> => ({
        id: 'enabledFor' as keyof SimpleLevel,
        label: t.label,
        minWidth: 100,
        align: 'center',
        format: (_v, row): React.ReactNode => (
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
      }),
    ),
  ];

  const filteredItems = search
    ? items.filter((i) =>
        [i.displayName, i.description].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : items;

  return (
    <>
      <Paper variant='outlined' className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedId ? (
            <>
              <Tooltip title='Add a new Urgency'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Add New Urgency
                </Button>
              </Tooltip>
              <TextField
                size='small'
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={classes.tableSearchField}
                sx={{ ml: { xs: 0, sm: 'auto' } }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </>
          ) : (
            <>
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={handleOpenEdit}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Edit
              </Button>
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDeleteOpen(true)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Delete
              </Button>
              <Box component='span' sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: '20px', bgcolor: 'divider', mx: 0.75, alignSelf: 'center' }} />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            </>
          )}
        </Box>
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredItems}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>

      <SimpleLevelFormDialog
        open={dialogOpen}
        noun='Urgency'
        accent='#ca8a04'
        icon={<SpeedIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        editing={editingItem}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        ticketTypeColumns={activeTicketTypeColumns}
      />

      <ConfigDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Urgency'
        itemName={items.find((i) => i.id === selectedId)?.displayName}
      />
    </>
  );
};

export { UrgencySection, SimpleLevelFormDialog };
