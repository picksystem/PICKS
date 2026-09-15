import {
  Box,
  DataTable,
  Loader,
  Grid,
  Typography,
  TextField,
  PageHeader,
} from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import useIncidentManagement from './hooks/useIncidentManagement';
import { StatusFilterField } from './components/StatusFilterField';
import { IncidentRow } from './types/IncidentManagement.types';

const IncidentManagement = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    statusFilterOptions,
    filteredList,
    tableSearch,
    setTableSearch,
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

  const emptyMessages: Record<string, string> = {
    all: 'No incidents found',
    new: 'No new incidents',
    in_progress: 'No incidents in progress',
    on_hold: 'No incidents on hold',
    resolved: 'No resolved incidents',
    draft: 'No draft incidents',
  };

  return (
    <Grid className={classes.container}>
      <PageHeader
        title='Incident Management'
        description='View and manage all incidents across the system. Click a row to open it in a new tab.'
        className={classes.pageHeader}
      />

      <Box className={classes.tabsBox}>
        <StatusFilterField
          value={selectedStatus}
          options={statusFilterOptions}
          onChange={(v) => {
            setSelectedStatus(v);
            setTableSearch('');
          }}
          className={classes.filterField}
        />
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

      {getFilteredData(filteredList).length === 0 ? (
        <Box className={classes.emptyState}>
          <Typography variant='h6' color='text.secondary'>
            {tableSearch
              ? 'No matching incidents'
              : emptyMessages[selectedStatus] || 'No incidents found'}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.tableContainer}>
          <DataTable
            columns={columns}
            data={getFilteredData(filteredList)}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => openIncident((row as IncidentRow).number)}
          />
        </Box>
      )}
    </Grid>
  );
};

export default IncidentManagement;
