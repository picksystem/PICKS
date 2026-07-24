import {
  Box,
  DataTable,
  Loader,
  Grid,
  Typography,
  TextField,
  Tabs,
  Tab,
  PageHeader,
} from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import useTicketManagement from './hooks/useTicketManagement';
import TabPanel from './components/TabPanel';
import { TicketManagementRow } from './types/TicketManagement.types';

const TicketManagement = () => {
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
    ticketTypes,
    columns,
    openTicket,
    getFilteredData,
  } = useTicketManagement();

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
              <ConfirmationNumberIcon className={classes.emptyIcon} />
              <Typography variant='h6' color='text.secondary'>
                {tableSearch
                  ? 'No matching tickets'
                  : idx === 0
                    ? 'No tickets found'
                    : `No ${ticketTypes[idx - 1]?.name ?? 'matching'} tickets`}
              </Typography>
            </Box>
          ) : (
            <Box className={classes.tableContainer}>
              <DataTable
                columns={columns}
                data={getFilteredData(list)}
                rowKey='rowId'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => openTicket((row as TicketManagementRow).number)}
              />
            </Box>
          )}
        </TabPanel>
      ))}
    </Grid>
  );
};

export default TicketManagement;
