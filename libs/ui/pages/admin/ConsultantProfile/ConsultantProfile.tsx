import { Box, Loader, DataTable } from '@picks/component';
import {
  Grid,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import { useConsultantProfile } from './hooks/useConsultantProfile';
import TabPanel from './components/TabPanel';
import ProfileDialog from './dialogs/ProfileDialog/ProfileDialog';
import RoleDialog from './dialogs/RoleDialog/RoleDialog';
import ViewProfileDialog from './dialogs/ViewProfileDialog/ViewProfileDialog';
import TicketTemplates from '../TicketTemplates/TicketTemplates';

const ConsultantProfile = () => {
  const { classes } = useStyles();
  const {
    tabValue,
    setTabValue,
    isLoading,
    profileSearch,
    setProfileSearch,
    roleSearch,
    setRoleSearch,
    showInactive,
    setShowInactive,
    appFilter,
    setAppFilter,
    consultantUsers,
    profiles,
    roles,
    profileDialogOpen,
    setProfileDialogOpen,
    profileForm,
    setProfileForm,
    editingProfileId,
    isSavingProfile,
    roleDialogOpen,
    setRoleDialogOpen,
    roleForm,
    setRoleForm,
    editingRoleId,
    isSavingRole,
    viewProfile,
    setViewProfile,
    fetchAll,
    handleOpenCreateProfile,
    handleOpenEditProfile,
    handleSaveProfile,
    handleOpenCreateRole,
    handleOpenEditRole,
    handleSaveRole,
    uniqueApps,
    filteredProfiles,
    filteredRoles,
    consultantRoleOptions,
    profileColumns,
    roleColumns,
  } = useConsultantProfile();

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  type ProfileRow = (typeof filteredProfiles)[number] & { sno: number };
  type RoleRow = (typeof filteredRoles)[number] & { sno: number };

  return (
    <Grid className={classes.container}>
      {/* ── Page header ── */}
      <Box className={classes.pageHeader}>
        <Box className={classes.pageHeaderRow}>
          <Typography variant='h5' className={classes.title}>
            Consultant Profiles
          </Typography>
          <Button variant='outlined' size='small' startIcon={<RefreshIcon />} onClick={fetchAll}>
            Refresh
          </Button>
        </Box>
        <Typography variant='body2' className={classes.description}>
          Manage consultant profiles, roles, and working time configurations. Click a row to view
          details.
        </Typography>
      </Box>

      {/* ── Tabs ── */}
      <Box className={classes.tabsBox}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            setProfileSearch('');
            setRoleSearch('');
          }}
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
        >
          <Tab
            icon={<BusinessCenterIcon />}
            iconPosition='start'
            label={`Consultant Profiles (${profiles.length})`}
          />
          <Tab icon={<WorkIcon />} iconPosition='start' label={`Roles (${roles.length})`} />
          <Tab icon={<CalendarMonthIcon />} iconPosition='start' label='Working Times' />
          <Tab icon={<ConfirmationNumberIcon />} iconPosition='start' label='Ticket Types' />
        </Tabs>
      </Box>

      {/* ══ Tab 0: Consultant Profiles ════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={0}>
        <Paper variant='outlined' className={classes.toolbar}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap='wrap'
            useFlexGap
          >
            <Button
              variant='contained'
              size='small'
              startIcon={<AddIcon />}
              onClick={handleOpenCreateProfile}
            >
              New Profile
            </Button>
            <FormControl size='small' className={classes.appFilterControl}>
              <InputLabel>Application</InputLabel>
              <Select
                value={appFilter}
                label='Application'
                onChange={(e) => setAppFilter(e.target.value)}
              >
                <MenuItem value=''>All Applications</MenuItem>
                {uniqueApps.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  size='small'
                />
              }
              label='Show Inactive'
            />
            <TextField
              placeholder='Search profiles...'
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              size='small'
              className={classes.searchField}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Paper>

        {filteredProfiles.length === 0 ? (
          <Box className={classes.emptyState}>
            <BusinessCenterIcon className={classes.emptyIcon} />
            <Typography variant='h6' color='text.secondary'>
              {profileSearch ? 'No matching profiles' : 'No consultant profiles found'}
            </Typography>
            {!profileSearch && (
              <Typography variant='body2' color='text.secondary' className={classes.emptySubtext}>
                Click &quot;New Profile&quot; to create one.
              </Typography>
            )}
          </Box>
        ) : (
          <Box className={classes.tableContainer}>
            <DataTable
              columns={profileColumns}
              data={filteredProfiles.map((p, i) => ({ ...p, sno: i + 1 }))}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setViewProfile(row as ProfileRow)}
            />
          </Box>
        )}
      </TabPanel>

      {/* ══ Tab 1: Consultant Roles ═══════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={1}>
        <Paper variant='outlined' className={classes.toolbar}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap='wrap'
            useFlexGap
          >
            <Button
              variant='contained'
              size='small'
              startIcon={<AddIcon />}
              onClick={handleOpenCreateRole}
            >
              New Role
            </Button>
            <FormControl size='small' className={classes.appFilterControl}>
              <InputLabel>Application</InputLabel>
              <Select
                value={appFilter}
                label='Application'
                onChange={(e) => setAppFilter(e.target.value)}
              >
                <MenuItem value=''>All Applications</MenuItem>
                {uniqueApps.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder='Search roles...'
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              size='small'
              className={classes.searchField}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Paper>

        {filteredRoles.length === 0 ? (
          <Box className={classes.emptyState}>
            <WorkIcon className={classes.emptyIcon} />
            <Typography variant='h6' color='text.secondary'>
              {roleSearch ? 'No matching roles' : 'No roles found'}
            </Typography>
            {!roleSearch && (
              <Typography variant='body2' color='text.secondary' className={classes.emptySubtext}>
                Click &quot;New Role&quot; to create one.
              </Typography>
            )}
          </Box>
        ) : (
          <Box className={classes.tableContainer}>
            <DataTable
              columns={roleColumns}
              data={filteredRoles.map((r, i) => ({ ...r, sno: i + 1 }))}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => handleOpenEditRole(row as RoleRow)}
            />
          </Box>
        )}
      </TabPanel>

      {/* ══ Tab 2: Working Times ══════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={2}>
        <Alert severity='info' className={classes.alertBox}>
          Working time calendar configuration — coming soon.
        </Alert>
        <Paper variant='outlined' className={classes.workingTimePaper}>
          <CalendarMonthIcon className={classes.workingTimeIcon} />
          <Typography variant='h6' color='text.secondary'>
            Working Times
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Configure SLA working calendars and exception calendars for consultants.
          </Typography>
        </Paper>
      </TabPanel>

      {/* ══ Tab 3: Ticket Types ═══════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mx: -3, mt: -2 }}>
          <TicketTemplates />
        </Box>
      </TabPanel>

      {/* ════════════════════════════════════════════════════════════════
          DIALOGS
      ════════════════════════════════════════════════════════════════ */}
      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        editingProfileId={editingProfileId}
        profileForm={profileForm}
        onFormChange={setProfileForm}
        isSaving={isSavingProfile}
        onSave={handleSaveProfile}
        consultantUsers={consultantUsers}
        consultantRoleOptions={consultantRoleOptions}
      />

      <RoleDialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        editingRoleId={editingRoleId}
        roleForm={roleForm}
        onFormChange={setRoleForm}
        isSaving={isSavingRole}
        onSave={handleSaveRole}
      />

      <ViewProfileDialog
        viewProfile={viewProfile}
        consultantUsers={consultantUsers}
        onClose={() => setViewProfile(null)}
        onEdit={(profile) => {
          handleOpenEditProfile(profile);
        }}
      />
    </Grid>
  );
};

export default ConsultantProfile;
