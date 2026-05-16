import {
  Grid,
  TextField,
  Box,
  DataTable,
  Loader,
  PageHeader,
  Typography,
} from '../../../components';
import { InputAdornment, Tabs, Tab } from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import useFavourites from './hooks/useFavourites';
import TabPanel from './components/TabPanel';
import { IncidentRow } from './types/Favourites.types';

const Favourites = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabData,
    columns,
    openIncident,
    getFilteredData,
    TICKET_TABS,
    EMPTY_MESSAGES,
  } = useFavourites();

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

  return (
    <Grid className={classes.container}>
      <PageHeader
        title='My Favourite Tickets'
        description='Your starred tickets across all types. Click a ticket number or row to open it in a new tab.'
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
          {TICKET_TABS.map(({ label, icon }) => (
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

      {tabData.map((list, idx) => (
        <TabPanel key={idx} value={tabValue} index={idx}>
          {getFilteredData(list).length === 0 ? (
            <Box className={classes.emptyState}>
              <BookmarksIcon className={classes.emptyIcon} />
              <Typography variant='h6' color='text.secondary'>
                {tableSearch ? 'No matching tickets' : EMPTY_MESSAGES[idx]}
              </Typography>
              {idx >= 2 && !tableSearch && (
                <Typography variant='body2' color='text.disabled' className={classes.emptySubtext}>
                  Favorites for this ticket type will appear here once available.
                </Typography>
              )}
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

export default Favourites;
