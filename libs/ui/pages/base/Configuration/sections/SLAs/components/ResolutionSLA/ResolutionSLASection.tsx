import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  Link,
  Chip,
  TextField,
  DataTable,
  Column,
  Switch,
} from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';
import { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import ResolutionSLAFormDialog from '@serviceops/pages/base/Configuration/dialogs/ResolutionSLAFormDialog/ResolutionSLAFormDialog';
import { ConfigDeleteDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

interface ResolutionSLASectionProps {
  displayRows: IConfigResponseAckSLARow[];
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  editingRow: IConfigResponseAckSLARow | null;
  setEditingRow: (row: IConfigResponseAckSLARow | null) => void;
  onSubmit: (row: IConfigResponseAckSLARow) => void;
  onDelete: () => void;
  onLoadDefaults: () => void;
  onToggleActivation: (ticketTypeId: number, value: boolean) => void;
  activeTicketTypes: ITicketType[];
  usedTicketTypeIds: number[];
}

const CHIP_COLORS = ['#7c3aed', '#1d4ed8', '#0f766e', '#1b5e20', '#c2410c', '#0891b2', '#b45309'];

const ResolutionSLASection = ({
  displayRows,
  selectedRowId,
  setSelectedRowId,
  editingRow,
  setEditingRow,
  onSubmit,
  onDelete,
  onLoadDefaults,
  onToggleActivation,
  activeTicketTypes,
  usedTicketTypeIds,
}: ResolutionSLASectionProps) => {
  const { classes } = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedRow = displayRows.find((r) => r.id === selectedRowId) ?? null;

  const filteredRows = search
    ? displayRows.filter((r) => r.ticketTypeName.toLowerCase().includes(search.toLowerCase()))
    : displayRows;

  const chipCell = (row: IConfigResponseAckSLARow) => {
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

  const pCell = (v: unknown) => (
    <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
      {String(v)}
    </Typography>
  );

  const columns: Column<IConfigResponseAckSLARow>[] = [
    { id: 'ticketTypeName', label: 'SLAs', minWidth: 140, format: (_v, row) => chipCell(row) },
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
    { id: 'p1', label: 'P1', minWidth: 55, format: pCell },
    { id: 'p2', label: 'P2', minWidth: 55, format: pCell },
    { id: 'p3', label: 'P3', minWidth: 55, format: pCell },
    { id: 'p4', label: 'P4', minWidth: 55, format: pCell },
    { id: 'p5', label: 'P5', minWidth: 55, format: pCell },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Resolution SLA (in hours)</Typography>
            <Typography className={classes.sectionSubtitle}>
              Track resolution time targets per ticket type and priority level
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar} sx={{ mt: 2 }}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow && (
              <Tooltip title='Add a new resolution SLA row'>
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

            <Tooltip title='Reset all rows to system default values'>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                startIcon={<RestoreIcon />}
                onClick={onLoadDefaults}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Load System Defaults
              </Button>
            </Tooltip>

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

          {selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.ticketTypeName}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedRowId(null)}>
                Clear
              </Link>
            </Typography>
          )}
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

      <ResolutionSLAFormDialog
        open={dialogOpen}
        editingRow={editingRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedTicketTypeIds}
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
        entityName='Resolution SLA Row'
        itemName={selectedRow?.ticketTypeName}
      />
    </Accordion>
  );
};

export { ResolutionSLASection };
