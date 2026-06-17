import { useState } from 'react';
import { Box, Typography, Button, Tooltip, DataTable, Column } from '@serviceops/component';
import { FormControl, Select, MenuItem, InputLabel, Paper } from '@mui/material';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { PriorityLevel, ImpactLevel, UrgencyLevel, ExtendedMatrixMap, MatrixRow } from '../../util';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';

interface TicketMatrixAccordionProps {
  ticketTypeKey: string;
  label: string;
  accentColor: string;
  MatrixIcon: React.ElementType;
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrix: ExtendedMatrixMap;
  onMatrixChange: (impact: string, urgency: string, priorityId: string) => void;
  onMatrixReset: (newMatrix: ExtendedMatrixMap) => void;
  isAccordionExpanded?: boolean;
  onAccordionToggle?: () => void;
}

const TicketMatrixAccordion = ({
  ticketTypeKey,
  label,
  accentColor,
  MatrixIcon,
  priorities,
  impacts,
  urgencies,
  matrix,
  onMatrixChange,
  onMatrixReset,
  isAccordionExpanded = false,
  onAccordionToggle,
}: TicketMatrixAccordionProps) => {
  const { classes } = useStyles();
  const { success } = useNotification();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ impactId: '', urgencyId: '', priorityId: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ impactId: '', urgencyId: '', priorityId: '' });

  const activeImpacts = impacts.filter((i) => i.isActive);
  const activeUrgencies = urgencies.filter((u) => u.isActive);

  // Deduplicate by using a Map with unique keys
  const allRows = (() => {
    const rowMap = new Map<string, MatrixRow>();
    activeImpacts.forEach((impact) =>
      activeUrgencies.forEach((urgency) => {
        const id = `${impact.id}_${urgency.id}`;
        if (!rowMap.has(id)) {
          rowMap.set(id, {
            id,
            impactId: impact.id,
            urgencyId: urgency.id,
            priorityId: matrix[impact.id]?.[urgency.id]?.priorityId ?? '',
            shortDescription: matrix[impact.id]?.[urgency.id]?.shortDescription,
            description: matrix[impact.id]?.[urgency.id]?.description,
            internalNote: matrix[impact.id]?.[urgency.id]?.internalNote,
          });
        }
      }),
    );
    return Array.from(rowMap.values());
  })();

  const handleDeleteRow = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    const next: ExtendedMatrixMap = { ...matrix };
    if (next[impactId]) {
      next[impactId] = { ...next[impactId] };
      delete next[impactId][urgencyId];
    }
    onMatrixReset(next);
    success('Combination deleted successfully');
    setSelectedRowId(null);
  };

  const openAddDialog = () => {
    setAddForm({
      impactId: activeImpacts[0]?.id ?? '',
      urgencyId: activeUrgencies[0]?.id ?? '',
      priorityId: priorities[0]?.id ?? '',
    });
    setAddDialogOpen(true);
  };

  const handleAddRow = () => {
    if (addForm.impactId && addForm.urgencyId && addForm.priorityId) {
      onMatrixChange(addForm.impactId, addForm.urgencyId, addForm.priorityId);
      success('Combination added successfully');
      setAddDialogOpen(false);
    }
  };

  const openEditDialog = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    setEditForm({
      impactId,
      urgencyId,
      priorityId: matrix[impactId]?.[urgencyId]?.priorityId ?? '',
    });
    setEditDialogOpen(true);
  };

  const handleEditRow = () => {
    if (!editForm.impactId || !editForm.urgencyId) return;
    if (!selectedRowId) return;
    const [prevImpactId, prevUrgencyId] = selectedRowId.split('_');
    const next: ExtendedMatrixMap = { ...matrix };
    if (prevImpactId !== editForm.impactId || prevUrgencyId !== editForm.urgencyId) {
      if (next[prevImpactId]) {
        next[prevImpactId] = { ...next[prevImpactId] };
        delete next[prevImpactId][prevUrgencyId];
      }
    }
    onMatrixReset(next);
    onMatrixChange(editForm.impactId, editForm.urgencyId, editForm.priorityId);
    success('Combination updated successfully');
    setEditDialogOpen(false);
  };

  const columns: Column<MatrixRow>[] = [
    {
      id: 'impactId',
      label: 'Impact',
      minWidth: 130,
      format: (_v, row): React.ReactNode => {
        const impact = impacts.find((i) => i.id === row.impactId);
        return (
          <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
            {impact?.displayName ?? row.impactId}
          </Typography>
        );
      },
    },
    {
      id: 'urgencyId',
      label: 'Urgency',
      minWidth: 130,
      format: (_v, row): React.ReactNode => {
        const urgency = urgencies.find((u) => u.id === row.urgencyId);
        return (
          <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
            {urgency?.displayName ?? row.urgencyId}
          </Typography>
        );
      },
    },
    {
      id: 'priorityId',
      label: 'Priority',
      minWidth: 160,
      format: (_v, row): React.ReactNode => {
        const priority = priorities.find((p) => p.id === row.priorityId);
        return (
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <Select
              value={row.priorityId}
              displayEmpty
              onChange={(e) => {
                e.stopPropagation();
                onMatrixChange(row.impactId, row.urgencyId, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <MenuItem value=''>
                <Typography color='text.secondary' fontSize='0.78rem'>
                  Not set
                </Typography>
              </MenuItem>
              {priorities.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Typography fontSize='0.78rem' fontWeight={700}>
                    {p.name}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      },
    },
  ];

  return (
    <GenericAccordion
      title={`${label} Based on Impact and Urgency`}
      subtitle='Configure priority mappings for this ticket type'
      icon={<MatrixIcon sx={{ fontSize: '1rem' }} />}
      accent={accentColor}
      defaultExpanded={false}
      className={classes.sectionAccordion}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap' }}>
          {!selectedRowId ? (
            <>
              <Tooltip title='Add a new Combination'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                  sx={{ textTransform: 'none' }}
                >
                  New
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title='Edit the selected combination'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={openEditDialog}
                  sx={{ textTransform: 'none' }}
                >
                  Edit
                </Button>
              </Tooltip>

              <Tooltip title='Clear priority for selected row'>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteRow}
                  sx={{ textTransform: 'none' }}
                >
                  Delete
                </Button>
              </Tooltip>

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
                onClick={() => setSelectedRowId(null)}
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
            </>
          )}
        </Box>
      </GenericToolbar>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mt: 1 }}>
        <DataTable
          columns={columns}
          data={allRows}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedRowId((prev) => (prev === row.id ? null : row.id))}
          activeRowKey={selectedRowId ?? undefined}
        />
      </Paper>

      <ConfigFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddRow}
        isEdit={false}
        icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={accentColor}
        title='Combination'
        subtitle='Map a priority to an impact and urgency pair'
        submitDisabled={!addForm.impactId || !addForm.urgencyId || !addForm.priorityId}
        submitLabel='Submit'
        maxWidth='xs'
      >
        <FormControl size='small' fullWidth>
          <InputLabel>Impact</InputLabel>
          <Select
            value={addForm.impactId}
            label='Impact'
            onChange={(e) => setAddForm((f) => ({ ...f, impactId: e.target.value }))}
          >
            {activeImpacts.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {i.displayName}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth>
          <InputLabel>Urgency</InputLabel>
          <Select
            value={addForm.urgencyId}
            label='Urgency'
            onChange={(e) => setAddForm((f) => ({ ...f, urgencyId: e.target.value }))}
          >
            {activeUrgencies.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {u.displayName}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={addForm.priorityId}
            label='Priority'
            onChange={(e) => setAddForm((f) => ({ ...f, priorityId: e.target.value }))}
          >
            {priorities.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {p.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ConfigFormDialog>

      <ConfigFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditRow}
        isEdit
        icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={accentColor}
        title='Combination'
        subtitle='Modify the priority mapping for this impact and urgency pair'
        submitDisabled={false}
        submitLabel='Save'
        maxWidth='xs'
      >
        <FormControl size='small' fullWidth>
          <InputLabel>Impact</InputLabel>
          <Select
            value={editForm.impactId}
            label='Impact'
            onChange={(e) => setEditForm((f) => ({ ...f, impactId: e.target.value }))}
          >
            {activeImpacts.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {i.displayName}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth>
          <InputLabel>Urgency</InputLabel>
          <Select
            value={editForm.urgencyId}
            label='Urgency'
            onChange={(e) => setEditForm((f) => ({ ...f, urgencyId: e.target.value }))}
          >
            {activeUrgencies.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {u.displayName}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={editForm.priorityId}
            label='Priority'
            onChange={(e) => setEditForm((f) => ({ ...f, priorityId: e.target.value }))}
          >
            <MenuItem value=''>
              <Typography color='text.secondary' fontSize='0.78rem'>
                Not set
              </Typography>
            </MenuItem>
            {priorities.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                <Typography fontSize='0.82rem' fontWeight={700}>
                  {p.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ConfigFormDialog>
    </GenericAccordion>
  );
};

export { TicketMatrixAccordion };
