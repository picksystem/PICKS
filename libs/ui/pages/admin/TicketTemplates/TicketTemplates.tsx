import { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CategoryIcon from '@mui/icons-material/Category';
import AppsIcon from '@mui/icons-material/Apps';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { Loader } from '../../../components';
import { useStyles } from './styles';
import { useTicketTemplates } from './hooks/useTicketTemplates';
import TicketTypeTable from './components/TicketTypeTable';
import TicketTypeFormDialog from './components/TicketTypeFormDialog';

const TicketTemplates = () => {
  const { classes } = useStyles();
  const [tableSearch, setTableSearch] = useState('');
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    ticketTypes,
    isLoading,
    error,
    advancedSequences,
    setAdvancedSequences,
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
  } = useTicketTemplates();

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
        <Alert severity='error' sx={{ mt: 2 }}>
          Failed to load ticket types. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      {/* ── Section: Ticket Type Configuration ── */}
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
                Configure prefixes, numbering, and display settings for each ticket type
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Action Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {/* Add New — hidden when a row is selected */}
              {!selectedRow && (
                <Tooltip title='Add a new ticket type'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Add New Ticket
                  </Button>
                </Tooltip>
              )}

              {/* Edit — shown only when a row is selected */}
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

              {/* Delete — shown only when a row is selected */}
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

              <Divider
                orientation='vertical'
                flexItem
                className={classes.toolbarDivider}
                sx={{ mx: 0.5 }}
              />

              {/* Advanced Number Sequences checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={advancedSequences}
                    onChange={(e) => setAdvancedSequences(e.target.checked)}
                    size='small'
                    color='primary'
                  />
                }
                label={
                  <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
                    Use Advanced Number Sequences
                  </Typography>
                }
                sx={{ mr: 0, width: { xs: '100%', sm: 'auto' } }}
              />

              <Divider
                orientation='vertical'
                flexItem
                className={classes.toolbarDivider}
                sx={{ mx: 0.5 }}
              />

              {/* Define Advanced Number Sequences */}
              <Tooltip title='Configure advanced number sequences'>
                <Button
                  size='small'
                  variant='outlined'
                  color='secondary'
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Define Advanced Number Sequences
                </Button>
              </Tooltip>

              <Tooltip title='Configure application-specific number sequences'>
                <Button
                  size='small'
                  variant='outlined'
                  color='secondary'
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Define Application Specific Number Sequences
                </Button>
              </Tooltip>

              {/* Search */}
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

            {/* Selection indicator */}
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

          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TicketTypeTable
              ticketTypes={filteredTicketTypes}
              selectedRowId={selectedRow?.id}
              onRowClick={(row) => setSelectedRow(selectedRow?.id === row.id ? null : row)}
              onToggleActive={handleToggleActive}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ── Section: Service Line Specific ── */}
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CategoryIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
            <Box>
              <Typography className={classes.sectionTitle}>Service Line Specific</Typography>
              <Typography className={classes.sectionSubtitle}>
                Configure ticket types unique to a specific service line
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails className={classes.sectionBody}>
          <Typography variant='body2' color='text.secondary'>
            Service line specific ticket types allow you to create custom ticket categories that are
            scoped to individual business units or service lines.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant='body2' color='text.disabled'>
              No service-line ticket types configured. Contact your system administrator to enable
              this feature.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* ── Section: Application Specific ── */}
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AppsIcon sx={{ color: 'secondary.main', fontSize: '1.2rem' }} />
            <Box>
              <Typography className={classes.sectionTitle}>Application Specific</Typography>
              <Typography className={classes.sectionSubtitle}>
                Ticket types tied to specific business applications
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails className={classes.sectionBody}>
          <Typography variant='body2' color='text.secondary'>
            Application-specific ticket types link your ticket system to individual applications in
            your portfolio.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant='body2' color='text.disabled'>
              No application-specific ticket types configured. Link applications in Application
              Settings to enable this feature.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Form Dialog */}
      <TicketTypeFormDialog
        open={dialogOpen}
        editingItem={editingItem}
        advancedSequences={advancedSequences}
        iconMap={iconMap}
        tagMap={tagMap}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Ticket Type</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete{' '}
            <strong>{selectedRow?.displayName || selectedRow?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={async () => {
              await handleDelete();
              setConfirmDeleteOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketTemplates;
