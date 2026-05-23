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
import { InputAdornment, FormControl, Select, MenuItem, InputLabel, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import GroupIcon from '@mui/icons-material/Group';
import { IConfigConsultantRole, IConfigAssociatedConsultantProfile } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_w = '#0369a1';

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface AssociatedConsultantProfilesPanelProps {
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  consultantRoles: IConfigConsultantRole[];
  onSave: (data: IConfigAssociatedConsultantProfile[]) => void;
}

const AssociatedConsultantProfilesPanel = ({
  assocConsProfiles,
  applications,
  consultantRoles,
  onSave,
}: AssociatedConsultantProfilesPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigAssociatedConsultantProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ application: '', roleName: '', description: '' });

  const selectedRow = assocConsProfiles.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? assocConsProfiles.filter(
        (r) =>
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.roleName.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : assocConsProfiles;

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              application: editingRow.application,
              roleName: editingRow.roleName,
              description: editingRow.description,
            }
          : { application: '', roleName: '', description: '' },
      );
  }, [dialogOpen, editingRow]);

  const handleSubmit = () => {
    if (!form.application.trim() || !form.roleName.trim()) return;
    let next: IConfigAssociatedConsultantProfile[];
    if (editingRow) {
      next = assocConsProfiles.map((r) =>
        r.id === editingRow.id ? { ...editingRow, ...form } : r,
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigAssociatedConsultantProfile = { id: `acp_${Date.now()}`, ...form };
      next = [...assocConsProfiles, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(assocConsProfiles.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigAssociatedConsultantProfile>[] = [
    { id: 'application', label: 'Application', minWidth: 180, format: mkCell(true) },
    { id: 'roleName', label: 'Role Name', minWidth: 180, format: mkCell() },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
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
          <GroupIcon sx={{ fontSize: '1.1rem' }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_w }}>
          Associated Consultant Profiles
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {assocConsProfiles.length} profile{assocConsProfiles.length !== 1 ? 's' : ''}
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
            <Tooltip title='Add a new associated consultant profile'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
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
                sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
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
                  bgcolor: alpha('#2d5ebb', 0.3),
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

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<GroupIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Associated Consultant Profile'
        submitDisabled={!form.application.trim() || !form.roleName.trim()}
        maxWidth='sm'
      >
        <FormControl size='small' fullWidth required>
          <InputLabel>Application</InputLabel>
          <Select
            label='Application'
            value={form.application}
            onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
          >
            {applications.length === 0 ? (
              <MenuItem disabled value=''>
                <em>No applications available</em>
              </MenuItem>
            ) : (
              applications.map((a) => (
                <MenuItem key={a.id} value={a.name}>
                  {a.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth required>
          <InputLabel>Role Name</InputLabel>
          <Select
            label='Role Name'
            value={form.roleName}
            onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
          >
            {consultantRoles.length === 0 ? (
              <MenuItem disabled value=''>
                <em>No roles defined — add roles first</em>
              </MenuItem>
            ) : (
              consultantRoles.map((r) => (
                <MenuItem key={r.id} value={r.roleName}>
                  {r.roleName}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Associated Consultant Profile'
        itemName={selectedRow?.roleName}
      />
    </Box>
  );
};

interface ConsultantRolesSectionProps {
  roles: IConfigConsultantRole[];
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  onSaveRoles: (data: IConfigConsultantRole[]) => void;
  onSaveAssocConsProfiles: (data: IConfigAssociatedConsultantProfile[]) => void;
  activeSubPanel?: 'roles' | 'assocProfiles';
  onSubPanelChange?: (panel: 'roles' | 'assocProfiles') => void;
}

const ConsultantRolesSection = ({
  roles,
  assocConsProfiles,
  applications,
  onSaveRoles,
  onSaveAssocConsProfiles,
  activeSubPanel = 'roles',
  onSubPanelChange,
}: ConsultantRolesSectionProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantRole | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ roleName: '', description: '' });

  const selectedRow = roles.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? roles.filter(
        (r) =>
          r.roleName.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : roles;

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? { roleName: editingRow.roleName, description: editingRow.description }
          : { roleName: '', description: '' },
      );
  }, [dialogOpen, editingRow]);

  const handleSubmit = () => {
    if (!form.roleName.trim()) return;
    let next: IConfigConsultantRole[];
    if (editingRow) {
      next = roles.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConsultantRole = { id: `cr_${Date.now()}`, ...form };
      next = [...roles, n];
      setSelectedId(n.id);
    }
    onSaveRoles(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSaveRoles(roles.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigConsultantRole>[] = [
    { id: 'roleName', label: 'Role Name', minWidth: 200, format: mkCell(true) },
    {
      id: 'description',
      label: 'Description',
      minWidth: 320,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <>
      {activeSubPanel === 'assocProfiles' ? (
        <AssociatedConsultantProfilesPanel
          assocConsProfiles={assocConsProfiles}
          applications={applications}
          consultantRoles={roles}
          onSave={onSaveAssocConsProfiles}
        />
      ) : (
        <Box>
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
              <GroupIcon sx={{ fontSize: '1.1rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_w }}>
              Consultant Roles
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
              {roles.length} role{roles.length !== 1 ? 's' : ''}
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
                <Tooltip title='Add a new consultant role'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
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
                    sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
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
                      bgcolor: alpha('#2d5ebb', 0.3),
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

          <ConfigFormDialog
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
              setEditingRow(null);
            }}
            onSubmit={handleSubmit}
            isEdit={!!editingRow}
            icon={<GroupIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
            accent='#2d5ebb'
            title='Consultant Role'
            submitDisabled={!form.roleName.trim()}
            submitLabel={editingRow ? 'Save Changes' : 'Add Role'}
            maxWidth='sm'
          >
            <TextField
              label='Role Name'
              size='small'
              fullWidth
              required
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
            />
            <TextField
              label='Description'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </ConfigFormDialog>

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            entityName='Consultant Role'
            itemName={selectedRow?.roleName}
          />
        </Box>
      )}
    </>
  );
};

export { ConsultantRolesSection, AssociatedConsultantProfilesPanel };
