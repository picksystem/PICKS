import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  Link,
  TextField,
  InputAdornment,
  Divider,
  alpha,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';

// ── ActiveChip ─────────────────────────────────────────────────────────────────

export const ActiveChip = (v: unknown): React.ReactNode => {
  const on = Boolean(v);
  return (
    <Chip
      label={on ? 'Active' : 'Inactive'}
      size='small'
      sx={{
        height: 20,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: on ? alpha('#059669', 0.12) : alpha('#9ca3af', 0.12),
        color: on ? '#059669' : '#6b7280',
      }}
    />
  );
};

// ── AssocRowBase ───────────────────────────────────────────────────────────────
// Normalised shape used by AssocPanel internally. The typed API interfaces
// (e.g. IConfigTimesheetServiceLineEntry) are converted to/from this via
// toAssocRows / fromAssocRows.

export interface AssocRowBase {
  id: string;
  project: string;
  assocValue: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxHoursPerDayPerResource: number;
}

// ── AssocForm ──────────────────────────────────────────────────────────────────

export interface AssocForm {
  project: string;
  assocField: string;
  fromDate: string;
  toDate: string;
  activate: boolean;
  maxHoursPerDayPerResource: number;
}

export const EMPTY_ASSOC_FORM: AssocForm = {
  project: '',
  assocField: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};

// ── AssocFormFields ────────────────────────────────────────────────────────────

export const AssocFormFields = ({
  form,
  setForm,
  assocLabel,
}: {
  form: AssocForm;
  setForm: React.Dispatch<React.SetStateAction<AssocForm>>;
  assocLabel: string;
}) => (
  <>
    <TextField
      label='Project'
      size='small'
      fullWidth
      required
      value={form.project}
      onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
      placeholder='Enter project name'
    />
    <TextField
      label={assocLabel}
      size='small'
      fullWidth
      required
      value={form.assocField}
      onChange={(e) => setForm((f) => ({ ...f, assocField: e.target.value }))}
      placeholder={`Enter ${assocLabel.toLowerCase()} name`}
    />
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <TextField
        label='From Date'
        type='date'
        size='small'
        sx={{ flex: 1 }}
        value={form.fromDate}
        onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        label='To Date'
        type='date'
        size='small'
        sx={{ flex: 1 }}
        value={form.toDate}
        onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      <FormControlLabel
        control={
          <Switch
            size='small'
            checked={form.activate}
            onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
          />
        }
        label={
          <Typography variant='body2' fontSize='0.82rem'>
            Activate
          </Typography>
        }
        sx={{ flex: 1, m: 0 }}
      />
      <TextField
        label='Max Hours / Day / Resource'
        type='number'
        size='small'
        sx={{ flex: 1 }}
        value={form.maxHoursPerDayPerResource}
        onChange={(e) =>
          setForm((f) => ({ ...f, maxHoursPerDayPerResource: Number(e.target.value) }))
        }
        slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
      />
    </Box>
  </>
);

// ── PanelHeader ────────────────────────────────────────────────────────────────

export const PanelHeader = ({
  accent,
  icon,
  title,
  onBack,
}: {
  accent: string;
  icon: React.ReactNode;
  title: string;
  onBack: () => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      bgcolor: alpha(accent, 0.08),
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderRadius: '10px 10px 0 0',
      borderBottom: 'none',
    }}
  >
    <Button
      size='small'
      variant='text'
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{
        textTransform: 'none',
        color: accent,
        fontWeight: 600,
        minWidth: 0,
        px: 1,
        py: 0.25,
        '&:hover': { bgcolor: alpha(accent, 0.1) },
      }}
    >
      Back
    </Button>
    <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(accent, 0.3) }} />
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
  </Box>
);

// ── PanelToolbar ───────────────────────────────────────────────────────────────

