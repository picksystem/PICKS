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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
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
import {
  IConfigConsultantProfile,
  IConfigAssociatedUserProfile,
  IConfigConsultantWorkingTime,
  IConfigConsultantWorkingShift,
  IConfigConsultantTimesheetProject,
  IConfigConsultantExpenseProject,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';

// ── Shared helpers ────────────────────────────────────────────────────────────

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

const RecordItem = ({
  label,
  sub,
  onRemove,
}: {
  label: string;
  sub?: string;
  onRemove: () => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 0.75,
      px: 1.5,
      '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
    }}
  >
    <Box>
      <Typography variant='body2' fontWeight={500}>
        {label}
      </Typography>
      {sub && (
        <Typography variant='caption' color='text.secondary'>
          {sub}
        </Typography>
      )}
    </Box>
    <IconButton size='small' color='error' onClick={onRemove}>
      <DeleteIcon fontSize='small' />
    </IconButton>
  </Box>
);

// ── Empty form defaults ───────────────────────────────────────────────────────

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
const EMPTY_TP = { project: '', application: '', fromDate: '', toDate: '', maxHoursPerDayPerResource: 8 };
const EMPTY_EP = { project: '', application: '', fromDate: '', toDate: '', maxAmountPerDay: 0 };

// ── Component ─────────────────────────────────────────────────────────────────

