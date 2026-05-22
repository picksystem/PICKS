import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import NumbersIcon from '@mui/icons-material/Numbers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigApplicationNumberSequence } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';

const EMPTY_APP_NUMSEQ_FORM = {
  applicationId: '',
  applicationName: '',
  ticketTypeId: 0,
  ticketTypeName: '',
  numberSequenceCode: '',
  numericCharLength: 0,
  numberSequenceFormat: '',
};

interface ApplicationNumberSequencesSectionProps {
  data?: IConfigApplicationNumberSequence[];
  onDataChange?: (data: IConfigApplicationNumberSequence[]) => void;
}

const ApplicationNumberSequencesSection = ({
  data,
  onDataChange,
}: ApplicationNumberSequencesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes = ticketTypesData?.filter((t) => t.isActive) ?? [];
  const applications = apiCat?.applications ?? [];

  const [rows, setRows] = useState<IConfigApplicationNumberSequence[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationNumberSequence | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_NUMSEQ_FORM);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationNumberSequences) {
      setRows(apiCat.applicationNumberSequences);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              applicationName: editingRow.applicationName,
              ticketTypeId: editingRow.ticketTypeId,
              ticketTypeName: editingRow.ticketTypeName,
              numberSequenceCode: editingRow.numberSequenceCode,
              numericCharLength: editingRow.numericCharLength,
              numberSequenceFormat: editingRow.numberSequenceFormat,
            }
          : EMPTY_APP_NUMSEQ_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          r.ticketTypeName.toLowerCase().includes(search.toLowerCase()) ||
          r.numberSequenceCode.toLowerCase().includes(search.toLowerCase()) ||
          r.numberSequenceFormat.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigApplicationNumberSequence[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: next,
      });
    }
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleTicketTypeChange = (id: number) => {
    const tt = activeTicketTypes.find((t) => t.id === id);
    setForm((f) => {
      const ttName = tt?.displayName ?? tt?.name ?? '';
      const appName = f.applicationName ?? '';
      const autoCode = `${appName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_${ttName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
      return {
        ...f,
        ticketTypeId: id,
        ticketTypeName: ttName,
        numberSequenceCode: f.numberSequenceCode || autoCode,
      };
    });
  };

  const handleSubmit = () => {
    if (!form.numberSequenceCode.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationNumberSequence = { id: `appnumseq_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigApplicationNumberSequence>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'numberSequenceCode',
      label: 'Number Sequence Code',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'numericCharLength',
      label: 'Numeric Char Length',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={500} fontSize='0.82rem'>
          {String(v)}
        </Typography>
      ),
    },
    {
      id: 'numberSequenceFormat',
      label: 'Number Sequence Format',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
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
              bgcolor: '#2d5ebb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <NumbersIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>
              Application Specific Number Sequence
            </Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage number sequences per application and ticket type
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new number sequence'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  New
                </Button>
              </Tooltip>
            ) : (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingRow(selectedRow);
                  setDialogOpen(true);
                }}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Delete
              </Button>
            )}
            {selectedRow && (
              <>
                <Box
                  sx={{
                    width: '1px',
                    height: '20px',
                    bgcolor: alpha('#2d5ebb', 0.3),
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedId(null)}
                >
                  Clear
                </Button>
              </>
            )}
            <TextField
              size='small'
              placeholder='Search…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon sx={{ fontSize: '1rem' }} />
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
            data={filtered}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<NumbersIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Number Sequence'
        subtitle='Manage number sequences per application and ticket type'
        submitDisabled={!form.numberSequenceCode.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <>
            <TextField
              label='Application'
              size='small'
              fullWidth
              value={form.applicationName}
              disabled
            />
            <TextField
              label='Ticket Type'
              size='small'
              fullWidth
              value={form.ticketTypeName}
              disabled
            />
          </>
        ) : (
          <>
            <FormControl size='small' fullWidth required>
              <InputLabel>Application</InputLabel>
              <Select
                label='Application'
                value={form.applicationId}
                onChange={(e) => handleApplicationChange(e.target.value)}
              >
                {applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size='small' fullWidth required>
              <InputLabel>Ticket Type</InputLabel>
              <Select
                label='Ticket Type'
                value={form.ticketTypeId || ''}
                onChange={(e) => handleTicketTypeChange(Number(e.target.value))}
              >
                {activeTicketTypes.map((tt) => (
                  <MenuItem key={tt.id} value={tt.id}>
                    {tt.displayName || tt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          label='Number Sequence Code'
          size='small'
          fullWidth
          required
          value={form.numberSequenceCode}
          onChange={(e) => setForm((f) => ({ ...f, numberSequenceCode: e.target.value }))}
        />
        <TextField
          label='Numeric Char Length'
          type='number'
          size='small'
          fullWidth
          value={form.numericCharLength}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setForm((f) => ({ ...f, numericCharLength: isNaN(v) || v < 0 ? 0 : v }));
          }}
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          label='Number Sequence Format'
          size='small'
          fullWidth
          value={form.numberSequenceFormat}
          onChange={(e) => setForm((f) => ({ ...f, numberSequenceFormat: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Number Sequence'
        itemName={selectedRow?.numberSequenceCode}
      />
    </Accordion>
  );
};

export { ApplicationNumberSequencesSection };
