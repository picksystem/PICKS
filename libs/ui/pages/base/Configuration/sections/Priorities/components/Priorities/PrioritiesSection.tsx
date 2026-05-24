import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Tooltip,
  Switch,
  DataTable,
  Column,
} from '@serviceops/component';
import { InputAdornment, FormControlLabel, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { PriorityLevel } from '../../util';
import { useStyles } from '../../styles';
import PriorityFormDialog from '@serviceops/pages/base/Configuration/dialogs/PriorityFormDialog/PriorityFormDialog';

interface PrioritiesSectionProps {
  priorities: PriorityLevel[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityLevel[]>>;
  onPersist: (priorities: PriorityLevel[]) => void;
  activeTicketTypeColumns: { key: string; label: string }[];
  DEFAULT_PRIORITIES: PriorityLevel[];
  selectedPriorityId: string | null;
  setSelectedPriorityId: (id: string | null) => void;
  setSelectedPriority: (priority: PriorityLevel | null) => void;
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
}

const PrioritiesSection = ({
  priorities,
  setPriorities,
  onPersist,
  activeTicketTypeColumns,
  DEFAULT_PRIORITIES,
  selectedPriorityId,
  setSelectedPriorityId,
  setSelectedPriority,
  setConfirmDeleteOpen,
}: PrioritiesSectionProps) => {
  const { classes } = useStyles();

  const [tableSearch, setTableSearch] = useState('');
  const [loadSystemDefaults, setLoadSystemDefaults] = useState(false);
  const [useImpactUrgency, setUseImpactUrgency] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityLevel | null>(null);

  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId) ?? null;

  const handleOpenAdd = () => {
    setEditingPriority(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedPriority) {
      setEditingPriority(selectedPriority);
      setDialogOpen(true);
    }
  };

  const handleSavePriority = (data: Partial<PriorityLevel>) => {
    let next: PriorityLevel[];
    if (editingPriority) {
      next = priorities.map((p) => (p.id === editingPriority.id ? { ...p, ...data } : p));
    } else {
      const id = (data.name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newItem: PriorityLevel = {
        id,
        name: data.name ?? id,
        description: data.description ?? '',
        color: '#fff',
        bgColor: data.bgColor ?? '#2563eb',
        sortOrder: priorities.length + 1,
        enabledFor:
          data.enabledFor ?? Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
      };
      next = [...priorities, newItem];
    }
    setPriorities(next);
    onPersist(next);
    setDialogOpen(false);
  };

  const handleDeletePriority = () => {
    if (selectedPriorityId) {
      const next = priorities.filter((p) => p.id !== selectedPriorityId);
      setPriorities(next);
      onPersist(next);
      setSelectedPriorityId(null);
      setSelectedPriority(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleToggleEnabledFor = (priorityId: string, ticketType: string) => {
    const next = priorities.map((p) =>
      p.id === priorityId
        ? { ...p, enabledFor: { ...p.enabledFor, [ticketType]: !p.enabledFor[ticketType] } }
        : p,
    );
    setPriorities(next);
    onPersist(next);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadSystemDefaults(checked);
    if (checked) {
      setPriorities(DEFAULT_PRIORITIES);
      setSelectedPriorityId(null);
      onPersist(DEFAULT_PRIORITIES);
    }
  };

  const handleRowClick = (row: PriorityLevel) => {
    const newId = row.id === selectedPriorityId ? null : row.id;
    setSelectedPriorityId(newId);
    setSelectedPriority(newId ? (priorities.find((p) => p.id === newId) ?? null) : null);
  };

  const filteredPriorities = tableSearch
    ? priorities.filter((p) =>
        [p.name, p.description].some((v) => v?.toLowerCase().includes(tableSearch.toLowerCase())),
      )
    : priorities;

  const columns: Column<PriorityLevel>[] = [
    {
      id: 'name',
      label: 'Urgency Values',
      minWidth: 130,
      format: (_v, row): React.ReactNode => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: row.bgColor,
              flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.12)',
            }}
          />
          <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    ...activeTicketTypeColumns.map(
      (t): Column<PriorityLevel> => ({
        id: 'enabledFor' as keyof PriorityLevel,
        label: t.label,
        minWidth: 100,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? false}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleEnabledFor(row.id, t.key);
            }}
            onClick={(e) => e.stopPropagation()}
            color='success'
          />
        ),
      }),
    ),
  ];

  return (
    <>
      <Paper variant='outlined' className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedPriorityId ? (
            <>
              <Tooltip title='Add a new Priority'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Add New Priority
                </Button>
              </Tooltip>
              <TextField
                size='small'
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
                onClick={handleOpenEdit}
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
              <Box component='span' sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: '20px', bgcolor: 'divider', mx: 0.75, alignSelf: 'center' }} />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedPriorityId(null)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            </>
          )}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredPriorities}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => handleRowClick(row)}
          activeRowKey={selectedPriorityId ?? undefined}
        />
      </Paper>

      <PriorityFormDialog
        open={dialogOpen}
        editing={editingPriority}
        onClose={() => setDialogOpen(false)}
        onSave={handleSavePriority}
        ticketTypeColumns={activeTicketTypeColumns}
      />
    </>
  );
};

export { PrioritiesSection };
