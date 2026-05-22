import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  Link,
  Chip,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IConfigGeneral, IConfigApprovedEstimateRow } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';
import {
  ConfigDeleteDialog,
  ConfigFormDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const CHIP_COLORS = ['#7c3aed', '#1d4ed8', '#0f766e', '#1b5e20', '#c2410c', '#0891b2', '#b45309'];

const ApprovedEstimatesSection = ({
  form,
  saveRows,
}: {
  form: IConfigGeneral;
  saveRows: (rows: IConfigApprovedEstimateRow[]) => void;
}) => {
  const { classes } = useStyles();
  const { categorization } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApprovedEstimateRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const approvedEstimateRows: IConfigApprovedEstimateRow[] = form.approvedEstimateRows ?? [];
  const selectedRow = approvedEstimateRows.find((r) => r.id === selectedRowId) ?? null;
  const usedTicketTypeIds = approvedEstimateRows.map((r) => r.ticketTypeId);

  const filteredRows = search
    ? approvedEstimateRows.filter((r) =>
        r.ticketTypeName.toLowerCase().includes(search.toLowerCase()),
      )
    : approvedEstimateRows;

  const handleSubmit = (row: IConfigApprovedEstimateRow) => {
    const existing = approvedEstimateRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? approvedEstimateRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...approvedEstimateRows, row];
    saveRows(next);
    setDialogOpen(false);
    setEditingRow(null);
    setSelectedRowId(row.id);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const next = approvedEstimateRows.filter((r) => r.ticketTypeId !== selectedRow.ticketTypeId);
    saveRows(next);
    setSelectedRowId(null);
    setDeleteOpen(false);
  };

  // Dialog form state
  const [dlgTicketTypeId, setDlgTicketTypeId] = useState(0);
  const [dlgTicketTypeName, setDlgTicketTypeName] = useState('');
  const [dlgServiceLine, setDlgServiceLine] = useState('');
  const [dlgApplication, setDlgApplication] = useState('');
  const [dlgQueue, setDlgQueue] = useState('');
  const [dlgHours, setDlgHours] = useState(0);

  // Get data from categorization for dropdowns
  const serviceLines = (categorization?.serviceLines ?? []).map((sl) => sl.name);
  const applications = (categorization?.applications ?? []).map((app) => app.name);
  const queues = (categorization?.queues ?? []).map((q) => q.name);

  useEffect(() => {
    if (dialogOpen) {
      if (editingRow) {
        setDlgTicketTypeId(editingRow.ticketTypeId);
        setDlgTicketTypeName(editingRow.ticketTypeName);
        setDlgServiceLine(editingRow.serviceLine ?? '');
        setDlgApplication(editingRow.application ?? '');
        setDlgQueue(editingRow.queue ?? '');
        setDlgHours(editingRow.hours);
      } else {
        setDlgTicketTypeId(0);
        setDlgTicketTypeName('');
        setDlgServiceLine('');
        setDlgApplication('');
        setDlgQueue('');
        setDlgHours(0);
      }
    }
  }, [dialogOpen, editingRow]);

  const availableTicketTypes = activeTicketTypes.filter(
    (tt) => !usedTicketTypeIds.includes(tt.id) || tt.id === editingRow?.ticketTypeId,
  );

  const handleDlgTicketTypeChange = (id: number) => {
    const tt = activeTicketTypes.find((t) => t.id === id);
    setDlgTicketTypeId(id);
    setDlgTicketTypeName(tt?.displayName ?? tt?.name ?? '');
  };

  const handleDlgSubmit = () => {
    if (!dlgTicketTypeId) return;
    handleSubmit({
      id: editingRow?.id ?? `est_${Date.now()}`,
      ticketTypeId: dlgTicketTypeId,
      ticketTypeName: dlgTicketTypeName,
      serviceLine: dlgServiceLine || undefined,
      application: dlgApplication || undefined,
      queue: dlgQueue || undefined,
      hours: dlgHours,
    });
  };

  const isEditing = editingRow !== null;

  const estColumns: Column<IConfigApprovedEstimateRow>[] = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 140,
      format: (_v, row) => {
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
      },
    },
    {
      id: 'serviceLine',
      label: 'Service Line',
      minWidth: 130,
      format: (v) => {
        const val = v as string | undefined;
        return (
          <Typography sx={{ fontSize: '0.82rem', color: val ? 'text.primary' : 'text.disabled' }}>
            {val || '—'}
          </Typography>
        );
      },
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 130,
      format: (v) => {
        const val = v as string | undefined;
        return (
          <Typography sx={{ fontSize: '0.82rem', color: val ? 'text.primary' : 'text.disabled' }}>
            {val || '—'}
          </Typography>
        );
      },
    },
    {
      id: 'queue',
      label: 'Queue',
      minWidth: 130,
      format: (v) => {
        const val = v as string | undefined;
        return (
          <Typography sx={{ fontSize: '0.82rem', color: val ? 'text.primary' : 'text.disabled' }}>
            {val || '—'}
          </Typography>
        );
      },
    },
    {
      id: 'hours',
      label: 'Default Hours',
      minWidth: 120,
      align: 'right',
      format: (v) => (
        <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
          {String(v)}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: '#0891b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AccessTimeIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>
                Default Approved Estimates (hours)
              </Typography>
              <Typography className={classes.sectionSubtitle}>
                Set default approved estimate hours per ticket type
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow && (
                <Tooltip title='Add a new approved estimate row'>
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

            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.ticketTypeName}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedRowId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* ── Table ── */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <DataTable
              columns={estColumns}
              data={filteredRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedRowId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedRowId ?? undefined}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ── New / Edit dialog ── */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleDlgSubmit}
        isEdit={isEditing}
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#0891b2'
        title='Approved Estimate'
        subtitle='Set default approved estimate hours per ticket type'
        submitDisabled={!dlgTicketTypeId}
        submitLabel={isEditing ? 'Save Changes' : 'Add Row'}
        maxWidth='xs'
      >
        {isEditing ? (
          <TextField
            label='Ticket Type'
            value={dlgTicketTypeName}
            disabled
            size='small'
            fullWidth
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Ticket Type</InputLabel>
            <Select
              label='Ticket Type'
              value={dlgTicketTypeId || ''}
              onChange={(e) => handleDlgTicketTypeChange(Number(e.target.value))}
            >
              {availableTicketTypes.map((tt) => (
                <MenuItem key={tt.id} value={tt.id}>
                  {tt.displayName || tt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl size='small' fullWidth>
          <InputLabel>Service Line</InputLabel>
          <Select
            label='Service Line'
            value={dlgServiceLine}
            onChange={(e) => setDlgServiceLine(e.target.value)}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {serviceLines.map((sl: string) => (
              <MenuItem key={sl} value={sl}>
                {sl}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' fullWidth>
          <InputLabel>Application</InputLabel>
          <Select
            label='Application'
            value={dlgApplication}
            onChange={(e) => setDlgApplication(e.target.value)}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {applications.map((app: string) => (
              <MenuItem key={app} value={app}>
                {app}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' fullWidth>
          <InputLabel>Queue</InputLabel>
          <Select label='Queue' value={dlgQueue} onChange={(e) => setDlgQueue(e.target.value)}>
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {queues.map((q: string) => (
              <MenuItem key={q} value={q}>
                {q}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label='Default Approved Estimate (hours)'
          type='number'
          size='small'
          fullWidth
          value={dlgHours}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setDlgHours(isNaN(v) || v < 0 ? 0 : v);
          }}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </ConfigFormDialog>

      {/* ── Delete confirmation ── */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Approved Estimate Row'
        itemName={selectedRow?.ticketTypeName}
      />
    </>
  );
};

export { ApprovedEstimatesSection };
