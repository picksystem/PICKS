import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Tooltip,
  Switch,
  Link,
  DataTable,
  Column,
} from '@serviceops/component';
import { InputAdornment, FormControlLabel, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
          {!selectedPriorityId && (
            <Tooltip title='Add a new priority level'>
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
          )}

          {selectedPriorityId && (
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
            </>
          )}

          <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

          <FormControlLabel
            labelPlacement='start'
            control={
              <Switch
                size='small'
                checked={loadSystemDefaults}
                onChange={(e) => handleLoadDefaults(e.target.checked)}
                color='warning'
              />
            }
            label={
              <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                Load system default values
              </Typography>
            }
            sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
          />

          <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

          <FormControlLabel
            labelPlacement='start'
            control={
              <Switch
                size='small'
                checked={useImpactUrgency}
                onChange={(e) => setUseImpactUrgency(e.target.checked)}
                color='primary'
              />
            }
            label={
              <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                Use Impact and Urgency based Priorities
              </Typography>
            }
            sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
          />

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
        </Box>

        {selectedPriorityId && (
          <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
            Selected: <strong>{selectedPriority?.name}</strong>&nbsp;·&nbsp;
            <Link
              component='button'
              variant='caption'
              onClick={() => {
                setSelectedPriorityId(null);
                setSelectedPriority(null);
              }}
            >
              Clear
            </Link>
          </Typography>
        )}
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
