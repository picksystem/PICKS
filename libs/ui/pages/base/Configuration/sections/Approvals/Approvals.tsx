import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
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
import ClearIcon from '@mui/icons-material/Clear';
import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';

// ── Table config (inline to avoid JSON module issues) ────────────────────────

const tableConfig = {
  tables: {
    approvalRecords: {
      columns: [
        { id: 'consultant', label: 'Consultant', minWidth: 150, bold: true },
        { id: 'application', label: 'Application', minWidth: 140 },
        { id: 'consultantRole', label: 'Consultant Role', minWidth: 150 },
        { id: 'slaWorkingTimeCalendar', label: 'SLA Working Time Calendar', minWidth: 190 },
        { id: 'slaExceptionGroup', label: 'SLA Exception Group', minWidth: 170 },
        { id: 'leadConsultant', label: 'Lead Consultant', minWidth: 150 },
        { id: 'manager', label: 'Manager', minWidth: 130 },
      ],
      fields: [
        { name: 'consultant', label: 'Consultant', required: true },
        { name: 'application', label: 'Application' },
        { name: 'consultantRole', label: 'Consultant Role' },
        { name: 'slaWorkingTimeCalendar', label: 'SLA Working Time Calendar' },
        { name: 'slaExceptionGroup', label: 'SLA Exception Group' },
        { name: 'leadConsultant', label: 'Lead Consultant' },
        { name: 'manager', label: 'Manager' },
      ],
    },
    assocUserProfiles: {
      columns: [
        { id: 'userId', label: 'User ID', minWidth: 110 },
        { id: 'userName', label: 'User Name', minWidth: 150, bold: true },
        { id: 'email', label: 'Email', minWidth: 200 },
        { id: 'department', label: 'Department', minWidth: 150 },
      ],
      fields: [
        { name: 'userId', label: 'User ID' },
        { name: 'userName', label: 'User Name' },
        { name: 'email', label: 'Email' },
        { name: 'department', label: 'Department' },
      ],
    },
    consultantRoles: {
      columns: [
        { id: 'roleName', label: 'Role Name', minWidth: 150, bold: true },
        { id: 'description', label: 'Description', minWidth: 200 },
        { id: 'level', label: 'Level', minWidth: 100 },
      ],
      fields: [
        { name: 'roleName', label: 'Role Name', required: true },
        { name: 'description', label: 'Description' },
        { name: 'level', label: 'Level' },
      ],
    },
    workingTimes: {
      columns: [
        { id: 'startTime', label: 'Start Time', minWidth: 120, bold: true },
        { id: 'endTime', label: 'End Time', minWidth: 120 },
        { id: 'timezone', label: 'Timezone', minWidth: 180 },
      ],
      fields: [
        { name: 'startTime', label: 'Start Time', type: 'time', defaultValue: '09:00' },
        { name: 'endTime', label: 'End Time', type: 'time', defaultValue: '17:00' },
        { name: 'timezone', label: 'Timezone' },
      ],
    },
  },
};

const ACCENT_RECORDS = '#0369a1';
const ACCENT_AUP = '#2563eb';
const ACCENT_CR = '#7c3aed';
const ACCENT_WT = '#0891b2';

type ActiveView = 'records' | 'userProfile' | 'consultantRoles' | 'workingTimes';

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

// ── Records panel ──────────────────────────────────────────────────────────────

const EMPTY_RECORD = {
  consultant: '',
  application: '',
  consultantRole: '',
  slaWorkingTimeCalendar: '',
  slaExceptionGroup: '',
  leadConsultant: '',
  manager: '',
};

