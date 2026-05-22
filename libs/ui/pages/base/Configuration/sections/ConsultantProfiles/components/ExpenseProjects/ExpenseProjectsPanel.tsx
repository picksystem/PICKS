import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  Switch,
  Chip,
  DataTable,
  Column,
  FormControlLabel,
} from '@serviceops/component';
import { InputAdornment, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { IConfigConsultantExpenseProject } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_EP = '#7c3aed';

const EMPTY_EP_FORM = {
  consultantProfileId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxAmountPerDay: 0,
};

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface ExpenseProjectsPanelProps {
  data: IConfigConsultantExpenseProject[];
  onSave: (data: IConfigConsultantExpenseProject[]) => void;
}

const ExpenseProjectsPanel = ({ data, onSave }: ExpenseProjectsPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantExpenseProject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_EP_FORM);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRow) {
      setForm({
        consultantProfileId: editingRow.consultantProfileId,
        project: editingRow.project,
        application: editingRow.application,
        fromDate: editingRow.fromDate,
        toDate: editingRow.toDate,
        activate: editingRow.activate,
        maxAmountPerDay: editingRow.maxAmountPerDay,
      });
    } else {
      setForm({ ...EMPTY_EP_FORM });
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.application?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (!form.project.trim()) return;
    if (editingRow) {
      const updated = data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `ep_${Date.now()}`, ...form } as IConfigConsultantExpenseProject;
      onSave([...data, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(data.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigConsultantExpenseProject>[] = [
    { id: 'project', label: 'Project', minWidth: 150, format: mkCell(true) },
    { id: 'application', label: 'Application', minWidth: 130, format: mkCell() },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Active',
      minWidth: 70,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            onSave(data.map((r) => (r.id === row.id ? { ...r, activate: e.target.checked } : r)));
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxAmountPerDay',
      label: 'Max $/Day',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Chip
          label={`$${Number(v).toFixed(2)}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha(ACCENT_EP, 0.1),
            color: ACCENT_EP,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            bgcolor: alpha(ACCENT_EP, 0.08),
            border: '1px solid',
            borderColor: alpha(ACCENT_EP, 0.25),
            borderRadius: '10px 10px 0 0',
            borderBottom: 'none',
          }}
        >
          <Box sx={{ color: ACCENT_EP, display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_EP }}>
            Expense Projects
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
            {data.length} project{data.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

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
            {!selectedRow ? (
              <Tooltip title='Add new expense project'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{ bgcolor: ACCENT_EP, '&:hover': { bgcolor: alpha(ACCENT_EP, 0.85) } }}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                >
                  New
                </Button>
              </Tooltip>
            ) : (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  sx={{ bgcolor: ACCENT_EP, '&:hover': { bgcolor: alpha(ACCENT_EP, 0.85) } }}
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
                <Box
                  component='span'
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: '1px',
                    height: '20px',
                    bgcolor: alpha(ACCENT_EP, 0.3),
                    mx: 0.75,
                    alignSelf: 'center',
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setSelectedId(null)}
                >
                  Clear
                </Button>
              </>
            )}
            <TextField
              size='small'
              placeholder='Search…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
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
        </Paper>

        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(ACCENT_EP, 0.25),
            borderTop: 'none',
          }}
        >
          <DataTable
            columns={columns}
            data={filtered}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </Box>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AttachMoneyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_EP}
        title='Expense Project'
        submitDisabled={!form.project.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        <TextField
          label='Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
        />
        <TextField
          label='Application'
          size='small'
          fullWidth
          value={form.application}
          onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='From Date'
            type='date'
            size='small'
            fullWidth
            value={form.fromDate}
            onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='To Date'
            type='date'
            size='small'
            fullWidth
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Max Amount Per Day ($)'
          type='number'
          size='small'
          fullWidth
          value={form.maxAmountPerDay}
          onChange={(e) =>
            setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))
          }
          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.activate}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Project'
        itemName={selectedRow?.project}
      />
    </>
  );
};

export { ExpenseProjectsPanel };
