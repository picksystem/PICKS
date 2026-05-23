import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  Chip,
  TextField,
  DataTable,
  Column,
  Switch,
} from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import ActivationRowFormDialog from '@serviceops/pages/base/Configuration/dialogs/ActivationRowFormDialog/ActivationRowFormDialog';
import { ConfigDeleteDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

interface TimeLogsActivationSectionProps {
  displayRows: IConfigActivationRow[];
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  editingRow: IConfigActivationRow | null;
  setEditingRow: (row: IConfigActivationRow | null) => void;
  onSubmit: (row: IConfigActivationRow) => void;
  onDelete: () => void;
  onToggleActivation: (ticketTypeId: number, value: boolean) => void;
  activeTicketTypes: ITicketType[];
  usedTicketTypeIds: number[];
}

const CHIP_COLORS = ['#7c3aed', '#1d4ed8', '#0f766e', '#1b5e20', '#c2410c', '#0891b2', '#b45309'];

const TimeLogsActivationSection = ({
  displayRows,
  selectedRowId,
  setSelectedRowId,
  editingRow,
  setEditingRow,
  onSubmit,
  onDelete,
  onToggleActivation,
  activeTicketTypes,
  usedTicketTypeIds,
}: TimeLogsActivationSectionProps) => {
  const { classes } = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedRow = displayRows.find((r) => r.id === selectedRowId) ?? null;

  const filteredRows = search
    ? displayRows.filter((r) => r.ticketTypeName.toLowerCase().includes(search.toLowerCase()))
    : displayRows;

  const chipCell = (row: IConfigActivationRow) => {
    const color =
      CHIP_COLORS[
        activeTicketTypes.findIndex((t) => t.id === row.ticketTypeId) % CHIP_COLORS.length
      ];
    return (
      <Chip
        label={row.ticketTypeName}
        size='small'
        sx={{
          bgcolor: color,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.72rem',
          height: 22,
          borderRadius: 1.5,
        }}
      />
    );
  };

  const columns: Column<IConfigActivationRow>[] = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 140,
      format: (_v, row) => chipCell(row),
    },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            onToggleActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AvTimerIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Time Logs Activation</Typography>
            <Typography className={classes.sectionSubtitle}>
              Activate time logging on tickets and control caller visibility
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow && (
              <Tooltip title='Add a new time log activation row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 &&
                      usedTicketTypeIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}
            {selectedRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingRow(selectedRow);
                  setDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
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
                onClick={() => setDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <TextField
              size='small'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={filteredRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedRowId(row.id === selectedRowId ? null : row.id)}
            activeRowKey={selectedRowId ?? undefined}
          />
        </Paper>
      </AccordionDetails>

      <ActivationRowFormDialog
        open={dialogOpen}
        title='Time Log Activation'
        editingRow={editingRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedTicketTypeIds}
        idPrefix='tlog'
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={(row) => {
          onSubmit(row);
          setDialogOpen(false);
        }}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete();
          setDeleteOpen(false);
        }}
        entityName='Time Log Activation Row'
        itemName={selectedRow?.ticketTypeName}
      />
    </Accordion>
  );
};

export { TimeLogsActivationSection };
