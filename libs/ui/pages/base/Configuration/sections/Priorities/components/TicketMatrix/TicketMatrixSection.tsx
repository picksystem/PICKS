import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  DataTable,
  Column,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@serviceops/component';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { ConfigFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { PriorityLevel, ImpactLevel, UrgencyLevel, MatrixMap, MatrixRow } from '../../util';
import { useStyles } from '../../styles';

const DEFAULT_MATRIX: MatrixMap = {
  high: { high: 'critical', medium: 'high', low: 'medium' },
  medium: { high: 'high', medium: 'medium', low: 'low' },
  low: { high: 'medium', medium: 'low', low: 'planning' },
};

interface TicketMatrixSectionProps {
  label: string;
  accentColor: string;
  MatrixIcon: React.ElementType;
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrix: MatrixMap;
  onMatrixChange: (impact: string, urgency: string, priorityId: string) => void;
  onMatrixReset: (newMatrix: MatrixMap) => void;
}

const TicketMatrixSection = ({
  label,
  accentColor,
  MatrixIcon,
  priorities,
  impacts,
  urgencies,
  matrix,
  onMatrixChange,
  onMatrixReset,
}: TicketMatrixSectionProps) => {
  const { classes } = useStyles();
  const [useSimple, setUseSimple] = useState(false);
  const [simplePriority, setSimplePriority] = useState(priorities[0]?.id ?? '');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ impactId: '', urgencyId: '', priorityId: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ impactId: '', urgencyId: '', priorityId: '' });
  const [defineInfoOpen, setDefineInfoOpen] = useState(false);

  const activeImpacts = impacts.filter((i) => i.isActive);
  const activeUrgencies = urgencies.filter((u) => u.isActive);

  const allRows: MatrixRow[] = activeImpacts.flatMap((impact) =>
    activeUrgencies.map((urgency) => ({
      id: `${impact.id}_${urgency.id}`,
      impactId: impact.id,
      urgencyId: urgency.id,
      priorityId: matrix[impact.id]?.[urgency.id] ?? '',
    })),
  );

  const handleDeleteRow = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    const next: MatrixMap = { ...matrix };
    if (next[impactId]) {
      next[impactId] = { ...next[impactId] };
      delete next[impactId][urgencyId];
    }
    onMatrixReset(next);
    setSelectedRowId(null);
  };

  const handleGenerateCombinations = () => {
    const next: MatrixMap = {};
    activeImpacts.forEach((impact) => {
      next[impact.id] = {};
      activeUrgencies.forEach((urgency) => {
        next[impact.id][urgency.id] =
          matrix[impact.id]?.[urgency.id] ||
          DEFAULT_MATRIX[impact.id]?.[urgency.id] ||
          priorities[0]?.id ||
          '';
      });
    });
    onMatrixReset(next);
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
      setAddDialogOpen(false);
    }
  };

  const openEditDialog = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    setEditForm({
      impactId,
      urgencyId,
      priorityId: matrix[impactId]?.[urgencyId] ?? '',
    });
    setEditDialogOpen(true);
  };

  const handleEditRow = () => {
    if (editForm.impactId && editForm.urgencyId) {
      onMatrixChange(editForm.impactId, editForm.urgencyId, editForm.priorityId);
      setEditDialogOpen(false);
    }
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
      title={`${label} Matrix`}
      subtitle='Configure priority mappings for this ticket type'
      icon={<MatrixIcon sx={{ fontSize: '1rem' }} />}
      accent={accentColor}
      defaultExpanded={false}
      className={classes.sectionAccordion}
    >
      <Paper variant='outlined' className={classes.actionToolbar}>
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

              <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

              <FormControlLabel
                labelPlacement='end'
                control={
                  <Checkbox
                    size='small'
                    checked={useSimple}
                    onChange={(e) => setUseSimple(e.target.checked)}
                    color='primary'
                  />
                }
                label={
                  <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                    Use Simple Priorities
                  </Typography>
                }
                sx={{ mr: 0, ml: 0, gap: 0.25 }}
              />

              <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

              <Tooltip title='Impact and Urgency levels are configured in the sections above'>
                <Button
                  size='small'
                  variant='text'
                  startIcon={<TuneIcon />}
                  onClick={() => setDefineInfoOpen(true)}
                  sx={{ textTransform: 'none', fontSize: '0.78rem', color: 'text.secondary' }}
                >
                  Define Impact and Urgency values
                </Button>
              </Tooltip>

              <Tooltip title='Auto-fill all active Impact × Urgency combinations'>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={handleGenerateCombinations}
                  sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                >
                  Generate Impact and Urgency combinations
                </Button>
              </Tooltip>

              <Tooltip title='Reset this matrix to system defaults'>
                <Button
                  size='small'
                  variant='outlined'
                  color='warning'
                  onClick={() => onMatrixReset(DEFAULT_MATRIX)}
                  sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                >
                  Load system default values
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
      </Paper>

      {useSimple ? (
        <Paper variant='outlined' sx={{ p: 2, borderRadius: 2, mt: 1 }}>
          <Typography variant='body2' color='text.secondary' mb={1.5}>
            A single priority applies to all <strong>{label}</strong> tickets regardless of impact
            and urgency.
          </Typography>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Default Priority</InputLabel>
            <Select
              value={simplePriority}
              label='Default Priority'
              onChange={(e) => setSimplePriority(e.target.value)}
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
        </Paper>
      ) : (
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
      )}

      <ConfigFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddRow}
        isEdit={false}
        icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={accentColor}
        title='Combination'
        submitDisabled={!addForm.impactId || !addForm.urgencyId || !addForm.priorityId}
        submitLabel='Add'
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
        submitDisabled={false}
        submitLabel='Save Changes'
        maxWidth='xs'
      >
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            display='block'
            mb={0.5}
          >
            Impact
          </Typography>
          <Typography variant='body2' fontWeight={700}>
            {impacts.find((i) => i.id === editForm.impactId)?.displayName ?? editForm.impactId}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            display='block'
            mb={0.5}
          >
            Urgency
          </Typography>
          <Typography variant='body2' fontWeight={700}>
            {urgencies.find((u) => u.id === editForm.urgencyId)?.displayName ?? editForm.urgencyId}
          </Typography>
        </Box>
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

      <ConfigFormDialog
        open={defineInfoOpen}
        onClose={() => setDefineInfoOpen(false)}
        onSubmit={() => setDefineInfoOpen(false)}
        isEdit={false}
        icon={<TuneIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#6366f1'
        title='Impact and Urgency values'
        newTitle='Impact and Urgency values'
        submitLabel='Close'
        submitDisabled={false}
        maxWidth='xs'
      >
        <Typography variant='body2' color='text.secondary'>
          Impact and Urgency levels are defined globally in the <strong>Impact</strong> and{' '}
          <strong>Urgency</strong> sections above. Any changes there will automatically reflect in
          this combination matrix.
        </Typography>
      </ConfigFormDialog>
    </GenericAccordion>
  );
};

export { TicketMatrixSection };
