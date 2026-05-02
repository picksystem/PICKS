import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Tooltip,
  Link,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';
import SettingsIcon from '@mui/icons-material/Settings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { IConfigGeneral, IConfigApprovedEstimateRow } from '@serviceops/interfaces';

const CHIP_COLORS = ['#7c3aed', '#1d4ed8', '#0f766e', '#1b5e20', '#c2410c', '#0891b2', '#b45309'];

const DEFAULT_GENERAL: IConfigGeneral = {
  systemName: '',
  systemDescription: '',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  timeEntriesEnabled: false,
  timeEntriesDisplayName: 'estimated_hours',
  approvedEstimateRows: [],
};

const General = () => {
  const { classes } = useStyles();
  const { general: apiGeneral, saveSection } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    saveSection('general', next);
  };

  // ── Approved estimate rows ────────────────────────────────────────────────
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

  const saveRows = (rows: IConfigApprovedEstimateRow[]) => {
    const next = { ...form, approvedEstimateRows: rows };
    setForm(next);
    saveSection('general', next);
  };

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

  // ── Dialog form ───────────────────────────────────────────────────────────
  const [dlgTicketTypeId, setDlgTicketTypeId] = useState(0);
  const [dlgTicketTypeName, setDlgTicketTypeName] = useState('');
  const [dlgHours, setDlgHours] = useState(0);

  useEffect(() => {
    if (dialogOpen) {
      if (editingRow) {
        setDlgTicketTypeId(editingRow.ticketTypeId);
        setDlgTicketTypeName(editingRow.ticketTypeName);
        setDlgHours(editingRow.hours);
      } else {
        setDlgTicketTypeId(0);
        setDlgTicketTypeName('');
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
      hours: dlgHours,
    });
  };

  const isEditing = editingRow !== null;

  const estColumns: Column<IConfigApprovedEstimateRow>[] = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Types',
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
      id: 'hours',
      label: 'Default Approved Estimate (hours)',
      minWidth: 200,
      format: (v) => (
        <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
          {String(v)}
        </Typography>
      ),
    },
  ];

  return (
    <Box className={classes.container}>
      {/* ── General Admin Controls ── */}
      <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SettingsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>General Admin Controls</Typography>
              <Typography className={classes.sectionSubtitle}>
                Core admin feature toggles and display preferences
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          <Paper
            variant='outlined'
            sx={{ borderRadius: 1.5, overflow: 'hidden', px: 1.5, py: 0.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
              }}
            >
              <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary' }}>
                Enable time entries on tickets
              </Typography>
              <Switch
                size='small'
                color='primary'
                checked={form.timeEntriesEnabled}
                onChange={(e) => update('timeEntriesEnabled', e.target.checked)}
                sx={{ flexShrink: 0 }}
              />
            </Box>

            <Divider sx={{ opacity: 0.45 }} />

            <Box sx={{ py: 1 }}>
              <Typography
                sx={{ fontSize: '0.83rem', fontWeight: 500, color: 'text.primary', mb: 0.75 }}
              >
                Change display name
              </Typography>
              <RadioGroup
                value={form.timeEntriesDisplayName}
                onChange={(e) =>
                  update(
                    'timeEntriesDisplayName',
                    e.target.value as IConfigGeneral['timeEntriesDisplayName'],
                  )
                }
                sx={{ pl: 0.5, gap: 0.25 }}
              >
                <FormControlLabel
                  value='approved_estimates'
                  control={<Radio size='small' color='primary' />}
                  label={
                    <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                      Approved estimates (hrs)
                    </Typography>
                  }
                />
                <FormControlLabel
                  value='estimated_hours'
                  control={<Radio size='small' color='primary' />}
                  label={
                    <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                      Estimated hours
                    </Typography>
                  }
                />
              </RadioGroup>
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ── Default Approved Estimates (hours) ── */}
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
    </Box>
  );
};

export default General;
