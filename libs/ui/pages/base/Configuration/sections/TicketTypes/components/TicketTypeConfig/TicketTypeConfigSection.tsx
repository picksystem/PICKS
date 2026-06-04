import { useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  Tooltip,
  Divider,
  FormControlLabel,
} from '@serviceops/component';
import { InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TicketTypeTable from '@serviceops/configtickettypetable';
import TicketTypeFormDialog from '@serviceops/configtickettypeformdialog';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import SequenceDialog from '@serviceops/configsequencedialog';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { useStyles } from '../../styles';
import { useTicketTypeConfig } from './hooks';

const ACCENT = '#0369a1';

const TicketTypeConfigSection = () => {
  const { classes } = useStyles();
  const [tableSearch, setTableSearch] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [sequenceOpen, setDisplaySequenceOpen] = useState(false);

  const {
    ticketTypes,
    dialogOpen,
    editingItem,
    selectedRow,
    setSelectedRow,
    openAddDialog,
    openEditSelected,
    closeDialog,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    iconMap,
    tagMap,
    advancedDisplaySequences,
    setAdvancedDisplaySequences,
  } = useTicketTypeConfig();

  const filteredTicketTypes = tableSearch
    ? (ticketTypes || []).filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(tableSearch.toLowerCase()),
        ),
      )
    : ticketTypes || [];

  return (
    <>
      <GenericAccordion
        title='Ticket Type Configuration'
        subtitle='Activate prefixes, numbering, and display settings for each ticket type'
        icon={<ConfirmationNumberIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
        accent={ACCENT}
        className={classes.sectionAccordion}
      >
        <GenericToolbar className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <>
                <Tooltip title='Add a new Ticket Type'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Add New Ticket Type
                  </Button>
                </Tooltip>
                <Tooltip title='Set the display order of ticket types on the Create Ticket page'>
                  <Button
                    size='small'
                    variant='outlined'
                    color='primary'
                    startIcon={<SortIcon />}
                    onClick={() => setDisplaySequenceOpen(true)}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Display Sequence
                  </Button>
                </Tooltip>
                <Divider
                  orientation='vertical'
                  flexItem
                  className={classes.toolbarDivider}
                  sx={{ mx: 0.5 }}
                />
                <FormControlLabel
                  labelPlacement='start'
                  control={
                    <Switch
                      checked={advancedDisplaySequences}
                      onChange={(e) => setAdvancedDisplaySequences(e.target.checked)}
                      size='small'
                      color='primary'
                    />
                  }
                  label={
                    <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
                      Use Advanced Number Display Sequences
                    </Typography>
                  }
                  sx={{ mr: 0, ml: 0, gap: 1, width: { xs: '100%', sm: 'auto' } }}
                />
                <Divider
                  orientation='vertical'
                  flexItem
                  className={classes.toolbarDivider}
                  sx={{ mx: 0.5 }}
                />
                <Tooltip title='Configure advanced number sequences'>
                  <Button
                    size='small'
                    variant='outlined'
                    color='secondary'
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Define Advanced Number Display Sequences
                  </Button>
                </Tooltip>
                <Tooltip title='Configure application-specific number sequences'>
                  <Button
                    size='small'
                    variant='outlined'
                    color='secondary'
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Define Application Specific Number Display Sequences
                  </Button>
                </Tooltip>
                <TextField
                  placeholder='Search...'
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className={classes.tableSearchField}
                  sx={{ ml: { xs: 0, sm: 'auto' } }}
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
              </>
            ) : (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={openEditSelected}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmDeleteOpen(true)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
                <Box
                  component='span'
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: '1px',
                    height: '20px',
                    bgcolor: 'divider',
                    mx: 0.75,
                    alignSelf: 'center',
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedRow(null)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Clear
                </Button>
              </>
            )}
          </Box>
        </GenericToolbar>

        <Box elevation={1} className={classes.tablePaper}>
          <TicketTypeTable
            ticketTypes={filteredTicketTypes}
            selectedRowId={selectedRow?.id}
            onRowClick={(row) => setSelectedRow(selectedRow?.id === row.id ? null : row)}
            onToggleActive={handleToggleActive}
          />
        </Box>
      </GenericAccordion>

      <SequenceDialog
        open={sequenceOpen}
        ticketTypes={ticketTypes || []}
        onClose={() => setDisplaySequenceOpen(false)}
        onSave={() => setDisplaySequenceOpen(false)}
      />

      <TicketTypeFormDialog
        open={dialogOpen}
        editingItem={editingItem}
        advancedSequences={advancedDisplaySequences}
        iconMap={iconMap}
        tagMap={tagMap}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfigDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setConfirmDeleteOpen(false);
        }}
        entityName='Ticket Type'
        itemName={selectedRow?.displayName || selectedRow?.name || ''}
      />
    </>
  );
};

export { TicketTypeConfigSection };
