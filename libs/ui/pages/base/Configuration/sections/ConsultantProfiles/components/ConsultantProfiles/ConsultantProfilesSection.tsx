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
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { IConfigConsultantProfile } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT_w = '#0369a1';

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

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

interface ConsultantProfilesSectionProps {
  profiles: IConfigConsultantProfile[];
  onProfilesChange: (profiles: IConfigConsultantProfile[]) => void;
}

const ConsultantProfilesSection = ({
  profiles,
  onProfilesChange,
}: ConsultantProfilesSectionProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IConfigConsultantProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CP);
  const [search, setSearch] = useState('');

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

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
    setForm(
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

  const handleSubmit = () => {
    if (!form.consultantName.trim()) return;
    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id ? { ...editingProfile, ...form } : p,
      );
      onProfilesChange(updated);
      setSelectedId(editingProfile.id);
    } else {
      const n: IConfigConsultantProfile = { id: `cp_${Date.now()}`, ...form };
      onProfilesChange([...profiles, n]);
      setSelectedId(n.id);
    }
    setEditOpen(false);
    setEditingProfile(null);
  };

  const handleDelete = () => {
    if (!selectedProfile) return;
    const next = profiles.filter((p) => p.id !== selectedProfile.id);
    onProfilesChange(next);
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigConsultantProfile>[] = [
    { id: 'consultantName', label: 'Consultant', minWidth: 150, format: mkCell(true) },
    { id: 'applicationName', label: 'Application', minWidth: 140, format: mkCell() },
    { id: 'consultantRole', label: 'Role', minWidth: 140, format: mkCell() },
    { id: 'workingCalendar', label: 'Working Calendar', minWidth: 150, format: mkCell() },
    { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 150, format: mkCell() },
    { id: 'manager', label: 'Manager', minWidth: 130, format: mkCell() },
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
            <BusinessCenterIcon sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT_w }}>
            Consultant Profiles
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
            {!selectedProfile ? (
              <>
                <Tooltip title='Add a new Consultant Profile'>
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
                      setEditingProfile(null);
                      setEditOpen(true);
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
                    setEditingProfile(selectedProfile);
                    setEditOpen(true);
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
            data={filteredProfiles}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </Box>

      <ConfigFormDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingProfile(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingProfile}
        icon={<BusinessCenterIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Consultant Profile'
        submitDisabled={!form.consultantName.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Consultant Name'
          size='small'
          fullWidth
          required
          value={form.consultantName}
          onChange={(e) => setForm((f) => ({ ...f, consultantName: e.target.value }))}
        />
        <TextField
          label='Application'
          size='small'
          fullWidth
          value={form.applicationName}
          disabled
        />
        <TextField
          label='Consultant Role'
          size='small'
          fullWidth
          value={form.consultantRole}
          onChange={(e) => setForm((f) => ({ ...f, consultantRole: e.target.value }))}
        />
        <TextField
          label='Working Calendar'
          size='small'
          fullWidth
          value={form.workingCalendar}
          onChange={(e) => setForm((f) => ({ ...f, workingCalendar: e.target.value }))}
        />
        <TextField
          label='Holiday Calendar'
          size='small'
          fullWidth
          value={form.holidayCalendar}
          onChange={(e) => setForm((f) => ({ ...f, holidayCalendar: e.target.value }))}
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

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Consultant Profile'
        itemName={selectedProfile?.consultantName}
      />
    </>
  );
};

export { ConsultantProfilesSection };
