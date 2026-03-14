import { Box, Loader, DataTable } from '@picks/component';
import { Typography, Tabs, TextField, InputAdornment } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SearchIcon from '@mui/icons-material/Search';
import { IAuthUser } from '@picks/interfaces';
import { useStyles } from './styles';
import { useRoleRequests } from './hooks/useRoleRequests';
import TabPanel from './components/TabPanel';
import DetailDialog from './dialogs/DetailDialog/DetailDialog';
import ActionDialog from './dialogs/ActionDialog/ActionDialog';

const RoleRequests = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabLists,
    columns,
    tabs,
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
      <Box className={classes.pageHeader}>
        <Typography variant='h5' className={classes.title}>
          Access Requests
        </Typography>
        <Typography variant='body2' className={classes.description}>
          Review and manage all account access requests. Approve to activate with the requested
          role, or reject to deny access.
        </Typography>
      </Box>

      {/* ── Tabs + Search ── */}
      <Box className={classes.tabsBox}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            setTableSearch('');
          }}
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
          className={classes.tabsFlex}
        >
          {tabs}
        </Tabs>
        <TextField
          placeholder='Search...'
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

      {/* ── Tab panels ── */}
      {tabLists.map((list, idx) => (
        <TabPanel key={idx} value={tabValue} index={idx}>
          {getFilteredData(list).length === 0 ? (
            <Box className={classes.emptyState}>
              <HowToRegIcon className={classes.emptyIcon} />
              <Typography variant='h6' color='text.secondary'>
                {tableSearch
                  ? 'No matching requests'
                  : idx === 1
                    ? 'No pending requests'
                    : idx === 2
                      ? 'No approved requests'
                      : idx === 3
                        ? 'No rejected requests'
                        : 'No access requests found'}
              </Typography>
            </Box>
          ) : (
            <Box className={classes.tableContainer}>
              <DataTable
                columns={columns}
                data={getFilteredData(list)}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setDetailUser(row as IAuthUser)}
              />
            </Box>
          )}
        </TabPanel>
      ))}

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
