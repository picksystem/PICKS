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
import useTicketManagement from './hooks/useTicketManagement';
import { TicketManagementRow } from './types/TicketManagement.types';
import { TicketTypeFilterField } from './components/TicketTypeFilterField';

const TicketManagement = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    error,
    selectedTicketType,
    setSelectedTicketType,
    ticketTypeOptions,
    filteredList,
    columns,
    openTicket,
    getFilteredData,
    tableSearch,
    setTableSearch,
  } = useTicketManagement();

  // The hook's RTK Query options (refetchOnFocus: true, pollingInterval: 30000)
  // automatically refresh data when the tab regains focus or after 30 seconds,
  // ensuring newly submitted tickets appear without a manual page reload.

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
          Failed to load tickets
        </Typography>
      </Box>
    );
  }

  return (
    <Grid className={classes.container}>
      <PageHeader
        title='Ticket Management'
        description='View and manage tickets across every configured ticket type. Click a row to open it in a new tab.'
        className={classes.pageHeader}
      />

      <Box className={classes.tabsBox}>
        <Box sx={{ marginLeft: 'auto' }} className={classes.filterField}>
          <TicketTypeFilterField
            value={selectedTicketType}
            options={ticketTypeOptions}
            onChange={setSelectedTicketType}
          />
        </Box>
        <TextField
          placeholder='Search tickets...'
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

      <Box className={classes.tableContainer}>
        {filteredList.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant='h6' color='text.secondary'>
              {selectedTicketType ? 'No tickets found for this type' : 'No tickets found'}
            </Typography>
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={getFilteredData(filteredList)}
            rowKey='rowId'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => openTicket((row as TicketManagementRow).number)}
          />
        )}
      </Box>
    </Grid>
  );
};

export default TicketManagement;
