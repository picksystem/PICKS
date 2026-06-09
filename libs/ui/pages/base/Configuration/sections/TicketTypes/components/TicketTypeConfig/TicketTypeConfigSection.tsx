import { useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import {
  Box,
  TextField,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Tooltip,
} from '@serviceops/component';
import { InputAdornment, Popper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
  const [usefulLinksAnchor, setUsefulLinksAnchor] = useState<HTMLElement | null>(null);
  const [usefulLinksOpen, setUsefulLinksOpen] = useState(false);

  const handleUsefulLinksOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUsefulLinksAnchor(event.currentTarget);
    setUsefulLinksOpen(true);
  };

  const handleUsefulLinksClose = () => {
    setUsefulLinksAnchor(null);
    setUsefulLinksOpen(false);
  };

  const usefulLinks = [
    {
      label: 'User Guide',
      description: 'Learn how to configure ticket types effectively',
      href: '#',
    },
    {
      label: 'Best Practices',
      description: 'Recommended patterns for ticket type setup',
      href: '#',
    },
    {
      label: 'Troubleshooting',
      description: 'Solutions for common configuration issues',
      href: '#',
    },
  ];

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
    isSubmitting,
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
                <Tooltip title='Useful Links'>
                  <Button
                    size='small'
                    variant='outlined'
                    color='secondary'
                    startIcon={<LinkIcon />}
                    onClick={handleUsefulLinksOpen}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Useful Links
                  </Button>
                </Tooltip>
                <Popper
                  open={usefulLinksOpen}
                  anchorEl={usefulLinksAnchor}
                  placement='bottom-start'
                  sx={{ zIndex: 1300 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 1.5,
                      minWidth: 250,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                    onMouseLeave={handleUsefulLinksClose}
                  >
                    <Typography variant='subtitle2' sx={{ px: 1, py: 0.5, fontWeight: 600 }}>
                      Clicking a link opens a new page with the following options:
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {usefulLinks.map((link, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          window.open(link.href, '_blank');
                          handleUsefulLinksClose();
                        }}
                        sx={{
                          px: 1.5,
                          py: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          borderLeft: 3,
                          borderColor: 'transparent',
                          borderRadius: 0.5,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <LinkIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={link.label}
                          secondary={link.description}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          sx={{ m: 0 }}
                        />
                        <OpenInNewIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                      </Box>
                    ))}
                  </Paper>
                </Popper>
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
                  disabled={isSubmitting}
                  sx={{
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    opacity: isSubmitting ? 0.5 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
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

        <Box className={classes.tablePaper} sx={{ boxShadow: 1, bgcolor: 'background.paper' }}>
          <TicketTypeTable
            ticketTypes={filteredTicketTypes}
            selectedRowId={selectedRow?.id}
            onRowClick={(row) => {
              // Prevent row selection during submission
              if (isSubmitting) return;
              setSelectedRow(selectedRow?.id === row.id ? null : row);
            }}
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
