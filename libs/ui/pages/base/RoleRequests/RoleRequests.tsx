import { Box, Loader, DataTable, Typography, TextField, PageHeader } from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SearchIcon from '@mui/icons-material/Search';
import { IAuthUser } from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useRoleRequests } from './hooks/useRoleRequests';
import DetailDialog from './dialogs/DetailDialog/DetailDialog';
import ActionDialog from './dialogs/ActionDialog/ActionDialog';

const RoleRequests = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    tableSearch,
    setTableSearch,
    columns,
    detailUser,
    setDetailUser,
    actionTarget,
    actionNotes,
    actionInProgress,
    handleConfirmAction,
    handleOpenAction,
    handleCloseAction,
    setActionNotes,
    getFilteredData,
  } = useRoleRequests();

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      {/* ── Page header ── */}
      <PageHeader
        title='Access Requests'
        description='Review and manage all account access requests. Approve to activate with the requested role, or reject to deny access.'
        className={classes.pageHeader}
      />

      {/* ── Search ── */}
      <Box className={classes.tabsBox}>
        <TextField
          placeholder='Search access requests...'
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
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
      </Box>

      {/* ── Table ── */}
      {getFilteredData().length === 0 ? (
        <Box className={classes.emptyState}>
          <HowToRegIcon className={classes.emptyIcon} />
          <Typography variant='h6' color='text.secondary'>
            {tableSearch ? 'No matching requests' : 'No access requests found'}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.tableContainer}>
          <DataTable
            columns={columns}
            data={getFilteredData()}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setDetailUser(row as IAuthUser)}
          />
        </Box>
      )}

      <DetailDialog
        detailUser={detailUser}
        onClose={() => setDetailUser(null)}
        onOpenAction={handleOpenAction}
      />
      <ActionDialog
        actionTarget={actionTarget}
        actionNotes={actionNotes}
        actionInProgress={actionInProgress}
        onClose={handleCloseAction}
        onNotesChange={setActionNotes}
        onConfirm={handleConfirmAction}
      />
    </Box>
  );
};

export default RoleRequests;
