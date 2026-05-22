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
import PersonIcon from '@mui/icons-material/Person';
import { IConfigAssociatedUserProfile } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_AUP = '#2563eb';

const EMPTY_AUP = {
  consultantProfileId: '',
  consultantName: '',
  userId: '',
  userName: '',
  email: '',
  role: '',
};

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface UserProfilesPanelProps {
  data: IConfigAssociatedUserProfile[];
  onSave: (data: IConfigAssociatedUserProfile[]) => void;
}

const UserProfilesPanel = ({ data, onSave }: UserProfilesPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigAssociatedUserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_AUP);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            consultantProfileId: editingRow.consultantProfileId,
            consultantName: editingRow.consultantName,
            userId: editingRow.userId,
            userName: editingRow.userName,
            email: editingRow.email,
            role: editingRow.role,
          }
        : EMPTY_AUP,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.userName.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.role?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (!form.userName.trim()) return;
    if (editingRow) {
      const updated = data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `aup_${Date.now()}`, ...form } as IConfigAssociatedUserProfile;
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

  const columns: Column<IConfigAssociatedUserProfile>[] = [
    { id: 'userId', label: 'User ID', minWidth: 110, format: mkCell() },
    { id: 'userName', label: 'User Name', minWidth: 150, format: mkCell(true) },
    { id: 'email', label: 'Email', minWidth: 200, format: mkCell() },
    { id: 'role', label: 'Role', minWidth: 130, format: mkCell() },
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
            bgcolor: alpha(ACCENT_AUP, 0.08),
            border: '1px solid',
            borderColor: alpha(ACCENT_AUP, 0.25),
            borderRadius: '10px 10px 0 0',
            borderBottom: 'none',
          }}
        >
          <Box sx={{ color: ACCENT_AUP, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_AUP }}>
            Associated User Profiles
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
            {data.length} profile{data.length !== 1 ? 's' : ''}
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
              <Tooltip title='Add new user profile'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{ bgcolor: ACCENT_AUP, '&:hover': { bgcolor: alpha(ACCENT_AUP, 0.85) } }}
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
                  sx={{ bgcolor: ACCENT_AUP, '&:hover': { bgcolor: alpha(ACCENT_AUP, 0.85) } }}
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
                    bgcolor: alpha(ACCENT_AUP, 0.3),
                    mx: 0.75,
                    alignSelf: 'center',
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedId(null)}
                  sx={{ textTransform: 'none' }}
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
            borderColor: alpha(ACCENT_AUP, 0.25),
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
        icon={<PersonIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_AUP}
        title='Associated User Profile'
        submitDisabled={!form.userName.trim()}
        maxWidth='sm'
      >
        <TextField
          label='User ID'
          size='small'
          fullWidth
          value={form.userId}
          onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
        />
        <TextField
          label='User Name'
          size='small'
          fullWidth
          required
          value={form.userName}
          onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
        />
        <TextField
          label='Email'
          size='small'
          fullWidth
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <TextField
          label='Role'
          size='small'
          fullWidth
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Associated User Profile'
        itemName={selectedRow?.userName}
      />
    </>
  );
};

export { UserProfilesPanel };
