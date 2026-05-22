import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Button,
  Switch,
  Tooltip,
  Link,
  Divider,
  FormControlLabel,
} from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TicketTypeTable from '@serviceops/pages/base/Configuration/components/TicketTypeTable/TicketTypeTable';
import TicketTypeFormDialog from '@serviceops/pages/base/Configuration/dialogs/TicketTypeFormDialog/TicketTypeFormDialog';
import { ConfigDeleteDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import SequenceDialog from '@serviceops/pages/base/Configuration/dialogs/SequenceDialog/SequenceDialog';
import { useStyles } from '../../styles';
import { useTicketTypes } from '@serviceops/pages/base/Configuration/hooks/useTicketTypes';

interface TicketTypeConfigSectionProps {
  advancedDisplaySequences: boolean;
  setAdvancedDisplaySequences: (value: boolean) => void;
}

const TicketTypeConfigSection = ({
  advancedDisplaySequences,
  setAdvancedDisplaySequences,
}: TicketTypeConfigSectionProps) => {
  const { classes } = useStyles();
  const [tableSearch, setTableSearch] = useState('');
  const [accordionOpen, setAccordionOpen] = useState(true);
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
  } = useTicketTypes();

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
      <Accordion
        expanded={accordionOpen}
        onChange={(_, expanded) => setAccordionOpen(expanded)}
        className={classes.sectionAccordion}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ConfirmationNumberIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
            <Box>
              <Typography className={classes.sectionTitle}>Ticket Type Configuration</Typography>
              <Typography className={classes.sectionSubtitle}>
                Activate prefixes, numbering, and display settings for each ticket type
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Action Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow && (
                <Tooltip title='Add a new ticket type'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Add New Ticket Type
                  </Button>
                </Tooltip>
              )}

              {selectedRow && (
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={openEditSelected}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Edit
                </Button>
              )}

              {selectedRow && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmDeleteOpen(true)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
              )}

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
            </Box>

            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.displayName || selectedRow.name}</strong>
                &nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedRow(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          <Paper elevation={1} className={classes.tablePaper}>
            <TicketTypeTable
              ticketTypes={filteredTicketTypes}
              selectedRowId={selectedRow?.id}
              onRowClick={(row) => setSelectedRow(selectedRow?.id === row.id ? null : row)}
              onToggleActive={handleToggleActive}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Display Sequence Dialog */}
      <SequenceDialog
        open={sequenceOpen}
        ticketTypes={ticketTypes || []}
        onClose={() => setDisplaySequenceOpen(false)}
        onSave={() => setDisplaySequenceOpen(false)}
      />

      {/* Form Dialog */}
      <TicketTypeFormDialog
        open={dialogOpen}
        editingItem={editingItem}
        advancedSequences={advancedDisplaySequences}
        iconMap={iconMap}
        tagMap={tagMap}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
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
