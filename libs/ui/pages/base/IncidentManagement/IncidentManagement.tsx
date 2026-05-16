import { Box, DataTable, Loader } from '../../../components';
import { Grid, Typography, TextField, InputAdornment, Tabs, Tab } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import useIncidentManagement from './hooks/useIncidentManagement';
import TabPanel from './components/TabPanel';
import { IncidentRow } from './types/IncidentManagement.types';

const IncidentManagement = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    error,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabLists,
    tabLabels,
    columns,
    openIncident,
    getFilteredData,
  } = useIncidentManagement();

  if (isLoading)
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );

  if (error) {
    return (
      <Box className={classes.container}>
        <Typography color='error' variant='body2'>
          Failed to load incidents
        </Typography>
      </Box>
    );
  }

  return (
    <Grid className={classes.container}>
      <Box className={classes.pageHeader}>
        <Box className={classes.pageHeaderRow}>
          <Typography variant='h5' className={classes.title}>
            Incident Management
          </Typography>
        </Box>
        <Typography variant='body2' className={classes.description}>
          View and manage all incidents across the system. Click a row to open it in a new tab.
        </Typography>
      </Box>

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
          {tabLabels.map(({ label, icon }) => (
            <Tab key={label} icon={icon} iconPosition='start' label={label} title={label} />
          ))}
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

      {tabLists.map((list, idx) => (
        <TabPanel key={idx} value={tabValue} index={idx}>
          {getFilteredData(list).length === 0 ? (
            <Box className={classes.emptyState}>
              <AssignmentIcon className={classes.emptyIcon} />
              <Typography variant='h6' color='text.secondary'>
                {tableSearch
                  ? 'No matching incidents'
                  : idx === 1
                    ? 'No new incidents'
                    : idx === 2
                      ? 'No incidents in progress'
                      : idx === 3
                        ? 'No incidents on hold'
                        : idx === 4
                          ? 'No resolved incidents'
                          : idx === 5
                            ? 'No draft incidents'
                            : 'No incidents found'}
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
                onRowClick={(row) => openIncident((row as IncidentRow).number)}
              />
            </Box>
          )}
        </TabPanel>
      ))}
    </Grid>
  );
};

export default IncidentManagement;