const ApprovalRecordsPanel = ({
  data,
  onSave,
}: {
  data: IConfigApprovalRecord[];
  onSave: (records: IConfigApprovalRecord[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_RECORD);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            consultant: editingRow.consultant,
            application: editingRow.application,
            consultantRole: editingRow.consultantRole,
            slaWorkingTimeCalendar: editingRow.slaWorkingTimeCalendar,
            slaExceptionGroup: editingRow.slaExceptionGroup,
            leadConsultant: editingRow.leadConsultant,
            manager: editingRow.manager,
          }
        : { ...EMPTY_RECORD },
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.consultant.toLowerCase().includes(search.toLowerCase()) ||
          r.application?.toLowerCase().includes(search.toLowerCase()) ||
          r.consultantRole?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (!form.consultant.trim()) return;
    if (editingRow) {
      const updated = data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApprovalRecord = { id: `ar_${Date.now()}`, ...form };
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

  const columns: Column<IConfigApprovalRecord>[] = useMemo(
    () =>
      tableConfig.tables.approvalRecords.columns.map((col: any) => ({
        id: col.id,
        label: col.label,
        minWidth: col.minWidth ?? 100,
        format: (v): React.ReactNode => (
          <Typography
            variant='body2'
            sx={{
              fontSize: col.bold ? '0.82rem' : '0.8rem',
              fontWeight: col.bold ? 600 : 400,
              color: v ? 'text.primary' : 'text.disabled',
            }}
          >
            {String(v || '—')}
          </Typography>
        ),
      })),
    [],
  );

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <PanelHeader
          icon={<HowToRegIcon sx={{ fontSize: '1.1rem' }} />}
          title='Approval Records'
          count={data.length}
          countLabel='record'
          accent={ACCENT_RECORDS}
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
              <Tooltip title='Add new approval record'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: ACCENT_RECORDS,
                    '&:hover': { bgcolor: alpha(ACCENT_RECORDS, 0.85) },
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
                    bgcolor: ACCENT_RECORDS,
                    '&:hover': { bgcolor: alpha(ACCENT_RECORDS, 0.85) },
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
                    bgcolor: alpha(ACCENT_RECORDS, 0.3),
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
            borderColor: alpha(ACCENT_RECORDS, 0.25),
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
        icon={<HowToRegIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_RECORDS}
        title={editingRow ? 'Edit Approval Record' : 'New Approval Record'}
        subtitle='Configure consultant, application, and SLA settings'
        submitDisabled={!form.consultant.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {tableConfig.tables.approvalRecords.fields.map((field: any) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            required={field.required}
            value={form[field.name as keyof typeof form] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
          />
        ))}
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Approval Record'
        itemName={selectedRow?.consultant ?? ''}
      />
    </>
  );
};

// ── User Profiles panel ────────────────────────────────────────────────────────

const AssocUserProfilesPanel = ({
  data,
  onSave,
}: {
  data: IConfigApprovalAssocUserProfile[];
  onSave: (data: IConfigApprovalAssocUserProfile[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalAssocUserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const emptyForm = () => {
    const f: Record<string, string> = {};
    tableConfig.tables.assocUserProfiles.fields.forEach((field: any) => {
      f[field.name] = '';
    });
    return f;
  };

  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRow) {
      const f: Record<string, string> = {};
      tableConfig.tables.assocUserProfiles.fields.forEach((field: any) => {
        f[field.name] = String(
          editingRow[field.name as keyof IConfigApprovalAssocUserProfile] ?? '',
        );
      });
      setForm(f);
    } else {
      setForm(emptyForm());
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.userName?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (editingRow) {
      const updated = data.map((r) =>
        r.id === editingRow.id
          ? ({ ...editingRow, ...form } as IConfigApprovalAssocUserProfile)
          : r,
      );
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `up_${Date.now()}`, ...form } as IConfigApprovalAssocUserProfile;
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

  const columns: Column<IConfigApprovalAssocUserProfile>[] = useMemo(
    () =>
      tableConfig.tables.assocUserProfiles.columns.map((col: any) => ({
        id: col.id,
        label: col.label,
        minWidth: col.minWidth ?? 100,
        format: (v): React.ReactNode => (
          <Typography
            variant='body2'
            sx={{
              fontSize: col.bold ? '0.82rem' : '0.8rem',
              fontWeight: col.bold ? 600 : 400,
              color: v ? 'text.primary' : 'text.disabled',
            }}
          >
            {String(v || '—')}
          </Typography>
        ),
      })),
    [],
  );

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
        title={editingRow ? 'Edit User Profile' : 'New User Profile'}
        subtitle='Configure user profile settings'
        submitDisabled={false}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {tableConfig.tables.assocUserProfiles.fields.map((field: any) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            required={field.required}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
          />
        ))}
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='User Profile'
        itemName={selectedRow?.userName ?? ''}
      />
    </>
  );
};

// ── Consultant Roles panel ──────────────────────────────────────────────────────

const ConsultantRolesPanel = ({
  data,
  onSave,
}: {
  data: IConfigApprovalConsultantRole[];
  onSave: (data: IConfigApprovalConsultantRole[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalConsultantRole | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const emptyForm = () => {
    const f: Record<string, string> = {};
    tableConfig.tables.consultantRoles.fields.forEach((field: any) => {
      f[field.name] = '';
    });
    return f;
  };

  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRow) {
      const f: Record<string, string> = {};
      tableConfig.tables.consultantRoles.fields.forEach((field: any) => {
        f[field.name] = String(editingRow[field.name as keyof IConfigApprovalConsultantRole] ?? '');
      });
      setForm(f);
    } else {
      setForm(emptyForm());
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.roleName?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (editingRow) {
      const updated = data.map((r) =>
        r.id === editingRow.id ? ({ ...editingRow, ...form } as IConfigApprovalConsultantRole) : r,
      );
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `cr_${Date.now()}`, ...form } as IConfigApprovalConsultantRole;
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

  const columns: Column<IConfigApprovalConsultantRole>[] = useMemo(
    () =>
      tableConfig.tables.consultantRoles.columns.map((col: any) => ({
        id: col.id,
        label: col.label,
        minWidth: col.minWidth ?? 100,
        format: (v): React.ReactNode => (
          <Typography
            variant='body2'
            sx={{
              fontSize: col.bold ? '0.82rem' : '0.8rem',
              fontWeight: col.bold ? 600 : 400,
              color: v ? 'text.primary' : 'text.disabled',
            }}
          >
            {String(v || '—')}
          </Typography>
        ),
      })),
    [],
  );

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <PanelHeader
          icon={<ManageAccountsIcon sx={{ fontSize: '1.1rem' }} />}
          title='Consultant Roles'
          count={data.length}
          countLabel='role'
          accent={ACCENT_CR}
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
              <>
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
        subtitle='Configure consultant role settings'
        submitDisabled={false}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {tableConfig.tables.consultantRoles.fields.map((field: any) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            required={field.required}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
          />
        ))}
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Consultant Role'
        itemName={selectedRow?.roleName ?? ''}
      />
    </>
  );
};

// ── Working Times panel ────────────────────────────────────────────────────────

const WorkingTimesPanel = ({
  data,
  onSave,
}: {
  data: IConfigApprovalWorkingTime[];
  onSave: (data: IConfigApprovalWorkingTime[]) => void;
}) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovalWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const emptyForm = () => {
    const f: Record<string, string> = {};
    tableConfig.tables.workingTimes.fields.forEach((field: any) => {
      f[field.name] = '';
    });
    return f;
  };

  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRow) {
      const f: Record<string, string> = {};
      tableConfig.tables.workingTimes.fields.forEach((field: any) => {
        f[field.name] = String(editingRow[field.name as keyof IConfigApprovalWorkingTime] ?? '');
      });
      setForm(f);
    } else {
      setForm(emptyForm());
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = data.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? data.filter(
        (r) =>
          r.timezone?.toLowerCase().includes(search.toLowerCase()) ||
          r.startTime?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleSubmit = () => {
    if (editingRow) {
      const updated = data.map((r) =>
        r.id === editingRow.id ? ({ ...editingRow, ...form } as IConfigApprovalWorkingTime) : r,
      );
      onSave(updated);
      setSelectedId(editingRow.id);
    } else {
      const n = { id: `wt_${Date.now()}`, ...form } as IConfigApprovalWorkingTime;
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

  const columns: Column<IConfigApprovalWorkingTime>[] = useMemo(
    () =>
      tableConfig.tables.workingTimes.columns.map((col: any) => ({
        id: col.id,
        label: col.label,
        minWidth: col.minWidth ?? 100,
        format: (v): React.ReactNode => (
          <Typography
            variant='body2'
            sx={{
              fontSize: col.bold ? '0.82rem' : '0.8rem',
              fontWeight: col.bold ? 600 : 400,
              color: v ? 'text.primary' : 'text.disabled',
            }}
          >
            {String(v || '—')}
          </Typography>
        ),
      })),
    [],
  );

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
        title={editingRow ? 'Edit Working Time' : 'New Working Time'}
        subtitle='Configure working time settings'
        submitDisabled={false}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {tableConfig.tables.workingTimes.fields.map((field: any) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            required={field.required}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
          />
        ))}
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Time'
        itemName={selectedRow?.timezone ?? ''}
      />
    </>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────

const ApprovalsSection = () => {
  const { classes } = useStyles();
  const { approvals: api, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<ActiveView>('records');

  const [records, setRecords] = useState<IConfigApprovalRecord[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigApprovalAssocUserProfile[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigApprovalConsultantRole[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigApprovalWorkingTime[]>([]);

  useEffect(() => {
    if (!api) return;
    setRecords(api.records ?? []);
    setAssocUsers(api.assocUserProfiles ?? []);
    setConsultantRoles(api.consultantRoles ?? []);
    setWorkingTimes(api.workingTimes ?? []);
  }, [api]);

  const saveAll = (overrides: any = {}) => {
    saveSection('approvals', {
      records: overrides.records ?? records,
      assocUserProfiles: overrides.assocUsers ?? assocUsers,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      workingTimes: overrides.workingTimes ?? workingTimes,
    });
  };

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_RECORDS,
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
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              size='small'
              startIcon={<HowToRegIcon />}
              variant={activeView === 'records' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('records')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_RECORDS,
                bgcolor: activeView === 'records' ? ACCENT_RECORDS : undefined,
                color: activeView === 'records' ? '#fff' : ACCENT_RECORDS,
                '&:hover': {
                  bgcolor:
                    activeView === 'records'
                      ? alpha(ACCENT_RECORDS, 0.85)
                      : alpha(ACCENT_RECORDS, 0.08),
                  borderColor: ACCENT_RECORDS,
                },
              }}
            >
              Approval Records
            </Button>
            <Button
              size='small'
              startIcon={<PersonIcon />}
              variant={activeView === 'userProfile' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('userProfile')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_AUP,
                bgcolor: activeView === 'userProfile' ? ACCENT_AUP : undefined,
                color: activeView === 'userProfile' ? '#fff' : ACCENT_AUP,
                '&:hover': {
                  bgcolor:
                    activeView === 'userProfile'
                      ? alpha(ACCENT_AUP, 0.85)
                      : alpha(ACCENT_AUP, 0.08),
                  borderColor: ACCENT_AUP,
                },
              }}
            >
              Associated User Profiles
            </Button>
            <Button
              size='small'
              startIcon={<ManageAccountsIcon />}
              variant={activeView === 'consultantRoles' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('consultantRoles')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_CR,
                bgcolor: activeView === 'consultantRoles' ? ACCENT_CR : undefined,
                color: activeView === 'consultantRoles' ? '#fff' : ACCENT_CR,
                '&:hover': {
                  bgcolor:
                    activeView === 'consultantRoles'
                      ? alpha(ACCENT_CR, 0.85)
                      : alpha(ACCENT_CR, 0.08),
                  borderColor: ACCENT_CR,
                },
              }}
            >
              Consultant Roles
            </Button>
            <Button
              size='small'
              startIcon={<AccessTimeIcon />}
              variant={activeView === 'workingTimes' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('workingTimes')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_WT,
                bgcolor: activeView === 'workingTimes' ? ACCENT_WT : undefined,
                color: activeView === 'workingTimes' ? '#fff' : ACCENT_WT,
                '&:hover': {
                  bgcolor:
                    activeView === 'workingTimes' ? alpha(ACCENT_WT, 0.85) : alpha(ACCENT_WT, 0.08),
                  borderColor: ACCENT_WT,
                },
              }}
            >
              Working Times
            </Button>
          </Box>
        </Paper>

        {activeView === 'records' && (
          <ApprovalRecordsPanel
            data={records}
            onSave={(next) => {
              setRecords(next);
              saveAll({ records: next });
            }}
          />
        )}
        {activeView === 'userProfile' && (
          <AssocUserProfilesPanel
            data={assocUsers}
            onSave={(next) => {
              setAssocUsers(next);
              saveAll({ assocUsers: next });
            }}
          />
        )}
        {activeView === 'consultantRoles' && (
          <ConsultantRolesPanel
            data={consultantRoles}
            onSave={(next) => {
              setConsultantRoles(next);
              saveAll({ consultantRoles: next });
            }}
          />
        )}
        {activeView === 'workingTimes' && (
          <WorkingTimesPanel
            data={workingTimes}
            onSave={(next) => {
              setWorkingTimes(next);
              saveAll({ workingTimes: next });
            }}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// ── Page wrapper ──────────────────────────────────────────────────────────────

const Approvals = () => (
  <Box sx={{ p: 3, width: '100%' }}>
    <ApprovalsSection />
  </Box>
);

export default Approvals;
