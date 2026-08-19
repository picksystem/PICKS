import {
  Grid,
  TextField,
  Box,
  DataTable,
  Loader,
  PageHeader,
  Typography,
} from '../../../components';
import { InputAdornment } from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './styles';
import useFavourites from './hooks/useFavourites';
import { TicketTypeFilterField } from './components/TicketTypeFilterField';
import { FavouriteRow } from './types/Favourites.types';

const Favourites = () => {
  const { classes } = useStyles();
  const {
    isLoading,
    error,
    selectedTicketType,
    setSelectedTicketType,
    ticketTypeOptions,
    filteredList,
    columns,
    openIncident,
    getFilteredData,
    tableSearch,
    setTableSearch,
  } = useFavourites();

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Loader />
      </Box>
    );
  }

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
        title='My Favourite Tickets'
        description='Your starred tickets across all types. Click a ticket number or row to open it in a new tab.'
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

      <Box className={classes.tableContainer}>
        {filteredList.length === 0 ? (
          <Box className={classes.emptyState}>
            <BookmarksIcon className={classes.emptyIcon} />
            <Typography variant='h6' color='text.secondary'>
              {selectedTicketType
                ? 'No favourite tickets for this type'
                : 'No favourite tickets yet'}
            </Typography>
            {!selectedTicketType && (
              <Typography variant='body2' color='text.disabled' className={classes.emptySubtext}>
                Star tickets to add them here.
              </Typography>
            )}
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={getFilteredData(filteredList)}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => openIncident((row as FavouriteRow).number)}
          />
        )}
      </Box>
    </Grid>
  );
};

export default Favourites;
