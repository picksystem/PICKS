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
  Switch,
  FormControlLabel,
  Chip,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';

// ── Panel shared components ───────────────────────────────────────────────────

const PanelHeader = ({
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

const ConsultantPicker = ({
  accent,
  profiles,
  value,
  onChange,
}: {
  accent: string;
  profiles: IConfigConsultantProfile[];
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
      Consultant:
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
                — select a consultant —
              </Typography>
            );
          return profiles.find((p) => p.id === v)?.consultantName ?? v;
        }}
      >
        {profiles.length === 0 ? (
          <MenuItem disabled value=''>
            <em>No consultants available</em>
          </MenuItem>
        ) : (
          profiles.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.82rem' }}>
              {p.consultantName}
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

const PanelToolbar = ({
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
              sx={{ bgcolor: accent, '&:hover': { bgcolor: alpha(accent, 0.85) } }}
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
            sx={{ bgcolor: accent, '&:hover': { bgcolor: alpha(accent, 0.85) } }}
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

const PanelTable = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
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

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
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
const EMPTY_AUP = { userId: '', userName: '', email: '', role: '' };
const EMPTY_WT = { startTime: '09:00', endTime: '17:00', timezone: '' };
const EMPTY_WS = { shiftName: '', description: '' };
const EMPTY_TP = {
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  maxHoursPerDayPerResource: 8,
};
const EMPTY_EP = { project: '', application: '', fromDate: '', toDate: '', maxAmountPerDay: 0 };

// ── Associated User Profiles panel ───────────────────────────────────────────

const ACCENT_AUP = '#2563eb';

interface AUPPanelProps {
  profiles: IConfigConsultantProfile[];
  assocUsers: IConfigAssociatedUserProfile[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigAssociatedUserProfile[]) => void;
}

const AssocUserProfilePanel = ({
  profiles,
  assocUsers,
  defaultConsultantId,
  onBack,
  onSave,
}: AUPPanelProps) => {
  const [consultantId, setConsultantId] = useState(defaultConsultantId ?? '');
  const consultant = profiles.find((p) => p.id === consultantId) ?? null;
  const filtered = assocUsers.filter((u) => u.consultantProfileId === consultantId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigAssociatedUserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_AUP);

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
          : EMPTY_AUP,
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
    let next: IConfigAssociatedUserProfile[];
    if (editingRow) {
      next = assocUsers.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigAssociatedUserProfile = {
        id: `aup_${Date.now()}`,
        consultantProfileId: consultantId,
        consultantName: consultant!.consultantName,
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

  const columns: Column<IConfigAssociatedUserProfile>[] = [
    { id: 'userId', label: 'User ID', minWidth: 110, format: mkCell() },
    { id: 'userName', label: 'User Name', minWidth: 150, format: mkCell(true) },
    { id: 'email', label: 'Email', minWidth: 200, format: mkCell() },
    { id: 'role', label: 'Role', minWidth: 130, format: mkCell() },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        accent={ACCENT_AUP}
        icon={<PersonIcon sx={{ fontSize: '1rem' }} />}
        title='Associated User Profiles'
        onBack={onBack}
      />
      <ConsultantPicker
        accent={ACCENT_AUP}
        profiles={profiles}
        value={consultantId}
        onChange={(id) => {
          setConsultantId(id);
          setSelectedId(null);
        }}
      />
      {!consultant ? (
        <NoPick text='Select a consultant above to view and manage associated user profiles.' />
      ) : (
        <>
          <PanelToolbar
            accent={ACCENT_AUP}
            selectedLabel={selectedRow?.userName ?? null}
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
          <PanelTable accent={ACCENT_AUP}>
            <DataTable
              columns={columns}
              data={displayRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </PanelTable>
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
    </Box>
  );
};

// ── Working Times panel ───────────────────────────────────────────────────────

const ACCENT_WT = '#0891b2';

interface WTPanelProps {
  profiles: IConfigConsultantProfile[];
  wTimes: IConfigConsultantWorkingTime[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantWorkingTime[]) => void;
}

const WorkingTimesPanel = ({
  profiles,
  wTimes,
  defaultConsultantId,
  onBack,
  onSave,
}: WTPanelProps) => {
  const [consultantId, setConsultantId] = useState(defaultConsultantId ?? '');
  const consultant = profiles.find((p) => p.id === consultantId) ?? null;
  const filtered = wTimes.filter((t) => t.consultantProfileId === consultantId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_WT);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
              timezone: editingRow.timezone,
            }
          : EMPTY_WT,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = filtered.find((r) => r.id === selectedId) ?? null;
  const displayRows = search
    ? filtered.filter((r) => r.timezone.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  const handleSubmit = () => {
    if (!form.startTime) return;
    let next: IConfigConsultantWorkingTime[];
    if (editingRow) {
      next = wTimes.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConsultantWorkingTime = {
        id: `wt_${Date.now()}`,
        consultantProfileId: consultantId,
        consultantName: consultant!.consultantName,
        ...form,
      };
      next = [...wTimes, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(wTimes.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigConsultantWorkingTime>[] = [
    { id: 'startTime', label: 'Start Time', minWidth: 120, format: mkCell(true) },
    { id: 'endTime', label: 'End Time', minWidth: 120, format: mkCell() },
    { id: 'timezone', label: 'Timezone', minWidth: 180, format: mkCell() },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        accent={ACCENT_WT}
        icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />}
        title='Working Times'
        onBack={onBack}
      />
      <ConsultantPicker
        accent={ACCENT_WT}
        profiles={profiles}
        value={consultantId}
        onChange={(id) => {
          setConsultantId(id);
          setSelectedId(null);
        }}
      />
      {!consultant ? (
        <NoPick text='Select a consultant above to view and manage working times.' />
      ) : (
        <>
          <PanelToolbar
            accent={ACCENT_WT}
            selectedLabel={selectedRow ? `${selectedRow.startTime} – ${selectedRow.endTime}` : null}
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
          <PanelTable accent={ACCENT_WT}>
            <DataTable
              columns={columns}
              data={displayRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </PanelTable>
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
    </Box>
  );
};

// ── Working Shift panel ───────────────────────────────────────────────────────

const ACCENT_WS = '#059669';

interface WSPanelProps {
  profiles: IConfigConsultantProfile[];
  wShifts: IConfigConsultantWorkingShift[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantWorkingShift[]) => void;
}

const WorkingShiftPanel = ({
  profiles,
  wShifts,
  defaultConsultantId,
  onBack,
  onSave,
}: WSPanelProps) => {
  const [consultantId, setConsultantId] = useState(defaultConsultantId ?? '');
  const consultant = profiles.find((p) => p.id === consultantId) ?? null;
  const filtered = wShifts.filter((s) => s.consultantProfileId === consultantId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantWorkingShift | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_WS);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? { shiftName: editingRow.shiftName, description: editingRow.description }
          : EMPTY_WS,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = filtered.find((r) => r.id === selectedId) ?? null;
  const displayRows = search
    ? filtered.filter(
        (r) =>
          r.shiftName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : filtered;

  const handleSubmit = () => {
    if (!form.shiftName.trim()) return;
    let next: IConfigConsultantWorkingShift[];
    if (editingRow) {
      next = wShifts.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConsultantWorkingShift = {
        id: `ws_${Date.now()}`,
        consultantProfileId: consultantId,
        consultantName: consultant!.consultantName,
        ...form,
      };
      next = [...wShifts, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(wShifts.filter((r) => r.id !== selectedRow.id));
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
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        accent={ACCENT_WS}
        icon={<UpdateIcon sx={{ fontSize: '1rem' }} />}
        title='Working Shifts'
        onBack={onBack}
      />
      <ConsultantPicker
        accent={ACCENT_WS}
        profiles={profiles}
        value={consultantId}
        onChange={(id) => {
          setConsultantId(id);
          setSelectedId(null);
        }}
      />
      {!consultant ? (
        <NoPick text='Select a consultant above to view and manage working shifts.' />
      ) : (
        <>
          <PanelToolbar
            accent={ACCENT_WS}
            selectedLabel={selectedRow?.shiftName ?? null}
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
          <PanelTable accent={ACCENT_WS}>
            <DataTable
              columns={columns}
              data={displayRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </PanelTable>
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
    </Box>
  );
};

// ── Timesheet Projects panel ──────────────────────────────────────────────────

const ACCENT_TP = '#0891b2';

const EMPTY_TP_FORM = {
  consultantProfileId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};

interface TPPanelProps {
  profiles: IConfigConsultantProfile[];
  tsProjects: IConfigConsultantTimesheetProject[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantTimesheetProject[]) => void;
}

const TimesheetProjectsPanel = ({
  profiles,
  tsProjects,
  defaultConsultantId,
  onBack,
  onSave,
}: TPPanelProps) => {
  const { classes } = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantTimesheetProject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    ...EMPTY_TP_FORM,
    consultantProfileId: defaultConsultantId ?? '',
  });

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              consultantProfileId: editingRow.consultantProfileId,
              project: editingRow.project,
              application: editingRow.application,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
            }
          : { ...EMPTY_TP_FORM, consultantProfileId: defaultConsultantId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = tsProjects.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? tsProjects.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.consultantName.toLowerCase().includes(search.toLowerCase()),
      )
    : tsProjects;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.consultantProfileId) return;
    const consultant = profiles.find((p) => p.id === form.consultantProfileId);
    if (!consultant) return;
    let next: IConfigConsultantTimesheetProject[];
    if (editingRow) {
      next = tsProjects.map((r) =>
        r.id === editingRow.id
          ? {
              ...editingRow,
              project: form.project,
              application: form.application,
              fromDate: form.fromDate,
              toDate: form.toDate,
              activate: form.activate,
              maxHoursPerDayPerResource: form.maxHoursPerDayPerResource,
            }
          : r,
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConsultantTimesheetProject = {
        id: `tp_${Date.now()}`,
        consultantProfileId: consultant.id,
        consultantName: consultant.consultantName,
        activate: form.activate,
        project: form.project,
        application: form.application,
        fromDate: form.fromDate,
        toDate: form.toDate,
        maxHoursPerDayPerResource: form.maxHoursPerDayPerResource,
      };
      next = [...tsProjects, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(tsProjects.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: IConfigConsultantTimesheetProject, val: boolean) => {
    onSave(tsProjects.map((r) => (r.id === row.id ? { ...r, activate: val } : r)));
  };

  const columns: Column<IConfigConsultantTimesheetProject>[] = [
    {
      id: 'project',
      label: 'Projects',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'consultantName',
      label: 'Consultant',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
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
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxHoursPerDayPerResource',
      label: 'Max Hrs Allowed / Day / Resource',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Chip
          label={`${v} hrs`}
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
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha(ACCENT_TP, 0.08),
          border: '1px solid',
          borderColor: alpha(ACCENT_TP, 0.25),
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
            color: ACCENT_TP,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_TP, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_TP, 0.3) }} />
        <ReceiptLongIcon sx={{ color: ACCENT_TP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_TP }}>
          Add Timesheet Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {tsProjects.length} project{tsProjects.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Toolbar */}
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
            <Tooltip title='Add a new timesheet project'>
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
            placeholder='Search projects…'
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
            Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>

      {/* Table */}
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

      {/* New / Edit dialog */}
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
        submitDisabled={!form.project.trim() || (!editingRow && !form.consultantProfileId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Consultant:
            </Typography>
            <Chip
              label={editingRow.consultantName}
              size='small'
              sx={{
                bgcolor: alpha(ACCENT_TP, 0.1),
                color: ACCENT_TP,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Consultant</InputLabel>
            <Select
              label='Consultant'
              value={form.consultantProfileId}
              onChange={(e) => setForm((f) => ({ ...f, consultantProfileId: e.target.value }))}
            >
              {profiles.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No consultants — add one first</em>
                </MenuItem>
              ) : (
                profiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.consultantName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
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
          label='Max Hours Allowed Per Day Per Resource'
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
          label={
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>
          }
        />
      </ConfigFormDialog>

      {/* Delete dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Timesheet Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

// ── Expense Projects panel ────────────────────────────────────────────────────

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

interface EPPanelProps {
  profiles: IConfigConsultantProfile[];
  exProjects: IConfigConsultantExpenseProject[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantExpenseProject[]) => void;
}

const ExpenseProjectsPanel = ({
  profiles,
  exProjects,
  defaultConsultantId,
  onBack,
  onSave,
}: EPPanelProps) => {
  const { classes } = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConsultantExpenseProject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    ...EMPTY_EP_FORM,
    consultantProfileId: defaultConsultantId ?? '',
  });

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              consultantProfileId: editingRow.consultantProfileId,
              project: editingRow.project,
              application: editingRow.application,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxAmountPerDay: editingRow.maxAmountPerDay,
            }
          : { ...EMPTY_EP_FORM, consultantProfileId: defaultConsultantId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = exProjects.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? exProjects.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.consultantName.toLowerCase().includes(search.toLowerCase()),
      )
    : exProjects;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.consultantProfileId) return;
    const consultant = profiles.find((p) => p.id === form.consultantProfileId);
    if (!consultant) return;
    let next: IConfigConsultantExpenseProject[];
    if (editingRow) {
      next = exProjects.map((r) =>
        r.id === editingRow.id
          ? {
              ...editingRow,
              project: form.project,
              application: form.application,
              fromDate: form.fromDate,
              toDate: form.toDate,
              activate: form.activate,
              maxAmountPerDay: form.maxAmountPerDay,
            }
          : r,
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConsultantExpenseProject = {
        id: `ep_${Date.now()}`,
        consultantProfileId: consultant.id,
        consultantName: consultant.consultantName,
        activate: form.activate,
        project: form.project,
        application: form.application,
        fromDate: form.fromDate,
        toDate: form.toDate,
        maxAmountPerDay: form.maxAmountPerDay,
      };
      next = [...exProjects, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(exProjects.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: IConfigConsultantExpenseProject, val: boolean) => {
    onSave(exProjects.map((r) => (r.id === row.id ? { ...r, activate: val } : r)));
  };

  const columns: Column<IConfigConsultantExpenseProject>[] = [
    {
      id: 'project',
      label: 'Expenses Project',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'consultantName',
      label: 'Consultant',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
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
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxAmountPerDay',
      label: 'Max Amount Allowed / Day / Resource',
      minWidth: 200,
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
    <Box sx={{ mt: 2 }}>
      {/* Header */}
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
        <Button
          size='small'
          variant='text'
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: 'none',
            color: ACCENT_EP,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_EP, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_EP, 0.3) }} />
        <AttachMoneyIcon sx={{ color: ACCENT_EP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_EP }}>
          Add Expenses Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {exProjects.length} project{exProjects.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Toolbar */}
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
            <Tooltip title='Add a new expense project'>
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
            placeholder='Search projects…'
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
            Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>

      {/* Table */}
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

      {/* New / Edit dialog */}
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
        submitDisabled={!form.project.trim() || (!editingRow && !form.consultantProfileId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Consultant:
            </Typography>
            <Chip
              label={editingRow.consultantName}
              size='small'
              sx={{
                bgcolor: alpha(ACCENT_EP, 0.1),
                color: ACCENT_EP,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Consultant</InputLabel>
            <Select
              label='Consultant'
              value={form.consultantProfileId}
              onChange={(e) => setForm((f) => ({ ...f, consultantProfileId: e.target.value }))}
            >
              {profiles.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No consultants — add one first</em>
                </MenuItem>
              ) : (
                profiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.consultantName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Expenses Project'
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
          label='Max Amount Allowed Per Day Per Resource ($)'
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
          label={
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>
          }
        />
      </ConfigFormDialog>

      {/* Delete dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

// ── Associated Consultant Profiles panel (inside Define Consultant Roles) ─────

const ACCENT_ACP = '#2563eb';

interface ACPPanelProps {
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  consultantRoles: IConfigConsultantRole[];
  onBack: () => void;
  onSave: (next: IConfigAssociatedConsultantProfile[]) => void;
}

const AssocConsProfilesPanel = ({
  assocConsProfiles,
  applications,
  consultantRoles,
  onBack,
  onSave,
}: ACPPanelProps) => {
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
          r.description.toLowerCase().includes(search.toLowerCase()),
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
          bgcolor: alpha(ACCENT_ACP, 0.08),
          border: '1px solid',
          borderColor: alpha(ACCENT_ACP, 0.25),
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
            color: ACCENT_ACP,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            '&:hover': { bgcolor: alpha(ACCENT_ACP, 0.1) },
          }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_ACP, 0.3) }} />
        <GroupIcon sx={{ color: ACCENT_ACP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_ACP }}>
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

const ACCENT_CR = '#7c3aed';

interface CRSectionProps {
  roles: IConfigConsultantRole[];
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  onSaveRoles: (next: IConfigConsultantRole[]) => void;
  onSaveAssocConsProfiles: (next: IConfigAssociatedConsultantProfile[]) => void;
}

const DefineConsultantRolesSection = ({
  roles,
  assocConsProfiles,
  applications,
  onSaveRoles,
  onSaveAssocConsProfiles,
}: CRSectionProps) => {
  const { classes } = useStyles();
  const [crPanel, setCrPanel] = useState<'none' | 'assocProfiles'>('none');
  const panelActive = crPanel !== 'none';

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
          r.description.toLowerCase().includes(search.toLowerCase()),
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
              {!panelActive &&
                (!selectedRow ? (
                  <Tooltip title='Add a new consultant role'>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingRow(null);
                        setDialogOpen(true);
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
                        setEditingRow(selectedRow);
                        setDialogOpen(true);
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
                startIcon={<GroupIcon />}
                variant={crPanel === 'assocProfiles' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() =>
                  setCrPanel((p) => (p === 'assocProfiles' ? 'none' : 'assocProfiles'))
                }
                sx={{ textTransform: 'none' }}
              >
                Associated Consultant Profiles
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
            {!panelActive && selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.roleName}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* Main table */}
          {!panelActive && (
            <Paper elevation={1} className={classes.tablePaper}>
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
          )}

          {/* Panel */}
          {crPanel === 'assocProfiles' && (
            <AssocConsProfilesPanel
              assocConsProfiles={assocConsProfiles}
              applications={applications}
              consultantRoles={roles}
              onBack={() => setCrPanel('none')}
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

const EMPTY_CP_FORM = EMPTY_CP;

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
  const [cpForm, setCpForm] = useState(EMPTY_CP_FORM);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;
  const panelActive = activePanel !== 'none';
  const togglePanel = (p: ActivePanel) => setActivePanel((prev) => (prev === p ? 'none' : p));

  const filteredProfiles = search
    ? profiles.filter(
        (p) =>
          p.consultantName.toLowerCase().includes(search.toLowerCase()) ||
          p.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          p.consultantRole.toLowerCase().includes(search.toLowerCase()) ||
          p.workingCalendar.toLowerCase().includes(search.toLowerCase()) ||
          p.leadConsultant.toLowerCase().includes(search.toLowerCase()) ||
          p.manager.toLowerCase().includes(search.toLowerCase()),
      )
    : profiles;

  useEffect(() => {
    if (editOpen) {
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
          : EMPTY_CP_FORM,
      );
    }
  }, [editOpen, editingProfile]);

  const handleAppChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setCpForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleProfileSubmit = () => {
    if (!cpForm.consultantName.trim()) return;
    let next: IConfigConsultantProfile[];
    if (editingProfile) {
      next = profiles.map((p) =>
        p.id === editingProfile.id ? { ...editingProfile, ...cpForm } : p,
      );
      setSelectedId(editingProfile.id);
    } else {
      const n: IConfigConsultantProfile = { id: `cp_${Date.now()}`, ...cpForm };
      next = [...profiles, n];
      setSelectedId(n.id);
    }
    setProfiles(next);
    saveAll({ profiles: next });
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
    { id: 'consultantRole', label: 'Consultant Role', minWidth: 140, format: mkCell() },
    { id: 'workingCalendar', label: 'Working Calendar', minWidth: 150, format: mkCell() },
    { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 150, format: mkCell() },
    { id: 'leadConsultant', label: 'Lead Consultant', minWidth: 140, format: mkCell() },
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
                bgcolor: '#d97706',
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
            <Box className={classes.toolbarButtons}>
              {/* New / Edit / Delete — conditional on row, hidden when panel active */}
              {!panelActive &&
                (!selectedProfile ? (
                  <Tooltip title='Add new consultant profile'>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingProfile(null);
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
                        setEditingProfile(selectedProfile);
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

              {/* Action buttons — always visible and enabled, toggle panels */}
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
                startIcon={<AccessTimeIcon />}
                variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('workingTimes')}
                sx={{ textTransform: 'none' }}
              >
                Working Times
              </Button>
              <Button
                size='small'
                startIcon={<UpdateIcon />}
                variant={activePanel === 'workingShift' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('workingShift')}
                sx={{ textTransform: 'none' }}
              >
                Update Working Shift
              </Button>
              <Button
                size='small'
                startIcon={<ReceiptLongIcon />}
                variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('timesheet')}
                sx={{ textTransform: 'none' }}
              >
                Add Timesheet Projects
              </Button>
              <Button
                size='small'
                startIcon={<AttachMoneyIcon />}
                variant={activePanel === 'expense' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => togglePanel('expense')}
                sx={{ textTransform: 'none' }}
              >
                Add Expense Projects
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
            {!panelActive && selectedProfile && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedProfile.consultantName}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* ── Main table — hidden when panel active ── */}
          {!panelActive && (
            <Paper elevation={1} className={classes.tablePaper}>
              <DataTable
                columns={profileColumns}
                data={filteredProfiles}
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
              profiles={profiles}
              assocUsers={assocUsers}
              defaultConsultantId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setAssocUsers(next);
                saveAll({ associatedUserProfiles: next });
              }}
            />
          )}
          {activePanel === 'workingTimes' && (
            <WorkingTimesPanel
              profiles={profiles}
              wTimes={wTimes}
              defaultConsultantId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setWTimes(next);
                saveAll({ workingTimes: next });
              }}
            />
          )}
          {activePanel === 'workingShift' && (
            <WorkingShiftPanel
              profiles={profiles}
              wShifts={wShifts}
              defaultConsultantId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setWShifts(next);
                saveAll({ workingShifts: next });
              }}
            />
          )}
          {activePanel === 'timesheet' && (
            <TimesheetProjectsPanel
              profiles={profiles}
              tsProjects={tsProjects}
              defaultConsultantId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setTsProjects(next);
                saveAll({ timesheetProjects: next });
              }}
            />
          )}
          {activePanel === 'expense' && (
            <ExpenseProjectsPanel
              profiles={profiles}
              exProjects={exProjects}
              defaultConsultantId={selectedId}
              onBack={() => setActivePanel('none')}
              onSave={(next) => {
                setExProjects(next);
                saveAll({ expenseProjects: next });
              }}
            />
          )}
        </AccordionDetails>
      </Accordion>

      {/* ── Define Consultant Roles (+ Associated Consultant Profiles panel) ── */}
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
        accent='#d97706'
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
        {editingProfile ? (
          <TextField
            label='Application'
            size='small'
            fullWidth
            value={cpForm.applicationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={cpForm.applicationId}
              onChange={(e) => handleAppChange(e.target.value)}
            >
              {applications.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
