import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Link,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  alpha,
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';

const ACCENT_MAIN = '#0369a1';

// ── Shared helpers ────────────────────────────────────────────────────────────

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

const ApprovalPicker = ({
  accent,
  records,
  value,
  onChange,
}: {
  accent: string;
  records: IConfigApprovalRecord[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      bgcolor: alpha(accent, 0.04),
      border: '1px solid',
      borderColor: alpha(accent, 0.2),
      borderTop: 'none',
      borderBottom: 'none',
    }}
  >
    <Typography
      variant='caption'
      fontWeight={600}
      color='text.secondary'
      sx={{ whiteSpace: 'nowrap' }}
    >
      Approval Record:
    </Typography>
    <FormControl size='small' sx={{ minWidth: 240 }}>
      <Select
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }}
        renderValue={(v) => {
          if (!v)
            return (
              <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>
                — select an approval record —
              </Typography>
            );
          return records.find((r) => r.id === v)?.consultant ?? v;
        }}
      >
        {records.length === 0 ? (
          <MenuItem disabled value=''>
            <em>No approval records available</em>
          </MenuItem>
        ) : (
          records.map((r) => (
            <MenuItem key={r.id} value={r.id} sx={{ fontSize: '0.82rem' }}>
              {r.consultant}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  </Box>
);

const NoPick = ({ text }: { text: string }) => (
  <Box
    sx={{
      py: 6,
      textAlign: 'center',
      border: '1px solid',
      borderTop: 'none',
      borderColor: 'divider',
      borderRadius: '0 0 10px 10px',
      bgcolor: 'grey.50',
    }}
  >
    <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
      {text}
    </Typography>
  </Box>
);

// ── View Associated User Profile panel ────────────────────────────────────────

const ACCENT_AUP = '#2563eb';

const AssocUserProfilePanel = ({
  records,
  assocUsers,
  defaultRecordId,
  onBack,
  onSave,
}: {
  records: IConfigApprovalRecord[];
  assocUsers: IConfigApprovalAssocUserProfile[];
  defaultRecordId: string | null;
  onBack: () => void;
  onSave: (next: IConfigApprovalAssocUserProfile[]) => void;
}) => {
  const { classes } = useStyles();
  const [recordId, setRecordId] = useState(defaultRecordId ?? '');
  const record = records.find((r) => r.id === recordId) ?? null;
  const filtered = assocUsers.filter((u) => u.approvalRecordId === recordId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalAssocUserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ userId: '', userName: '', email: '', role: '' });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              userId: editingRow.userId,
              userName: editingRow.userName,
              email: editingRow.email,
              role: editingRow.role,
            }
          : { userId: '', userName: '', email: '', role: '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = filtered.find((r) => r.id === selectedId) ?? null;
  const displayRows = search
    ? filtered.filter(
        (r) =>
          r.userName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.role.toLowerCase().includes(search.toLowerCase()),
      )
    : filtered;

  const handleSubmit = () => {
    if (!form.userName.trim()) return;
    let next: IConfigApprovalAssocUserProfile[];
    if (editingRow) {
      next = assocUsers.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApprovalAssocUserProfile = {
        id: `aup_${Date.now()}`,
        approvalRecordId: recordId,
        ...form,
      };
      next = [...assocUsers, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(assocUsers.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigApprovalAssocUserProfile>[] = [
    { id: 'userId', label: 'User ID', minWidth: 110, format: mkCell() },
    { id: 'userName', label: 'User Name', minWidth: 150, format: mkCell(true) },
    { id: 'email', label: 'Email', minWidth: 200, format: mkCell() },
    { id: 'role', label: 'Role', minWidth: 130, format: mkCell() },
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
          bgcolor: alpha(ACCENT_AUP, 0.08),
          border: '1px solid',
          borderColor: alpha(ACCENT_AUP, 0.25),
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
            color: ACCENT_AUP,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_AUP, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_AUP, 0.3) }} />
        <PersonIcon sx={{ color: ACCENT_AUP, fontSize: '1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_AUP }}>
          View Associated User Profile
        </Typography>
      </Box>
      <ApprovalPicker
        accent={ACCENT_AUP}
        records={records}
        value={recordId}
        onChange={(id) => {
          setRecordId(id);
          setSelectedId(null);
        }}
      />
      {!record ? (
        <NoPick text='Select an approval record above to view and manage associated user profiles.' />
      ) : (
        <>
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
                <Tooltip title='Add new'>
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
              )}
              {selectedRow && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              )}
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
            {selectedRow && (
              <Typography variant='caption' color='text.secondary'>
                Selected: <strong>{selectedRow.userName}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
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
              data={displayRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        </>
      )}
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
        title={editingRow ? 'Edit Associated User Profile' : 'New Associated User Profile'}
        subtitle='Manage user profile associations for this approval record'
        submitDisabled={!form.userName.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
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
        itemName={selectedRow?.userName ?? ''}
      />
    </Box>
  );
};

// ── Define Consultant Roles panel ─────────────────────────────────────────────

const ACCENT_CR = '#7c3aed';

const ConsultantRolesPanel = ({
  consultantRoles,
  onBack,
  onSave,
}: {
  consultantRoles: IConfigApprovalConsultantRole[];
  onBack: () => void;
  onSave: (next: IConfigApprovalConsultantRole[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalConsultantRole | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ roleName: '', description: '' });

  const selectedRow = consultantRoles.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? consultantRoles.filter(
        (r) =>
          r.roleName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : consultantRoles;

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
    let next: IConfigApprovalConsultantRole[];
    if (editingRow) {
      next = consultantRoles.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApprovalConsultantRole = { id: `cr_${Date.now()}`, ...form };
      next = [...consultantRoles, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(consultantRoles.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigApprovalConsultantRole>[] = [
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
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha(ACCENT_CR, 0.08),
          border: '1px solid',
          borderColor: alpha(ACCENT_CR, 0.25),
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
            color: ACCENT_CR,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_CR, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_CR, 0.3) }} />
        <ManageAccountsIcon sx={{ color: ACCENT_CR, fontSize: '1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_CR }}>
          Define Consultant Roles
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {consultantRoles.length} role{consultantRoles.length !== 1 ? 's' : ''}
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
            <Tooltip title='Add new consultant role'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: ACCENT_CR, '&:hover': { bgcolor: alpha(ACCENT_CR, 0.85) } }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: ACCENT_CR, '&:hover': { bgcolor: alpha(ACCENT_CR, 0.85) } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.roleName}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(ACCENT_CR, 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
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
        icon={<ManageAccountsIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CR}
        title={editingRow ? 'Edit Consultant Role' : 'New Consultant Role'}
        subtitle='Define consultant roles for approval workflows'
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
        itemName={selectedRow?.roleName ?? ''}
      />
    </Box>
  );
};

// ── View Working Times panel ───────────────────────────────────────────────────

const ACCENT_WT = '#0891b2';

const WorkingTimesPanel = ({
  records,
  workingTimes,
  defaultRecordId,
  onBack,
  onSave,
}: {
  records: IConfigApprovalRecord[];
  workingTimes: IConfigApprovalWorkingTime[];
  defaultRecordId: string | null;
  onBack: () => void;
  onSave: (next: IConfigApprovalWorkingTime[]) => void;
}) => {
  const { classes } = useStyles();
  const [recordId, setRecordId] = useState(defaultRecordId ?? '');
  const record = records.find((r) => r.id === recordId) ?? null;
  const filtered = workingTimes.filter((t) => t.approvalRecordId === recordId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ startTime: '09:00', endTime: '17:00', timezone: '' });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
              timezone: editingRow.timezone,
            }
          : { startTime: '09:00', endTime: '17:00', timezone: '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = filtered.find((r) => r.id === selectedId) ?? null;
  const displayRows = search
    ? filtered.filter((r) => r.timezone.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  const handleSubmit = () => {
    if (!form.startTime) return;
    let next: IConfigApprovalWorkingTime[];
    if (editingRow) {
      next = workingTimes.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApprovalWorkingTime = {
        id: `wt_${Date.now()}`,
        approvalRecordId: recordId,
        ...form,
      };
      next = [...workingTimes, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(workingTimes.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigApprovalWorkingTime>[] = [
    { id: 'startTime', label: 'Start Time', minWidth: 120, format: mkCell(true) },
    { id: 'endTime', label: 'End Time', minWidth: 120, format: mkCell() },
    { id: 'timezone', label: 'Timezone', minWidth: 180, format: mkCell() },
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
          bgcolor: alpha(ACCENT_WT, 0.08),
          border: '1px solid',
          borderColor: alpha(ACCENT_WT, 0.25),
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
            color: ACCENT_WT,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_WT, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_WT, 0.3) }} />
        <AccessTimeIcon sx={{ color: ACCENT_WT, fontSize: '1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_WT }}>
          View Working Times
        </Typography>
      </Box>
      <ApprovalPicker
        accent={ACCENT_WT}
        records={records}
        value={recordId}
        onChange={(id) => {
          setRecordId(id);
          setSelectedId(null);
        }}
      />
      {!record ? (
        <NoPick text='Select an approval record above to view and manage working times.' />
      ) : (
        <>
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
                <Tooltip title='Add new working time'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    sx={{ bgcolor: ACCENT_WT, '&:hover': { bgcolor: alpha(ACCENT_WT, 0.85) } }}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  sx={{ bgcolor: ACCENT_WT, '&:hover': { bgcolor: alpha(ACCENT_WT, 0.85) } }}
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              )}
              {selectedRow && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              )}
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
            {selectedRow && (
              <Typography variant='caption' color='text.secondary'>
                Selected:{' '}
                <strong>
                  {selectedRow.startTime} – {selectedRow.endTime}
                </strong>
                &nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>
          <Paper
            elevation={1}
            sx={{
              borderRadius: '0 0 10px 10px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha(ACCENT_WT, 0.25),
              borderTop: 'none',
            }}
          >
            <DataTable
              columns={columns}
              data={displayRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        </>
      )}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_WT}
        title={editingRow ? 'Edit Working Time' : 'New Working Time'}
        subtitle='Configure working time windows for this approval record'
        submitDisabled={!form.startTime}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
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
        itemName={selectedRow ? `${selectedRow.startTime} – ${selectedRow.endTime}` : ''}
      />
    </Box>
  );
};

// ── Main Approvals component ──────────────────────────────────────────────────

type ActivePanel = 'none' | 'userProfile' | 'consultantRoles' | 'workingTimes';

const EMPTY_RECORD = {
  consultant: '',
  application: '',
  consultantRole: '',
  slaWorkingTimeCalendar: '',
  slaExceptionGroup: '',
  leadConsultant: '',
  manager: '',
};

const Approvals = () => {
  const { classes } = useStyles();
  const { approvals: api, categorization: apiCat, saveSection } = useConfiguration();
  const applications = apiCat?.applications ?? [];

  const [records, setRecords] = useState<IConfigApprovalRecord[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigApprovalAssocUserProfile[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigApprovalConsultantRole[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigApprovalWorkingTime[]>([]);

  useEffect(() => {
    if (api) {
      setRecords(api.records ?? []);
      setAssocUsers(api.assocUserProfiles ?? []);
      setConsultantRoles(api.consultantRoles ?? []);
      setWorkingTimes(api.workingTimes ?? []);
    }
  }, [api]);

  const saveAll = (overrides: {
    records?: IConfigApprovalRecord[];
    assocUserProfiles?: IConfigApprovalAssocUserProfile[];
    consultantRoles?: IConfigApprovalConsultantRole[];
    workingTimes?: IConfigApprovalWorkingTime[];
  }) => {
    saveSection('approvals', {
      records: overrides.records ?? records,
      assocUserProfiles: overrides.assocUserProfiles ?? assocUsers,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      workingTimes: overrides.workingTimes ?? workingTimes,
    });
  };

  // Main table state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IConfigApprovalRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_RECORD);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;
  const panelActive = activePanel !== 'none';
  const togglePanel = (p: ActivePanel) => setActivePanel((prev) => (prev === p ? 'none' : p));

  const filteredRecords = search
    ? records.filter(
        (r) =>
          r.consultant.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.consultantRole.toLowerCase().includes(search.toLowerCase()) ||
          r.leadConsultant.toLowerCase().includes(search.toLowerCase()) ||
          r.manager.toLowerCase().includes(search.toLowerCase()),
      )
    : records;

  useEffect(() => {
    if (editOpen) {
      setForm(
        editingRecord
          ? {
              consultant: editingRecord.consultant,
              application: editingRecord.application,
              consultantRole: editingRecord.consultantRole,
              slaWorkingTimeCalendar: editingRecord.slaWorkingTimeCalendar,
              slaExceptionGroup: editingRecord.slaExceptionGroup,
              leadConsultant: editingRecord.leadConsultant,
              manager: editingRecord.manager,
            }
          : EMPTY_RECORD,
      );
    }
  }, [editOpen, editingRecord]);

  const handleSubmit = () => {
    if (!form.consultant.trim()) return;
    let next: IConfigApprovalRecord[];
    if (editingRecord) {
      next = records.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...form } : r));
      setSelectedId(editingRecord.id);
    } else {
      const n: IConfigApprovalRecord = { id: `ar_${Date.now()}`, ...form };
      next = [...records, n];
      setSelectedId(n.id);
    }
    setRecords(next);
    saveAll({ records: next });
    setEditOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = () => {
    if (!selectedRecord) return;
    const next = records.filter((r) => r.id !== selectedRecord.id);
    setRecords(next);
    saveAll({ records: next });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigApprovalRecord>[] = [
    {
      id: 'consultant',
      label: 'Consultant',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    { id: 'application', label: 'Application', minWidth: 140, format: mkCell() },
    { id: 'consultantRole', label: 'Consultant Role', minWidth: 150, format: mkCell() },
    {
      id: 'slaWorkingTimeCalendar',
      label: 'SLA Working Time Calendar',
      minWidth: 190,
      format: mkCell(),
    },
    { id: 'slaExceptionGroup', label: 'SLA Exception Group', minWidth: 170, format: mkCell() },
    { id: 'leadConsultant', label: 'Lead Consultant', minWidth: 150, format: mkCell() },
    { id: 'manager', label: 'Manager', minWidth: 130, format: mkCell() },
  ];

  return (
    <Box className={classes.container}>
      <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: ACCENT_MAIN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HowToRegIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Approvals</Typography>
              <Typography className={classes.sectionSubtitle}>
                Configure approval workflows, roles, and working schedules
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!panelActive &&
                (!selectedRecord ? (
                  <Tooltip title='Add new approval record'>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingRecord(null);
                        setEditOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
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
                      onClick={() => {
                        setEditingRecord(selectedRecord);
                        setEditOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Delete
                    </Button>
                    <Divider
                      orientation='vertical'
                      flexItem
                      className={classes.toolbarDivider}
                      sx={{ mx: 0.5 }}
                    />
                  </>
                ))}
              <Button
                size='small'
                startIcon={<PersonIcon />}
                variant={activePanel === 'userProfile' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('userProfile')}
                sx={{ textTransform: 'none' }}
              >
                View Associated User Profile
              </Button>
              <Button
                size='small'
                startIcon={<ManageAccountsIcon />}
                variant={activePanel === 'consultantRoles' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('consultantRoles')}
                sx={{ textTransform: 'none' }}
              >
                Define Consultant Roles
              </Button>
              <Button
                size='small'
                startIcon={<AccessTimeIcon />}
                variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('workingTimes')}
                sx={{ textTransform: 'none' }}
              >
                View Working Times
              </Button>
              {!panelActive && (
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
                          <SearchIcon fontSize='small' />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            </Box>
            {!panelActive && selectedRecord && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRecord.consultant}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* ── Main table ── */}
          {!panelActive && (
            <Paper elevation={1} className={classes.tablePaper}>
              <DataTable
                columns={columns}
                data={filteredRecords}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                activeRowKey={selectedId ?? undefined}
              />
            </Paper>
          )}

          {/* ── Panels ── */}
          {activePanel === 'userProfile' && (
            <AssocUserProfilePanel
              records={records}
              assocUsers={assocUsers}
              defaultRecordId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setAssocUsers(next);
                saveAll({ assocUserProfiles: next });
              }}
            />
          )}
          {activePanel === 'consultantRoles' && (
            <ConsultantRolesPanel
              consultantRoles={consultantRoles}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setConsultantRoles(next);
                saveAll({ consultantRoles: next });
              }}
            />
          )}
          {activePanel === 'workingTimes' && (
            <WorkingTimesPanel
              records={records}
              workingTimes={workingTimes}
              defaultRecordId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setWorkingTimes(next);
                saveAll({ workingTimes: next });
              }}
            />
          )}
        </AccordionDetails>
      </Accordion>

      {/* ── New / Edit Dialog ── */}
      <ConfigFormDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRecord}
        icon={<HowToRegIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_MAIN}
        title={editingRecord ? 'Edit Approval Record' : 'New Approval Record'}
        subtitle='Configure consultant, application, and SLA settings for this approval record'
        submitDisabled={!form.consultant.trim()}
        submitLabel={editingRecord ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        <TextField
          label='Consultant'
          size='small'
          fullWidth
          required
          value={form.consultant}
          onChange={(e) => setForm((f) => ({ ...f, consultant: e.target.value }))}
        />
        {editingRecord ? (
          <TextField label='Application' size='small' fullWidth value={form.application} disabled />
        ) : (
          <FormControl size='small' fullWidth>
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
        )}
        <TextField
          label='Consultant Role'
          size='small'
          fullWidth
          value={form.consultantRole}
          onChange={(e) => setForm((f) => ({ ...f, consultantRole: e.target.value }))}
        />
        <TextField
          label='SLA Working Time Calendar'
          size='small'
          fullWidth
          value={form.slaWorkingTimeCalendar}
          onChange={(e) => setForm((f) => ({ ...f, slaWorkingTimeCalendar: e.target.value }))}
        />
        <TextField
          label='SLA Exception Group'
          size='small'
          fullWidth
          value={form.slaExceptionGroup}
          onChange={(e) => setForm((f) => ({ ...f, slaExceptionGroup: e.target.value }))}
        />
        <TextField
          label='Lead Consultant'
          size='small'
          fullWidth
          value={form.leadConsultant}
          onChange={(e) => setForm((f) => ({ ...f, leadConsultant: e.target.value }))}
        />
        <TextField
          label='Manager'
          size='small'
          fullWidth
          value={form.manager}
          onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
        />
      </ConfigFormDialog>

      {/* ── Delete Confirmation ── */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Approval Record'
        itemName={selectedRecord?.consultant ?? ''}
      />
    </Box>
  );
};

export default Approvals;