const ConsultantProfiles = () => {
  const { classes } = useStyles();
  const { consultantProfiles: api, categorization: apiCat, saveSection } = useConfiguration();
  const applications = apiCat?.applications ?? [];

  // ── All sub-array state ──────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState<IConfigConsultantProfile[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigAssociatedUserProfile[]>([]);
  const [wTimes, setWTimes] = useState<IConfigConsultantWorkingTime[]>([]);
  const [wShifts, setWShifts] = useState<IConfigConsultantWorkingShift[]>([]);
  const [tsProjects, setTsProjects] = useState<IConfigConsultantTimesheetProject[]>([]);
  const [exProjects, setExProjects] = useState<IConfigConsultantExpenseProject[]>([]);

  useEffect(() => {
    if (api) {
      setProfiles(api.profiles ?? []);
      setAssocUsers(api.associatedUserProfiles ?? []);
      setWTimes(api.workingTimes ?? []);
      setWShifts(api.workingShifts ?? []);
      setTsProjects(api.timesheetProjects ?? []);
      setExProjects(api.expenseProjects ?? []);
    }
  }, [api]);

  // ── Save helper — always writes all 6 arrays ─────────────────────────────────
  const saveAll = (overrides: {
    profiles?: IConfigConsultantProfile[];
    associatedUserProfiles?: IConfigAssociatedUserProfile[];
    workingTimes?: IConfigConsultantWorkingTime[];
    workingShifts?: IConfigConsultantWorkingShift[];
    timesheetProjects?: IConfigConsultantTimesheetProject[];
    expenseProjects?: IConfigConsultantExpenseProject[];
  }) => {
    saveSection('consultantProfiles', {
      profiles: overrides.profiles ?? profiles,
      associatedUserProfiles: overrides.associatedUserProfiles ?? assocUsers,
      workingTimes: overrides.workingTimes ?? wTimes,
      workingShifts: overrides.workingShifts ?? wShifts,
      timesheetProjects: overrides.timesheetProjects ?? tsProjects,
      expenseProjects: overrides.expenseProjects ?? exProjects,
    });
  };

  // ── Main table state ─────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IConfigConsultantProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cpForm, setCpForm] = useState(EMPTY_CP);

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

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
          : EMPTY_CP,
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
      next = profiles.map((p) => (p.id === editingProfile.id ? { ...editingProfile, ...cpForm } : p));
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

  // ── Sub-dialog open states ───────────────────────────────────────────────────
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [workingTimesOpen, setWorkingTimesOpen] = useState(false);
  const [workingShiftOpen, setWorkingShiftOpen] = useState(false);
  const [timesheetOpen, setTimesheetOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  // ── Associated User Profiles sub-dialog ──────────────────────────────────────
  const [aupForm, setAupForm] = useState(EMPTY_AUP);
  const [aupAddOpen, setAupAddOpen] = useState(false);
  const consultantAssocUsers = assocUsers.filter((u) => u.consultantProfileId === selectedId);

  const addAssocUser = () => {
    if (!aupForm.userName.trim()) return;
    const n: IConfigAssociatedUserProfile = {
      id: `aup_${Date.now()}`,
      consultantProfileId: selectedId!,
      consultantName: selectedProfile!.consultantName,
      ...aupForm,
    };
    const next = [...assocUsers, n];
    setAssocUsers(next);
    saveAll({ associatedUserProfiles: next });
    setAupForm(EMPTY_AUP);
    setAupAddOpen(false);
  };

  const removeAssocUser = (id: string) => {
    const next = assocUsers.filter((u) => u.id !== id);
    setAssocUsers(next);
    saveAll({ associatedUserProfiles: next });
  };

  // ── Working Times sub-dialog ─────────────────────────────────────────────────
  const [wtForm, setWtForm] = useState(EMPTY_WT);
  const [wtAddOpen, setWtAddOpen] = useState(false);
  const consultantWTimes = wTimes.filter((t) => t.consultantProfileId === selectedId);

  const addWorkingTime = () => {
    if (!wtForm.startTime) return;
    const n: IConfigConsultantWorkingTime = {
      id: `wt_${Date.now()}`,
      consultantProfileId: selectedId!,
      consultantName: selectedProfile!.consultantName,
      ...wtForm,
    };
    const next = [...wTimes, n];
    setWTimes(next);
    saveAll({ workingTimes: next });
    setWtForm(EMPTY_WT);
    setWtAddOpen(false);
  };

  const removeWorkingTime = (id: string) => {
    const next = wTimes.filter((t) => t.id !== id);
    setWTimes(next);
    saveAll({ workingTimes: next });
  };

  // ── Working Shifts sub-dialog ────────────────────────────────────────────────
  const [wsForm, setWsForm] = useState(EMPTY_WS);
  const [wsAddOpen, setWsAddOpen] = useState(false);
  const consultantWShifts = wShifts.filter((s) => s.consultantProfileId === selectedId);

  const addWorkingShift = () => {
    if (!wsForm.shiftName.trim()) return;
    const n: IConfigConsultantWorkingShift = {
      id: `ws_${Date.now()}`,
      consultantProfileId: selectedId!,
      consultantName: selectedProfile!.consultantName,
      ...wsForm,
    };
    const next = [...wShifts, n];
    setWShifts(next);
    saveAll({ workingShifts: next });
    setWsForm(EMPTY_WS);
    setWsAddOpen(false);
  };

  const removeWorkingShift = (id: string) => {
    const next = wShifts.filter((s) => s.id !== id);
    setWShifts(next);
    saveAll({ workingShifts: next });
  };

  // ── Timesheet Projects sub-dialog ────────────────────────────────────────────
  const [tpForm, setTpForm] = useState(EMPTY_TP);
  const [tpAddOpen, setTpAddOpen] = useState(false);
  const consultantTsProjects = tsProjects.filter((p) => p.consultantProfileId === selectedId);

  const addTimesheetProject = () => {
    if (!tpForm.project.trim()) return;
    const n: IConfigConsultantTimesheetProject = {
      id: `tp_${Date.now()}`,
      consultantProfileId: selectedId!,
      consultantName: selectedProfile!.consultantName,
      ...tpForm,
    };
    const next = [...tsProjects, n];
    setTsProjects(next);
    saveAll({ timesheetProjects: next });
    setTpForm(EMPTY_TP);
    setTpAddOpen(false);
  };

  const removeTimesheetProject = (id: string) => {
    const next = tsProjects.filter((p) => p.id !== id);
    setTsProjects(next);
    saveAll({ timesheetProjects: next });
  };

  // ── Expense Projects sub-dialog ──────────────────────────────────────────────
  const [epForm, setEpForm] = useState(EMPTY_EP);
  const [epAddOpen, setEpAddOpen] = useState(false);
  const consultantExProjects = exProjects.filter((p) => p.consultantProfileId === selectedId);

  const addExpenseProject = () => {
    if (!epForm.project.trim()) return;
    const n: IConfigConsultantExpenseProject = {
      id: `ep_${Date.now()}`,
      consultantProfileId: selectedId!,
      consultantName: selectedProfile!.consultantName,
      ...epForm,
    };
    const next = [...exProjects, n];
    setExProjects(next);
    saveAll({ expenseProjects: next });
    setEpForm(EMPTY_EP);
    setEpAddOpen(false);
  };

  const removeExpenseProject = (id: string) => {
    const next = exProjects.filter((p) => p.id !== id);
    setExProjects(next);
    saveAll({ expenseProjects: next });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box className={classes.container}>
      {/* ── Single accordion ── */}
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
              {!selectedProfile ? (
                <Tooltip title='Add new consultant profile'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => { setEditingProfile(null); setEditOpen(true); }}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                    onClick={() => { setEditingProfile(selectedProfile); setEditOpen(true); }}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Delete
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<PersonIcon />}
                    onClick={() => setUserProfileOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    View Associated User Profile
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<AccessTimeIcon />}
                    onClick={() => setWorkingTimesOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Working Times
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<UpdateIcon />}
                    onClick={() => setWorkingShiftOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Update Working Shift
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => setTimesheetOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Add Timesheet Projects
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => setExpenseOpen(true)}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Add Expense Projects
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
                        <SearchIcon fontSize='small' />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            {selectedProfile && (
              <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
                Selected: <strong>{selectedProfile.consultantName}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* ── Main table ── */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
        </AccordionDetails>
      </Accordion>

      {/* ── New / Edit Profile Dialog ── */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingProfile(null); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingProfile ? 'Edit Consultant Profile' : 'New Consultant Profile'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <TextField
              label='Consultant Name'
              size='small'
              fullWidth
              required
              value={cpForm.consultantName}
              onChange={(e) => setCpForm((f) => ({ ...f, consultantName: e.target.value }))}
            />
            {editingProfile ? (
              <TextField label='Application' size='small' fullWidth value={cpForm.applicationName} disabled />
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => { setEditOpen(false); setEditingProfile(null); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleProfileSubmit}
            disabled={!cpForm.consultantName.trim()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {editingProfile ? 'Save Changes' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Consultant Profile</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete <strong>{selectedProfile?.consultantName}</strong>? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleProfileDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Associated User Profile Dialog ── */}
      <Dialog
        open={userProfileOpen}
        onClose={() => { setUserProfileOpen(false); setAupAddOpen(false); setAupForm(EMPTY_AUP); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Associated User Profiles — {selectedProfile?.consultantName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {aupAddOpen && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>
                Add User Profile
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label='User ID'
                  size='small'
                  fullWidth
                  value={aupForm.userId}
                  onChange={(e) => setAupForm((f) => ({ ...f, userId: e.target.value }))}
                />
                <TextField
                  label='User Name'
                  size='small'
                  fullWidth
                  required
                  value={aupForm.userName}
                  onChange={(e) => setAupForm((f) => ({ ...f, userName: e.target.value }))}
                />
                <TextField
                  label='Email'
                  size='small'
                  fullWidth
                  value={aupForm.email}
                  onChange={(e) => setAupForm((f) => ({ ...f, email: e.target.value }))}
                />
                <TextField
                  label='Role'
                  size='small'
                  fullWidth
                  value={aupForm.role}
                  onChange={(e) => setAupForm((f) => ({ ...f, role: e.target.value }))}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={addAssocUser}
                  disabled={!aupForm.userName.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  onClick={() => { setAupAddOpen(false); setAupForm(EMPTY_AUP); }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                User Profiles ({consultantAssocUsers.length})
              </Typography>
              {!aupAddOpen && (
                <Button
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={() => setAupAddOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              )}
            </Box>
            {consultantAssocUsers.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No associated user profiles yet.
              </Typography>
            ) : (
              <Paper variant='outlined' sx={{ borderRadius: 1.5 }}>
                {consultantAssocUsers.map((u) => (
                  <RecordItem
                    key={u.id}
                    label={u.userName}
                    sub={[u.email, u.role].filter(Boolean).join(' · ')}
                    onRemove={() => removeAssocUser(u.id)}
                  />
                ))}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => { setUserProfileOpen(false); setAupAddOpen(false); setAupForm(EMPTY_AUP); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Working Times Dialog ── */}
      <Dialog
        open={workingTimesOpen}
        onClose={() => { setWorkingTimesOpen(false); setWtAddOpen(false); setWtForm(EMPTY_WT); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Working Times — {selectedProfile?.consultantName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {wtAddOpen && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>
                Add Working Time
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label='Start Time'
                  type='time'
                  size='small'
                  fullWidth
                  value={wtForm.startTime}
                  onChange={(e) => setWtForm((f) => ({ ...f, startTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='End Time'
                  type='time'
                  size='small'
                  fullWidth
                  value={wtForm.endTime}
                  onChange={(e) => setWtForm((f) => ({ ...f, endTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='Timezone'
                  size='small'
                  fullWidth
                  value={wtForm.timezone}
                  onChange={(e) => setWtForm((f) => ({ ...f, timezone: e.target.value }))}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={addWorkingTime}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  onClick={() => { setWtAddOpen(false); setWtForm(EMPTY_WT); }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Working Times ({consultantWTimes.length})
              </Typography>
              {!wtAddOpen && (
                <Button
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={() => setWtAddOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              )}
            </Box>
            {consultantWTimes.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No working times configured yet.
              </Typography>
            ) : (
              <Paper variant='outlined' sx={{ borderRadius: 1.5 }}>
                {consultantWTimes.map((t) => (
                  <RecordItem
                    key={t.id}
                    label={`${t.startTime} – ${t.endTime}`}
                    sub={t.timezone || undefined}
                    onRemove={() => removeWorkingTime(t.id)}
                  />
                ))}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => { setWorkingTimesOpen(false); setWtAddOpen(false); setWtForm(EMPTY_WT); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Update Working Shift Dialog ── */}
      <Dialog
        open={workingShiftOpen}
        onClose={() => { setWorkingShiftOpen(false); setWsAddOpen(false); setWsForm(EMPTY_WS); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Working Shifts — {selectedProfile?.consultantName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {wsAddOpen && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>
                Add Working Shift
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label='Shift Name'
                  size='small'
                  fullWidth
                  required
                  value={wsForm.shiftName}
                  onChange={(e) => setWsForm((f) => ({ ...f, shiftName: e.target.value }))}
                />
                <TextField
                  label='Description'
                  size='small'
                  fullWidth
                  multiline
                  minRows={2}
                  value={wsForm.description}
                  onChange={(e) => setWsForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={addWorkingShift}
                  disabled={!wsForm.shiftName.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  onClick={() => { setWsAddOpen(false); setWsForm(EMPTY_WS); }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Working Shifts ({consultantWShifts.length})
              </Typography>
              {!wsAddOpen && (
                <Button
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={() => setWsAddOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              )}
            </Box>
            {consultantWShifts.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No working shifts configured yet.
              </Typography>
            ) : (
              <Paper variant='outlined' sx={{ borderRadius: 1.5 }}>
                {consultantWShifts.map((s) => (
                  <RecordItem
                    key={s.id}
                    label={s.shiftName}
                    sub={s.description || undefined}
                    onRemove={() => removeWorkingShift(s.id)}
                  />
                ))}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => { setWorkingShiftOpen(false); setWsAddOpen(false); setWsForm(EMPTY_WS); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Timesheet Projects Dialog ── */}
      <Dialog
        open={timesheetOpen}
        onClose={() => { setTimesheetOpen(false); setTpAddOpen(false); setTpForm(EMPTY_TP); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Timesheet Projects — {selectedProfile?.consultantName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {tpAddOpen && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>
                Add Timesheet Project
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label='Project'
                  size='small'
                  fullWidth
                  required
                  value={tpForm.project}
                  onChange={(e) => setTpForm((f) => ({ ...f, project: e.target.value }))}
                />
                <TextField
                  label='Application'
                  size='small'
                  fullWidth
                  value={tpForm.application}
                  onChange={(e) => setTpForm((f) => ({ ...f, application: e.target.value }))}
                />
                <TextField
                  label='From Date'
                  type='date'
                  size='small'
                  fullWidth
                  value={tpForm.fromDate}
                  onChange={(e) => setTpForm((f) => ({ ...f, fromDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='To Date'
                  type='date'
                  size='small'
                  fullWidth
                  value={tpForm.toDate}
                  onChange={(e) => setTpForm((f) => ({ ...f, toDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='Max Hours Per Day Per Resource'
                  type='number'
                  size='small'
                  fullWidth
                  value={tpForm.maxHoursPerDayPerResource}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setTpForm((f) => ({ ...f, maxHoursPerDayPerResource: isNaN(v) || v < 0 ? 0 : v }));
                  }}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={addTimesheetProject}
                  disabled={!tpForm.project.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  onClick={() => { setTpAddOpen(false); setTpForm(EMPTY_TP); }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Timesheet Projects ({consultantTsProjects.length})
              </Typography>
              {!tpAddOpen && (
                <Button
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={() => setTpAddOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              )}
            </Box>
            {consultantTsProjects.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No timesheet projects assigned yet.
              </Typography>
            ) : (
              <Paper variant='outlined' sx={{ borderRadius: 1.5 }}>
                {consultantTsProjects.map((p) => (
                  <RecordItem
                    key={p.id}
                    label={p.project}
                    sub={[p.application, p.fromDate && `${p.fromDate} – ${p.toDate}`, `Max ${p.maxHoursPerDayPerResource}h/day`].filter(Boolean).join(' · ')}
                    onRemove={() => removeTimesheetProject(p.id)}
                  />
                ))}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => { setTimesheetOpen(false); setTpAddOpen(false); setTpForm(EMPTY_TP); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Expense Projects Dialog ── */}
      <Dialog
        open={expenseOpen}
        onClose={() => { setExpenseOpen(false); setEpAddOpen(false); setEpForm(EMPTY_EP); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Expense Projects — {selectedProfile?.consultantName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {epAddOpen && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>
                Add Expense Project
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label='Project'
                  size='small'
                  fullWidth
                  required
                  value={epForm.project}
                  onChange={(e) => setEpForm((f) => ({ ...f, project: e.target.value }))}
                />
                <TextField
                  label='Application'
                  size='small'
                  fullWidth
                  value={epForm.application}
                  onChange={(e) => setEpForm((f) => ({ ...f, application: e.target.value }))}
                />
                <TextField
                  label='From Date'
                  type='date'
                  size='small'
                  fullWidth
                  value={epForm.fromDate}
                  onChange={(e) => setEpForm((f) => ({ ...f, fromDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='To Date'
                  type='date'
                  size='small'
                  fullWidth
                  value={epForm.toDate}
                  onChange={(e) => setEpForm((f) => ({ ...f, toDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label='Max Amount Per Day'
                  type='number'
                  size='small'
                  fullWidth
                  value={epForm.maxAmountPerDay}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setEpForm((f) => ({ ...f, maxAmountPerDay: isNaN(v) || v < 0 ? 0 : v }));
                  }}
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={addExpenseProject}
                  disabled={!epForm.project.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
                <Button
                  size='small'
                  onClick={() => { setEpAddOpen(false); setEpForm(EMPTY_EP); }}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Expense Projects ({consultantExProjects.length})
              </Typography>
              {!epAddOpen && (
                <Button
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={() => setEpAddOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              )}
            </Box>
            {consultantExProjects.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No expense projects assigned yet.
              </Typography>
            ) : (
              <Paper variant='outlined' sx={{ borderRadius: 1.5 }}>
                {consultantExProjects.map((p) => (
                  <RecordItem
                    key={p.id}
                    label={p.project}
                    sub={[p.application, p.fromDate && `${p.fromDate} – ${p.toDate}`, `Max $${p.maxAmountPerDay}/day`].filter(Boolean).join(' · ')}
                    onRemove={() => removeExpenseProject(p.id)}
                  />
                ))}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => { setExpenseOpen(false); setEpAddOpen(false); setEpForm(EMPTY_EP); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultantProfiles;
