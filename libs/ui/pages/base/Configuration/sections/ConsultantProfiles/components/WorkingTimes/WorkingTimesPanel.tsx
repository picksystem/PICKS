import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  DataTable,
  Column,
} from '@serviceops/component';
import { InputAdornment, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IConfigConsultantWorkingTime } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_w = '#0369a1';

const EMPTY_WT = {
  consultantProfileId: '',
  consultantName: '',
  startTime: '09:00',
  endTime: '17:00',
  timezone: '',
};

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface WorkingTimesPanelProps {
  data: IConfigConsultantWorkingTime[];
  onSave: (data: IConfigConsultantWorkingTime[]) => void;
}

const WorkingTimesPanel = ({ data, onSave }: WorkingTimesPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_WT);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            consultantProfileId: editingRow.consultantProfileId,
            consultantName: editingRow.consultantName,
            startTime: editingRow.startTime,
            endTime: editingRow.endTime,
            timezone: editingRow.timezone,
          }
        : EMPTY_WT,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter((r) => r.timezone?.toLowerCase().includes(search.toLowerCase()))
    : data;

  const handleSubmit = () => {
    if (!form.startTime) return;
    if (editingRow) {
      const updated = data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `wt_${Date.now()}`, ...form } as IConfigConsultantWorkingTime;
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

  const columns: Column<IConfigConsultantWorkingTime>[] = [
    { id: 'startTime', label: 'Start Time', minWidth: 120, format: mkCell(true) },
    { id: 'endTime', label: 'End Time', minWidth: 120, format: mkCell() },
    { id: 'timezone', label: 'Timezone', minWidth: 180, format: mkCell() },
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
            <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_w }}>
            Working Times
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
                <Tooltip title='Add a new Working Time'>
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
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Working Time'
        submitDisabled={!form.startTime}
        maxWidth='xs'
      >
        <TextField
          label='Start Time'
          type='time'
          size='small'
          fullWidth
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label='End Time'
          type='time'
          size='small'
          fullWidth
          value={form.endTime}
          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label='Timezone'
          size='small'
          fullWidth
          value={form.timezone}
          onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Time'
      />
    </>
  );
};

export { WorkingTimesPanel };
