import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Link,
  alpha,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable, Column, Loader } from '@serviceops/component';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';

// ── Color presets ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#6366f1',
  '#2563eb',
  '#0284c7',
  '#0f766e',
  '#15803d',
  '#ca8a04',
  '#ea580c',
  '#b91c1c',
  '#db2777',
  '#374151',
];

// ── Default statuses ──────────────────────────────────────────────────────────

const DEFAULT_STATUSES: IConfigStatusLevel[] = [
  {
    id: 'new',
    name: 'new',
    displayName: 'New',
    description: 'Ticket has been created and is awaiting assignment',
    color: '#fff',
    bgColor: '#6366f1',
    sortOrder: 1,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'assigned',
    name: 'assigned',
    displayName: 'Assigned',
    description: 'Ticket has been assigned to an agent or team',
    color: '#fff',
    bgColor: '#2563eb',
    sortOrder: 2,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'in_progress',
    name: 'in_progress',
    displayName: 'In Progress',
    description: 'An agent is actively working on the ticket',
    color: '#fff',
    bgColor: '#0284c7',
    sortOrder: 3,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'on_hold',
    name: 'on_hold',
    displayName: 'On Hold',
    description: 'Work is paused, waiting for customer response or third-party action',
    color: '#fff',
    bgColor: '#ca8a04',
    sortOrder: 4,
    isActive: true,
    slaActive: false,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'resolved',
    name: 'resolved',
    displayName: 'Resolved',
    description: 'Issue has been resolved and awaiting confirmation from the requester',
    color: '#fff',
    bgColor: '#15803d',
    sortOrder: 5,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
  {
    id: 'closed',
    name: 'closed',
    displayName: 'Closed',
    description: 'Ticket has been confirmed as resolved and is now closed',
    color: '#fff',
    bgColor: '#374151',
    sortOrder: 6,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
  {
    id: 'cancelled',
    name: 'cancelled',
    displayName: 'Cancelled',
    description: 'Ticket was cancelled and will not be worked on',
    color: '#fff',
    bgColor: '#b91c1c',
    sortOrder: 7,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
];

// ── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const Section = ({
  icon,
  title,
  subtitle,
  accentColor,
  defaultExpanded = false,
  children,
}: SectionProps) => {
  const { classes } = useStyles();
  return (
    <Accordion defaultExpanded={defaultExpanded} className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>{title}</Typography>
            <Typography className={classes.sectionSubtitle}>{subtitle}</Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

// ── Status form dialog ────────────────────────────────────────────────────────

interface StatusFormDialogProps {
  open: boolean;
  editing: IConfigStatusLevel | null;
  ticketTypeColumns: { key: string; label: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigStatusLevel>) => void;
}

const StatusFormDialog = ({
  open,
  editing,
  ticketTypeColumns,
  onClose,
  onSave,
}: StatusFormDialogProps) => {
  const [form, setForm] = useState<Partial<IConfigStatusLevel>>({});

  const handleEnter = () => {
    setForm(
      editing
        ? {
            displayName: editing.displayName,
            description: editing.description,
            bgColor: editing.bgColor,
            isActive: editing.isActive,
            slaActive: editing.slaActive,
            isFinal: editing.isFinal,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            displayName: '',
            description: '',
            bgColor: '#6366f1',
            isActive: true,
            slaActive: true,
            isFinal: false,
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {editing ? 'Edit Status' : 'Add New Status'}
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        <TextField
          label='Status Name'
          size='small'
          value={form.displayName ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          helperText='e.g. New, In Progress, Resolved'
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

        {/* Color picker */}
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

        {/* Flags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                color='success'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Status Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={form.slaActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, slaActive: e.target.checked }))}
                color='primary'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>SLA Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={form.isFinal ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isFinal: e.target.checked }))}
                color='warning'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Final Status</Typography>}
          />
        </Box>

        {/* Ticket type toggles */}
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
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => onSave(form)}
          disabled={!form.displayName}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {editing ? 'Save Changes' : 'Add Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Statuses section ─────────────────────────────────────────────────────

const Statuses = () => {
  const { classes } = useStyles();
  const { statuses: apiStatuses, saveSection, isLoading } = useConfiguration();
  const { data: ticketTypes = [] } = useGetTicketTypeQuery();

  const activeTicketTypeColumns =
    ticketTypes.length > 0
      ? ticketTypes
          .filter((t) => t.isActive)
          .map((t) => ({ key: t.type, label: t.displayName || t.type }))
      : [
          { key: 'incident', label: 'Incident' },
          { key: 'service_request', label: 'Service Request' },
          { key: 'advisory_request', label: 'Advisory' },
          { key: 'change_request', label: 'Change Request' },
          { key: 'problem_request', label: 'Problem Request' },
          { key: 'task', label: 'Task' },
        ];

  // Local editable state — initialised from API, saved back on every change
  const [statuses, setStatuses] = useState<IConfigStatusLevel[]>(DEFAULT_STATUSES);

  useEffect(() => {
    if (!apiStatuses) return;
    if (apiStatuses.items && apiStatuses.items.length > 0) {
      setStatuses(apiStatuses.items as IConfigStatusLevel[]);
    }
  }, [apiStatuses]);

  const persist = (items: IConfigStatusLevel[]) => {
    saveSection('statuses', { items });
  };

  // ── Toolbar state ────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadDefaults, setLoadDefaults] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<IConfigStatusLevel | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const selectedStatus = statuses.find((s) => s.id === selectedId) ?? null;

  const handleOpenAdd = () => {
    setEditingStatus(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedStatus) {
      setEditingStatus(selectedStatus);
      setDialogOpen(true);
    }
  };

  const handleSave = (data: Partial<IConfigStatusLevel>) => {
    let next: IConfigStatusLevel[];
    if (editingStatus) {
      next = statuses.map((s) => (s.id === editingStatus.id ? { ...s, ...data } : s));
    } else {
      const id =
        (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `status_${Date.now()}`;
      const allEnabled = Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true]));
      const newItem: IConfigStatusLevel = {
        id,
        name: id,
        displayName: data.displayName ?? id,
        description: data.description ?? '',
        color: '#fff',
        bgColor: data.bgColor ?? '#6366f1',
        sortOrder: statuses.length + 1,
        isActive: data.isActive ?? true,
        slaActive: data.slaActive ?? true,
        isFinal: data.isFinal ?? false,
        enabledFor: data.enabledFor ?? allEnabled,
      };
      next = [...statuses, newItem];
    }
    setStatuses(next);
    persist(next);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedId) {
      const next = statuses.filter((s) => s.id !== selectedId);
      setStatuses(next);
      persist(next);
      setSelectedId(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadDefaults(checked);
    if (checked) {
      setStatuses(DEFAULT_STATUSES);
      setSelectedId(null);
      persist(DEFAULT_STATUSES);
    }
  };

  const handleToggleActive = (id: string) => {
    const next = statuses.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setStatuses(next);
    persist(next);
  };

  const handleToggleSlaActive = (id: string) => {
    const next = statuses.map((s) => (s.id === id ? { ...s, slaActive: !s.slaActive } : s));
    setStatuses(next);
    persist(next);
  };

  const handleToggleEnabledFor = (id: string, ticketType: string) => {
    const next = statuses.map((s) =>
      s.id === id
        ? { ...s, enabledFor: { ...s.enabledFor, [ticketType]: !s.enabledFor[ticketType] } }
        : s,
    );
    setStatuses(next);
    persist(next);
  };

  const filteredStatuses = search
    ? statuses.filter((s) =>
        [s.displayName, s.description].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : statuses;

  // ── DataTable columns ────────────────────────────────────────────────────
  const columns: Column<IConfigStatusLevel>[] = [
    {
      id: 'displayName',
      label: 'Ticket Statuses',
      minWidth: 140,
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
          <Chip
            label={row.displayName}
            size='small'
            sx={{
              bgcolor: row.bgColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: 1.5,
            }}
          />
          {row.isFinal && (
            <Chip
              label='Final'
              size='small'
              variant='outlined'
              sx={{ fontSize: '0.65rem', height: 18, borderRadius: 1 }}
            />
          )}
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
    {
      id: 'isActive',
      label: 'Status Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    },
    {
      id: 'slaActive',
      label: 'SLA Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.slaActive}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleSlaActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='primary'
        />
      ),
    },
    // Dynamic per-ticket-type columns
    ...activeTicketTypeColumns.map(
      (t): Column<IConfigStatusLevel> => ({
        id: 'enabledFor' as keyof IConfigStatusLevel,
        label: t.label,
        minWidth: 90,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? true}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleEnabledFor(row.id, t.key);
            }}
            onClick={(e) => e.stopPropagation()}
            color='success'
          />
        ),
      }),
    ),
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Section
        icon={<RadioButtonCheckedIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Ticket Statuses'
        subtitle='Configure lifecycle statuses, SLA tracking, and per-ticket-type availability'
        accentColor='#7c3aed'
        defaultExpanded
      >
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {/* New — always visible when nothing selected */}
            {!selectedId && (
              <Tooltip title='Add a new ticket status'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  New
                </Button>
              </Tooltip>
            )}

            {/* Edit / Delete — visible when a row is selected */}
            {selectedId && (
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
              </>
            )}

            <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

            {/* Load system default values */}
            <FormControlLabel
              labelPlacement='start'
              control={
                <Switch
                  size='small'
                  checked={loadDefaults}
                  onChange={(e) => handleLoadDefaults(e.target.checked)}
                  color='warning'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                  Load system default values
                </Typography>
              }
              sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
            />

            {/* Search */}
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
          </Box>

          {selectedId && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedStatus?.displayName}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* DataTable */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={filteredStatuses}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </Section>

      {/* Add / Edit dialog */}
      <StatusFormDialog
        open={dialogOpen}
        editing={editingStatus}
        ticketTypeColumns={activeTicketTypeColumns}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Status</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete <strong>{selectedStatus?.displayName}</strong>? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Statuses;