export const PanelToolbar = ({
  accent,
  selectedLabel,
  onNew,
  onEdit,
  onDelete,
  search,
  onSearch,
  onClear,
}: {
  accent: string;
  selectedLabel: string | null;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  search: string;
  onSearch: (v: string) => void;
  onClear: () => void;
}) => {
  const { classes } = useStyles();
  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        px: 1.5,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box className={classes.toolbarButtons}>
        {!selectedLabel ? (
          <Tooltip title='Add new row'>
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: accent,
                '&:hover': { bgcolor: alpha(accent, 0.85) },
              }}
              onClick={onNew}
            >
              New
            </Button>
          </Tooltip>
        ) : (
          <Button
            size='small'
            variant='contained'
            startIcon={<EditIcon />}
            sx={{
              textTransform: 'none',
              bgcolor: accent,
              '&:hover': { bgcolor: alpha(accent, 0.85) },
            }}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {selectedLabel && (
          <Button
            size='small'
            variant='outlined'
            color='error'
            startIcon={<DeleteIcon />}
            sx={{ textTransform: 'none' }}
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
        <TextField
          size='small'
          placeholder='Search…'
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ ml: { xs: 0, sm: 'auto' }, width: 200 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon sx={{ fontSize: '1rem' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      {selectedLabel && (
        <Typography variant='caption' color='text.secondary'>
          Selected: <strong>{selectedLabel}</strong>&nbsp;·&nbsp;
          <Link component='button' variant='caption' onClick={onClear}>
            Clear
          </Link>
        </Typography>
      )}
    </Paper>
  );
};

// ── PanelTable ─────────────────────────────────────────────────────────────────

export const PanelTable = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
  <Paper
    elevation={1}
    sx={{
      borderRadius: '0 0 10px 10px',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderTop: 'none',
    }}
  >
    {children}
  </Paper>
);

// ── assocColumns ───────────────────────────────────────────────────────────────
// Columns for the association DataTable. Uses 'assocValue' as the data key
// (normalised by toAssocRows) and the caller-supplied assocLabel as the header.

export const assocColumns = (assocLabel: string): Column<AssocRowBase>[] => [
  {
    id: 'project',
    label: 'Project',
    minWidth: 160,
    format: (v): React.ReactNode => (
      <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
        {String(v || '—')}
      </Typography>
    ),
  },
  {
    id: 'assocValue',
    label: assocLabel,
    minWidth: 160,
    format: (v): React.ReactNode => (
      <Typography variant='body2' fontSize='0.8rem'>
        {String(v || '—')}
      </Typography>
    ),
  },
  {
    id: 'fromDate',
    label: 'From Date',
    minWidth: 110,
    format: (v): React.ReactNode => (
      <Typography variant='body2' fontSize='0.8rem'>
        {String(v || '—')}
      </Typography>
    ),
  },
  {
    id: 'toDate',
    label: 'To Date',
    minWidth: 110,
    format: (v): React.ReactNode => (
      <Typography variant='body2' fontSize='0.8rem'>
        {String(v || '—')}
      </Typography>
    ),
  },
  { id: 'activate', label: 'Activate', minWidth: 90, format: ActiveChip },
  {
    id: 'maxHoursPerDayPerResource',
    label: 'Max Hours / Day / Resource',
    minWidth: 160,
    format: (v): React.ReactNode => (
      <Typography variant='body2' fontSize='0.8rem'>
        {String(v ?? '—')}
      </Typography>
    ),
  },
];

// ── Row conversion helpers ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toAssocRows = (rows: any[], assocKey: string): AssocRowBase[] =>
  rows.map((r) => ({
    id: r.id,
    project: r.project,
    assocValue: String(r[assocKey] ?? ''),
    fromDate: r.fromDate ?? '',
    toDate: r.toDate ?? '',
    activate: Boolean(r.activate),
    maxHoursPerDayPerResource: Number(r.maxHoursPerDayPerResource ?? 8),
  }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromAssocRows = (rows: AssocRowBase[], assocKey: string): any[] =>
  rows.map((r) => ({
    id: r.id,
    project: r.project,
    [assocKey]: r.assocValue,
    fromDate: r.fromDate,
    toDate: r.toDate,
    activate: r.activate,
    maxHoursPerDayPerResource: r.maxHoursPerDayPerResource,
  }));

// ── AssocPanel ─────────────────────────────────────────────────────────────────
// Generic sub-panel that replaces the per-type ServiceLine / Application /
// Queue / Resource panel components. Callers supply the icon component type,
// accent colour, labels, and save callback; internal CRUD state is self-contained.

export interface AssocPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  accent: string;
  title: string;
  entityName: string;
  assocLabel: string;
  idPrefix: string;
  rows: AssocRowBase[];
  onSave: (next: AssocRowBase[]) => void;
  onBack: () => void;
}

export const AssocPanel = ({
  Icon,
  accent,
  title,
  entityName,
  assocLabel,
  idPrefix,
  rows: propRows,
  onSave,
  onBack,
}: AssocPanelProps) => {
  const [rows, setRows] = useState<AssocRowBase[]>(propRows);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AssocRowBase | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<AssocForm>(EMPTY_ASSOC_FORM);

  useEffect(() => {
    setRows(propRows);
  }, [propRows]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            project: editingRow.project,
            assocField: editingRow.assocValue,
            fromDate: editingRow.fromDate,
            toDate: editingRow.toDate,
            activate: editingRow.activate,
            maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
          }
        : EMPTY_ASSOC_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.assocValue.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: AssocRowBase[]) => {
    setRows(next);
    onSave(next);
  };

  const handleSubmit = () => {
    if (!form.project.trim() || !form.assocField.trim()) return;
    const rowData = {
      project: form.project,
      assocValue: form.assocField,
      fromDate: form.fromDate,
      toDate: form.toDate,
      activate: form.activate,
      maxHoursPerDayPerResource: form.maxHoursPerDayPerResource,
    };
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...rowData } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: AssocRowBase = { id: `${idPrefix}_${Date.now()}`, ...rowData };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader accent={accent} icon={<Icon fontSize='small' />} title={title} onBack={onBack} />
      <PanelToolbar
        accent={accent}
        selectedLabel={selectedRow ? `${selectedRow.project} / ${selectedRow.assocValue}` : null}
        onNew={() => {
          setEditingRow(null);
          setDialogOpen(true);
        }}
        onEdit={() => {
          setEditingRow(selectedRow);
          setDialogOpen(true);
        }}
        onDelete={() => setDeleteOpen(true)}
        search={search}
        onSearch={setSearch}
        onClear={() => setSelectedId(null)}
      />
      <PanelTable accent={accent}>
        <DataTable
          columns={assocColumns(assocLabel)}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
          activeRowKey={selectedId ?? undefined}
        />
      </PanelTable>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<Icon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={accent}
        title={entityName}
        subtitle={`Associate a project with a ${assocLabel.toLowerCase()}`}
        submitDisabled={!form.project.trim() || !form.assocField.trim()}
        maxWidth='sm'
      >
        <AssocFormFields form={form} setForm={setForm} assocLabel={assocLabel} />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={entityName}
        itemName={selectedRow ? `${selectedRow.project} / ${selectedRow.assocValue}` : undefined}
      />
    </Box>
  );
};
