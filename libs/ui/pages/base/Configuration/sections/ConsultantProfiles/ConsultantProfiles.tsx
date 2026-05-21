import React, { useState, useEffect } from 'react';
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
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import {
  IConfigConsultantProfile,
  IConfigAssociatedUserProfile,
  IConfigConsultantWorkingTime,
  IConfigConsultantWorkingShift,
  IConfigConsultantTimesheetProject,
  IConfigConsultantExpenseProject,
  IConfigConsultantRole,
  IConfigAssociatedConsultantProfile,
} from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';

// ── Accents ────────────────────────────────────────────────────────────────────

const ACCENT_CP = '#d97706';
const ACCENT_AUP = '#2563eb';
const ACCENT_WT = '#0891b2';
const ACCENT_WS = '#059669';
const ACCENT_TP = '#0891b2';
const ACCENT_EP = '#7c3aed';
const ACCENT_CR = '#7c3aed';
const ACCENT_ACP = '#059669';

// ── Shared panel header ────────────────────────────────────────────────────────

const PanelHeader = ({
  icon,
  title,
  count,
  countLabel,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countLabel: string;
  accent: string;
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
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
    <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
      {count} {countLabel}
      {count !== 1 ? 's' : ''}
    </Typography>
  </Box>
);

// ── Empty defaults ────────────────────────────────────────────────────────────

const EMPTY_CP = {
  consultantName: '',
  applicationId: '',
  applicationName: '',
  consultantRole: '',
  workingCalendar: '',
  holidayCalendar: '',
  leadConsultant: '',
  manager: '',
};
const EMPTY_AUP = {
  consultantProfileId: '',
  consultantName: '',
  userId: '',
  userName: '',
  email: '',
  role: '',
};
const EMPTY_WT = {
  consultantProfileId: '',
  consultantName: '',
  startTime: '09:00',
  endTime: '17:00',
  timezone: '',
};
const EMPTY_WS = { consultantProfileId: '', consultantName: '', shiftName: '', description: '' };
const EMPTY_TP_FORM = {
  consultantProfileId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};
const EMPTY_EP_FORM = {
  consultantProfileId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxAmountPerDay: 0,
};

// ── Cell helper ────────────────────────────────────────────────────────────────

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

// ── Associated User Profiles panel ───────────────────────────────────────────

const AssocUserProfilePanel = ({
  data,
  onSave,
}: {
  data: IConfigAssociatedUserProfile[];
  onSave: (data: IConfigAssociatedUserProfile[]) => void;
}) => {
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
        <PanelHeader
          icon={<PersonIcon sx={{ fontSize: '1.1rem' }} />}
          title='Associated User Profiles'
          count={data.length}
          countLabel='profile'
          accent={ACCENT_AUP}
        />
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

// ── Working Times panel ────────────────────────────────────────────────────────

const WorkingTimesPanel = ({
  data,
  onSave,
}: {
  data: IConfigConsultantWorkingTime[];
  onSave: (data: IConfigConsultantWorkingTime[]) => void;
}) => {
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
        <PanelHeader
          icon={<AccessTimeIcon sx={{ fontSize: '1.1rem' }} />}
          title='Working Times'
          count={data.length}
          countLabel='entry'
          accent={ACCENT_WT}
        />
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
              <>
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
                    bgcolor: alpha(ACCENT_WT, 0.3),
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
        accent={ACCENT_WT}
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

// ── Working Shift panel ────────────────────────────────────────────────────────

const WorkingShiftPanel = ({
  data,
  onSave,
}: {
  data: IConfigConsultantWorkingShift[];
  onSave: (data: IConfigConsultantWorkingShift[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantWorkingShift | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_WS);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            consultantProfileId: editingRow.consultantProfileId,
            consultantName: editingRow.consultantName,
            shiftName: editingRow.shiftName,
            description: editingRow.description,
          }
        : EMPTY_WS,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.shiftName.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (!form.shiftName.trim()) return;
    if (editingRow) {
      const updated = data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `ws_${Date.now()}`, ...form } as IConfigConsultantWorkingShift;
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

  const columns: Column<IConfigConsultantWorkingShift>[] = [
    { id: 'shiftName', label: 'Shift Name', minWidth: 160, format: mkCell(true) },
    {
      id: 'description',
      label: 'Description',
      minWidth: 260,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <PanelHeader
          icon={<UpdateIcon sx={{ fontSize: '1.1rem' }} />}
          title='Working Shifts'
          count={data.length}
          countLabel='shift'
          accent={ACCENT_WS}
        />
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
              <Tooltip title='Add new working shift'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{ bgcolor: ACCENT_WS, '&:hover': { bgcolor: alpha(ACCENT_WS, 0.85) } }}
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
                  sx={{ bgcolor: ACCENT_WS, '&:hover': { bgcolor: alpha(ACCENT_WS, 0.85) } }}
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
                    bgcolor: alpha(ACCENT_WS, 0.3),
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
        </Paper>
        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(ACCENT_WS, 0.25),
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
        icon={<UpdateIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_WS}
        title='Working Shift'
        submitDisabled={!form.shiftName.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Shift Name'
          size='small'
          fullWidth
          required
          value={form.shiftName}
          onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
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
        entityName='Working Shift'
        itemName={selectedRow?.shiftName}
      />
    </>
  );
};

// ── Timesheet Projects panel ──────────────────────────────────────────────────

const TimesheetProjectsPanel = ({
  data,
  onSave,
}: {
  data: IConfigConsultantTimesheetProject[];
  onSave: (data: IConfigConsultantTimesheetProject[]) => void;
}) => {
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
      const n = { id: `tp_${Date.now()}`, ...form } as IConfigConsultantTimesheetProject;
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
            bgcolor: alpha(ACCENT_TP, 0.1),
            color: ACCENT_TP,
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
        <PanelHeader
          icon={<ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />}
          title='Timesheet Projects'
          count={data.length}
          countLabel='project'
          accent={ACCENT_TP}
        />
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
              <Tooltip title='Add new timesheet project'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{ bgcolor: ACCENT_TP, '&:hover': { bgcolor: alpha(ACCENT_TP, 0.85) } }}
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
                  sx={{ bgcolor: ACCENT_TP, '&:hover': { bgcolor: alpha(ACCENT_TP, 0.85) } }}
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
                    bgcolor: alpha(ACCENT_TP, 0.3),
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
        </Paper>
        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(ACCENT_TP, 0.25),
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
        accent={ACCENT_TP}
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

// ── Expense Projects panel ────────────────────────────────────────────────────

const ExpenseProjectsPanel = ({
  data,
  onSave,
}: {
  data: IConfigConsultantExpenseProject[];
  onSave: (data: IConfigConsultantExpenseProject[]) => void;
}) => {
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
        <PanelHeader
          icon={<AttachMoneyIcon sx={{ fontSize: '1.1rem' }} />}
          title='Expense Projects'
          count={data.length}
          countLabel='project'
          accent={ACCENT_EP}
        />
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

// ── Associated Consultant Profiles panel ─────────────────────────────────────

const AssocConsProfilesPanel = ({
  assocConsProfiles,
  applications,
  consultantRoles,
  onSave,
}: {
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  consultantRoles: IConfigConsultantRole[];
  onSave: (data: IConfigAssociatedConsultantProfile[]) => void;
}) => {
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
      <PanelHeader
        accent={ACCENT_ACP}
        icon={<GroupIcon sx={{ fontSize: '1.1rem' }} />}
        title='Associated Consultant Profiles'
        count={assocConsProfiles.length}
        countLabel='profile'
      />
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
                sx={{ bgcolor: ACCENT_ACP, '&:hover': { bgcolor: alpha(ACCENT_ACP, 0.85) } }}
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
                sx={{ bgcolor: ACCENT_ACP, '&:hover': { bgcolor: alpha(ACCENT_ACP, 0.85) } }}
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
                  bgcolor: alpha(ACCENT_ACP, 0.3),
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
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(ACCENT_ACP, 0.25),
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
        accent={ACCENT_ACP}
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

// ── Define Consultant Roles section ──────────────────────────────────────────

const DefineConsultantRolesSection = ({
  roles,
  assocConsProfiles,
  applications,
  onSaveRoles,
  onSaveAssocConsProfiles,
}: {
  roles: IConfigConsultantRole[];
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  onSaveRoles: (data: IConfigConsultantRole[]) => void;
  onSaveAssocConsProfiles: (data: IConfigAssociatedConsultantProfile[]) => void;
}) => {
  const { classes } = useStyles();
  const [crPanel, setCrPanel] = useState<'roles' | 'assocProfiles'>('roles');

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
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: ACCENT_CR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ManageAccountsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Define Consultant Roles</Typography>
              <Typography className={classes.sectionSubtitle}>
                Define roles available for consultant assignments
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          {/* Toolbar */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {/* Consultant Roles button */}
              <Button
                size='small'
                startIcon={<ManageAccountsIcon />}
                variant={crPanel === 'roles' ? 'contained' : 'outlined'}
                onClick={() => setCrPanel('roles')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_CR,
                  bgcolor: crPanel === 'roles' ? ACCENT_CR : undefined,
                  color: crPanel === 'roles' ? '#fff' : ACCENT_CR,
                  '&:hover': {
                    bgcolor: crPanel === 'roles' ? alpha(ACCENT_CR, 0.85) : alpha(ACCENT_CR, 0.08),
                    borderColor: ACCENT_CR,
                  },
                }}
              >
                Consultant Roles
              </Button>

              {/* Associated Consultant Profiles button */}
              <Button
                size='small'
                startIcon={<GroupIcon />}
                variant={crPanel === 'assocProfiles' ? 'contained' : 'outlined'}
                onClick={() => setCrPanel('assocProfiles')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_ACP,
                  bgcolor: crPanel === 'assocProfiles' ? ACCENT_ACP : undefined,
                  color: crPanel === 'assocProfiles' ? '#fff' : ACCENT_ACP,
                  '&:hover': {
                    bgcolor:
                      crPanel === 'assocProfiles'
                        ? alpha(ACCENT_ACP, 0.85)
                        : alpha(ACCENT_ACP, 0.08),
                    borderColor: ACCENT_ACP,
                  },
                }}
              >
                Associated Consultant Profiles
              </Button>
            </Box>
          </Paper>

          {/* Consultant Roles table */}
          {crPanel === 'roles' && (
            <Box sx={{ mt: 2 }}>
              <PanelHeader
                accent={ACCENT_CR}
                icon={<ManageAccountsIcon sx={{ fontSize: '1.1rem' }} />}
                title='Consultant Roles'
                count={roles.length}
                countLabel='role'
              />
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
                        sx={{
                          bgcolor: ACCENT_CR,
                          '&:hover': { bgcolor: alpha(ACCENT_CR, 0.85) },
                        }}
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
                        sx={{
                          bgcolor: ACCENT_CR,
                          '&:hover': { bgcolor: alpha(ACCENT_CR, 0.85) },
                        }}
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
                          bgcolor: alpha(ACCENT_CR, 0.3),
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
                  onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
                  activeRowKey={selectedId ?? undefined}
                />
              </Paper>
            </Box>
          )}

          {/* Associated Consultant Profiles panel */}
          {crPanel === 'assocProfiles' && (
            <AssocConsProfilesPanel
              assocConsProfiles={assocConsProfiles}
              applications={applications}
              consultantRoles={roles}
              onSave={onSaveAssocConsProfiles}
            />
          )}
        </AccordionDetails>
      </Accordion>

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
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

type ActivePanel =
  | 'none'
  | 'userProfile'
  | 'workingTimes'
  | 'workingShift'
  | 'timesheet'
  | 'expense';

const ConsultantProfiles = () => {
  const { classes } = useStyles();
  const { consultantProfiles: api, categorization: apiCat, saveSection } = useConfiguration();
  const applications = apiCat?.applications ?? [];

  const [profiles, setProfiles] = useState<IConfigConsultantProfile[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigAssociatedUserProfile[]>([]);
  const [wTimes, setWTimes] = useState<IConfigConsultantWorkingTime[]>([]);
  const [wShifts, setWShifts] = useState<IConfigConsultantWorkingShift[]>([]);
  const [tsProjects, setTsProjects] = useState<IConfigConsultantTimesheetProject[]>([]);
  const [exProjects, setExProjects] = useState<IConfigConsultantExpenseProject[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigConsultantRole[]>([]);
  const [assocConsProfiles, setAssocConsProfiles] = useState<IConfigAssociatedConsultantProfile[]>(
    [],
  );

  useEffect(() => {
    if (api) {
      setProfiles(api.profiles ?? []);
      setAssocUsers(api.associatedUserProfiles ?? []);
      setWTimes(api.workingTimes ?? []);
      setWShifts(api.workingShifts ?? []);
      setTsProjects(api.timesheetProjects ?? []);
      setExProjects(api.expenseProjects ?? []);
      setConsultantRoles(api.consultantRoles ?? []);
      setAssocConsProfiles(api.associatedConsultantProfiles ?? []);
    }
  }, [api]);

  const saveAll = (overrides: {
    profiles?: IConfigConsultantProfile[];
    associatedUserProfiles?: IConfigAssociatedUserProfile[];
    workingTimes?: IConfigConsultantWorkingTime[];
    workingShifts?: IConfigConsultantWorkingShift[];
    timesheetProjects?: IConfigConsultantTimesheetProject[];
    expenseProjects?: IConfigConsultantExpenseProject[];
    consultantRoles?: IConfigConsultantRole[];
    associatedConsultantProfiles?: IConfigAssociatedConsultantProfile[];
  }) => {
    saveSection('consultantProfiles', {
      profiles: overrides.profiles ?? profiles,
      associatedUserProfiles: overrides.associatedUserProfiles ?? assocUsers,
      workingTimes: overrides.workingTimes ?? wTimes,
      workingShifts: overrides.workingShifts ?? wShifts,
      timesheetProjects: overrides.timesheetProjects ?? tsProjects,
      expenseProjects: overrides.expenseProjects ?? exProjects,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      associatedConsultantProfiles: overrides.associatedConsultantProfiles ?? assocConsProfiles,
    });
  };

  // ── Main table ───────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IConfigConsultantProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cpForm, setCpForm] = useState(EMPTY_CP);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;
  const panelActive = activePanel !== 'none';
  const togglePanel = (p: ActivePanel) => setActivePanel((prev) => (prev === p ? 'none' : p));

  const filteredProfiles = search
    ? profiles.filter(
        (p) =>
          p.consultantName.toLowerCase().includes(search.toLowerCase()) ||
          p.applicationName?.toLowerCase().includes(search.toLowerCase()) ||
          p.consultantRole?.toLowerCase().includes(search.toLowerCase()),
      )
    : profiles;

  useEffect(() => {
    if (!editOpen) return;
    setCpForm(
      editingProfile
        ? {
            consultantName: editingProfile.consultantName,
            applicationId: editingProfile.applicationId,
            applicationName: editingProfile.applicationName,
            consultantRole: editingProfile.consultantRole,
            workingCalendar: editingProfile.workingCalendar,
            holidayCalendar: editingProfile.holidayCalendar,
            leadConsultant: editingProfile.leadConsultant,
            manager: editingProfile.manager,
          }
        : EMPTY_CP,
    );
  }, [editOpen, editingProfile]);

  const handleProfileSubmit = () => {
    if (!cpForm.consultantName.trim()) return;
    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id ? { ...editingProfile, ...cpForm } : p,
      );
      setProfiles(updated);
      saveAll({ profiles: updated });
      setSelectedId(editingProfile.id);
    } else {
      const n: IConfigConsultantProfile = { id: `cp_${Date.now()}`, ...cpForm };
      setProfiles([...profiles, n]);
      saveAll({ profiles: [...profiles, n] });
      setSelectedId(n.id);
    }
    setEditOpen(false);
    setEditingProfile(null);
  };

  const handleProfileDelete = () => {
    if (!selectedProfile) return;
    const next = profiles.filter((p) => p.id !== selectedProfile.id);
    setProfiles(next);
    saveAll({ profiles: next });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const profileColumns: Column<IConfigConsultantProfile>[] = [
    { id: 'consultantName', label: 'Consultant', minWidth: 150, format: mkCell(true) },
    { id: 'applicationName', label: 'Application', minWidth: 140, format: mkCell() },
    { id: 'consultantRole', label: 'Role', minWidth: 140, format: mkCell() },
    { id: 'workingCalendar', label: 'Working Calendar', minWidth: 150, format: mkCell() },
    { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 150, format: mkCell() },
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
                bgcolor: ACCENT_CP,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessCenterIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Consultant Profiles</Typography>
              <Typography className={classes.sectionSubtitle}>
                Manage consultant profiles, roles, and calendar assignments
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {/* Consultant Profiles button */}
              <Button
                size='small'
                startIcon={<BusinessCenterIcon />}
                variant={!panelActive ? 'contained' : 'outlined'}
                onClick={() => setActivePanel('none')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_CP,
                  bgcolor: !panelActive ? ACCENT_CP : undefined,
                  color: !panelActive ? '#fff' : ACCENT_CP,
                  '&:hover': {
                    bgcolor: !panelActive ? alpha(ACCENT_CP, 0.85) : alpha(ACCENT_CP, 0.08),
                    borderColor: ACCENT_CP,
                  },
                }}
              >
                Consultant Profiles
              </Button>

              {/* Sub-panel buttons */}
              <Button
                size='small'
                startIcon={<PersonIcon />}
                variant={activePanel === 'userProfile' ? 'contained' : 'outlined'}
                onClick={() => togglePanel('userProfile')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_AUP,
                  bgcolor: activePanel === 'userProfile' ? ACCENT_AUP : undefined,
                  color: activePanel === 'userProfile' ? '#fff' : ACCENT_AUP,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'userProfile'
                        ? alpha(ACCENT_AUP, 0.85)
                        : alpha(ACCENT_AUP, 0.08),
                    borderColor: ACCENT_AUP,
                  },
                }}
              >
                User Profiles
              </Button>
              <Button
                size='small'
                startIcon={<AccessTimeIcon />}
                variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
                onClick={() => togglePanel('workingTimes')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_WT,
                  bgcolor: activePanel === 'workingTimes' ? ACCENT_WT : undefined,
                  color: activePanel === 'workingTimes' ? '#fff' : ACCENT_WT,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'workingTimes'
                        ? alpha(ACCENT_WT, 0.85)
                        : alpha(ACCENT_WT, 0.08),
                    borderColor: ACCENT_WT,
                  },
                }}
              >
                Working Times
              </Button>
              <Button
                size='small'
                startIcon={<UpdateIcon />}
                variant={activePanel === 'workingShift' ? 'contained' : 'outlined'}
                onClick={() => togglePanel('workingShift')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_WS,
                  bgcolor: activePanel === 'workingShift' ? ACCENT_WS : undefined,
                  color: activePanel === 'workingShift' ? '#fff' : ACCENT_WS,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'workingShift'
                        ? alpha(ACCENT_WS, 0.85)
                        : alpha(ACCENT_WS, 0.08),
                    borderColor: ACCENT_WS,
                  },
                }}
              >
                Working Shifts
              </Button>
              <Button
                size='small'
                startIcon={<ReceiptLongIcon />}
                variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
                onClick={() => togglePanel('timesheet')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_TP,
                  bgcolor: activePanel === 'timesheet' ? ACCENT_TP : undefined,
                  color: activePanel === 'timesheet' ? '#fff' : ACCENT_TP,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'timesheet' ? alpha(ACCENT_TP, 0.85) : alpha(ACCENT_TP, 0.08),
                    borderColor: ACCENT_TP,
                  },
                }}
              >
                Timesheet Projects
              </Button>
              <Button
                size='small'
                startIcon={<AttachMoneyIcon />}
                variant={activePanel === 'expense' ? 'contained' : 'outlined'}
                onClick={() => togglePanel('expense')}
                sx={{
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: ACCENT_EP,
                  bgcolor: activePanel === 'expense' ? ACCENT_EP : undefined,
                  color: activePanel === 'expense' ? '#fff' : ACCENT_EP,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'expense' ? alpha(ACCENT_EP, 0.85) : alpha(ACCENT_EP, 0.08),
                    borderColor: ACCENT_EP,
                  },
                }}
              >
                Expense Projects
              </Button>
            </Box>
          </Paper>

          {/* ── Main table — hidden when panel active ── */}
          {!panelActive && (
            <Box sx={{ mt: 2 }}>
              <PanelHeader
                icon={<BusinessCenterIcon sx={{ fontSize: '1.1rem' }} />}
                title='Consultant Profiles'
                count={profiles.length}
                countLabel='profile'
                accent={ACCENT_CP}
              />
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
                  {!selectedProfile ? (
                    <Tooltip title='Add new consultant profile'>
                      <Button
                        size='small'
                        variant='contained'
                        startIcon={<AddIcon />}
                        sx={{ bgcolor: ACCENT_CP, '&:hover': { bgcolor: alpha(ACCENT_CP, 0.85) } }}
                        onClick={() => {
                          setEditingProfile(null);
                          setEditOpen(true);
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
                        sx={{ bgcolor: ACCENT_CP, '&:hover': { bgcolor: alpha(ACCENT_CP, 0.85) } }}
                        onClick={() => {
                          setEditingProfile(selectedProfile);
                          setEditOpen(true);
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
                          bgcolor: alpha(ACCENT_CP, 0.3),
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
              </Paper>
              <Paper
                elevation={1}
                sx={{
                  borderRadius: '0 0 10px 10px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha(ACCENT_CP, 0.25),
                  borderTop: 'none',
                }}
              >
                <DataTable
                  columns={profileColumns}
                  data={filteredProfiles}
                  rowKey='id'
                  searchable={false}
                  initialRowsPerPage={10}
                  onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
                  activeRowKey={selectedId ?? undefined}
                />
              </Paper>
            </Box>
          )}

          {/* ── Panels ── */}
          {activePanel === 'userProfile' && (
            <AssocUserProfilePanel
              data={assocUsers}
              onSave={(next) => {
                setAssocUsers(next);
                saveAll({ associatedUserProfiles: next });
              }}
            />
          )}
          {activePanel === 'workingTimes' && (
            <WorkingTimesPanel
              data={wTimes}
              onSave={(next) => {
                setWTimes(next);
                saveAll({ workingTimes: next });
              }}
            />
          )}
          {activePanel === 'workingShift' && (
            <WorkingShiftPanel
              data={wShifts}
              onSave={(next) => {
                setWShifts(next);
                saveAll({ workingShifts: next });
              }}
            />
          )}
          {activePanel === 'timesheet' && (
            <TimesheetProjectsPanel
              data={tsProjects}
              onSave={(next) => {
                setTsProjects(next);
                saveAll({ timesheetProjects: next });
              }}
            />
          )}
          {activePanel === 'expense' && (
            <ExpenseProjectsPanel
              data={exProjects}
              onSave={(next) => {
                setExProjects(next);
                saveAll({ expenseProjects: next });
              }}
            />
          )}
        </AccordionDetails>
      </Accordion>

      {/* ── Define Consultant Roles ── */}
      <DefineConsultantRolesSection
        roles={consultantRoles}
        assocConsProfiles={assocConsProfiles}
        applications={applications}
        onSaveRoles={(next) => {
          setConsultantRoles(next);
          saveAll({ consultantRoles: next });
        }}
        onSaveAssocConsProfiles={(next) => {
          setAssocConsProfiles(next);
          saveAll({ associatedConsultantProfiles: next });
        }}
      />

      {/* ── New / Edit Profile Dialog ── */}
      <ConfigFormDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingProfile(null);
        }}
        onSubmit={handleProfileSubmit}
        isEdit={!!editingProfile}
        icon={<BusinessCenterIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CP}
        title='Consultant Profile'
        submitDisabled={!cpForm.consultantName.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Consultant Name'
          size='small'
          fullWidth
          required
          value={cpForm.consultantName}
          onChange={(e) => setCpForm((f) => ({ ...f, consultantName: e.target.value }))}
        />
        <TextField
          label='Application'
          size='small'
          fullWidth
          value={cpForm.applicationName}
          disabled
        />
        <TextField
          label='Consultant Role'
          size='small'
          fullWidth
          value={cpForm.consultantRole}
          onChange={(e) => setCpForm((f) => ({ ...f, consultantRole: e.target.value }))}
        />
        <TextField
          label='Working Calendar'
          size='small'
          fullWidth
          value={cpForm.workingCalendar}
          onChange={(e) => setCpForm((f) => ({ ...f, workingCalendar: e.target.value }))}
        />
        <TextField
          label='Holiday Calendar'
          size='small'
          fullWidth
          value={cpForm.holidayCalendar}
          onChange={(e) => setCpForm((f) => ({ ...f, holidayCalendar: e.target.value }))}
        />
        <TextField
          label='Lead Consultant'
          size='small'
          fullWidth
          value={cpForm.leadConsultant}
          onChange={(e) => setCpForm((f) => ({ ...f, leadConsultant: e.target.value }))}
        />
        <TextField
          label='Manager'
          size='small'
          fullWidth
          value={cpForm.manager}
          onChange={(e) => setCpForm((f) => ({ ...f, manager: e.target.value }))}
        />
      </ConfigFormDialog>

      {/* ── Delete Confirmation ── */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleProfileDelete}
        entityName='Consultant Profile'
        itemName={selectedProfile?.consultantName}
      />
    </Box>
  );
};

export default ConsultantProfiles;
