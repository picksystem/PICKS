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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { IConfigConsultantTimesheetProject } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_w = '#0369a1';

const EMPTY_TP_FORM = {
  consultantProfileId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface TimesheetProjectsPanelProps {
  data: IConfigConsultantTimesheetProject[];
  onSave: (data: IConfigConsultantTimesheetProject[]) => void;
}

const TimesheetProjectsPanel = ({ data, onSave }: TimesheetProjectsPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantTimesheetProject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_TP_FORM);

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
        maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
      });
    } else {
      setForm({ ...EMPTY_TP_FORM });
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
      const n = {
        id: `tp_${Date.now()}`,
        consultantName: '',
        ...form,
      } as IConfigConsultantTimesheetProject;
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

  const columns: Column<IConfigConsultantTimesheetProject>[] = [
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
      id: 'maxHoursPerDayPerResource',
      label: 'Max Hrs/Day',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Chip
          label={`${v}h`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
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
            bgcolor: alpha('#2d5ebb', 0.08),
            border: '1px solid',
            borderColor: alpha('#2d5ebb', 0.25),
            borderRadius: '10px 10px 0 0',
            borderBottom: 'none',
          }}
        >
          <Box sx={{ color: ACCENT_w, display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_w }}>
            Timesheet Projects
          </Typography>
        </Box>

        <Paper
          variant='outlined'
          sx={{
            borderRadius: 0,
            borderTop: 'none',
            borderBottom: 'none',
            px: 1.5,
            py: 0.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <>
                <Tooltip title='Add a new Timesheet Project'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: '#2d5ebb',
                      '&:hover': { bgcolor: '#2d5ebb' },
                      textTransform: 'none',
                    }}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
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
              </>
            ) : (
              <>
                <Button
                  variant='contained'
                  startIcon={<EditIcon />}
                  sx={{
                    bgcolor: '#2d5ebb',
                    '&:hover': { bgcolor: '#2d5ebb' },
                    textTransform: 'none',
                  }}
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  sx={{ textTransform: 'none' }}
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
                    bgcolor: 'divider',
                    mx: 0.75,
                    alignSelf: 'center',
                  }}
                />
                <Button variant='outlined' startIcon={<ClearIcon />} sx={{ textTransform: 'none' }}>
                  Clear
                </Button>
              </>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#2d5ebb', 0.25),
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
        icon={<ReceiptLongIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Timesheet Project'
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
          label='Max Hours Per Day Per Resource'
          type='number'
          size='small'
          fullWidth
          value={form.maxHoursPerDayPerResource}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)),
            }))
          }
          slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }}
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
        entityName='Timesheet Project'
        itemName={selectedRow?.project}
      />
    </>
  );
};

export { TimesheetProjectsPanel };
