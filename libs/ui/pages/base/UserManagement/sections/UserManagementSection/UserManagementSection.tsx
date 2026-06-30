import GroupIcon from '@mui/icons-material/Group';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import BadgeIcon from '@mui/icons-material/Badge';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import KeyIcon from '@mui/icons-material/Key';
import LockResetIcon from '@mui/icons-material/LockReset';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Divider, Tooltip, TextField, DataTable } from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import type { UserManagementSectionProps } from './UserManagementSection.types';
import { useStyles } from './styles';

const ACCENT = '#0369a1';

const UserManagementSection = ({
  allUsers,
  columns,
  tableSearch,
  onTableSearchChange,
  selectedRow,
  onRowSelect,
  onRowClick,
  onOpenNew,
  onOpenDraft,
  onOpenEdit,
  onOpenDelete,
  onOpenChangesLog,
  onOpenLoginData,
  onOpenConsultantProfile,
  onOpenChangeProfile,
  onOpenTempPw,
  onOpenResetPw,
  onOpenAdminControls,
  adminControlsOpen,
  isDraft,
  isConsultant,
  draftValues,
}: UserManagementSectionProps) => {
  const { classes } = useStyles();

  const getTableDataFn = (users: typeof allUsers, startFrom = 1) =>
    users.map((u, i) => ({ ...u, sno: startFrom + i }));

  const tableData = getTableDataFn(allUsers);
  const filteredTableData = tableSearch
    ? tableData.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(tableSearch.toLowerCase()),
        ),
      )
    : tableData;

  return (
    <>
      <Box className={classes.adminControlsWrapper}>
        <Tooltip title='Approval settings & page styles'>
          <Button
            size='small'
            variant={adminControlsOpen ? 'outlined' : 'contained'}
            color='primary'
            startIcon={<TuneIcon />}
            onClick={onOpenAdminControls}
            className={classes.adminControlsBtn}
          >
            Admin Controls
          </Button>
        </Tooltip>
      </Box>

      <GenericAccordion
        title='User Management'
        subtitle='View and manage all users across different roles in the system'
        icon={<GroupIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
        accent={ACCENT}
        className={classes.sectionAccordion}
      >
        <GenericToolbar className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow && (
              <Tooltip title='Create new user'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={onOpenNew}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Add New User
                </Button>
              </Tooltip>
            )}

            {isDraft && Boolean(draftValues) && (
              <Tooltip title='Open saved draft'>
                <Button
                  size='small'
                  variant='contained'
                  color='info'
                  startIcon={<ScheduleIcon />}
                  onClick={onOpenDraft}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Open Draft
                </Button>
              </Tooltip>
            )}

            {selectedRow && (
              <Tooltip title={!isDraft ? 'Edit selected user' : 'Cannot edit a draft row'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<EditIcon />}
                    disabled={isDraft}
                    onClick={onOpenEdit}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && (
              <Tooltip title='Delete selected user'>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={onOpenDelete}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {selectedRow && isConsultant && (
              <Tooltip title='View consultant profile'>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<BadgeIcon />}
                    onClick={onOpenConsultantProfile}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Consultant Profile
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && (
              <Tooltip
                title={
                  !isDraft ? 'Change user role / profile' : 'Cannot change profile for a draft'
                }
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ManageAccountsIcon />}
                    disabled={isDraft}
                    onClick={onOpenChangeProfile}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Change Profile
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {selectedRow && (
              <Tooltip title={!isDraft ? 'View change history' : 'No change history for a draft'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<HistoryIcon />}
                    disabled={isDraft}
                    onClick={onOpenChangesLog}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Changes Log
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && (
              <Tooltip title={!isDraft ? 'View login activity' : 'No login data for a draft'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<LoginIcon />}
                    disabled={isDraft}
                    onClick={onOpenLoginData}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Login Data
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {selectedRow && (
              <Tooltip
                title={
                  !isDraft ? 'Generate and email a temporary password' : 'Not available for a draft'
                }
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='warning'
                    startIcon={<KeyIcon />}
                    disabled={isDraft}
                    onClick={onOpenTempPw}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Generate Temp Password
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && (
              <Tooltip
                title={!isDraft ? 'Manually reset user password' : 'Not available for a draft'}
              >
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<LockResetIcon />}
                    disabled={isDraft}
                    onClick={onOpenResetPw}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Reset Password
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedRow && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

            {selectedRow && (
              <Tooltip title='Clear selection'>
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => onRowSelect(null)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Clear
                </Button>
              </Tooltip>
            )}

            {!selectedRow && (
              <TextField
                placeholder='Search...'
                value={tableSearch}
                onChange={(e) => onTableSearchChange(e.target.value)}
                className={classes.toolbarSearchField}
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
            )}
          </Box>
        </GenericToolbar>

        <Box className={classes.tablePaper} sx={{ boxShadow: 1, bgcolor: 'background.paper' }}>
          <DataTable
            columns={columns}
            data={filteredTableData}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={onRowClick}
            activeRowKey={selectedRow?.id as number}
          />
        </Box>
      </GenericAccordion>
    </>
  );
};

export { UserManagementSection };
