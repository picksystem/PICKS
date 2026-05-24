import React, { useEffect, useMemo, useState } from 'react';
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
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from '../../../styles';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../../dialogs/ConfigDialogs/ConfigDialogs';
import { ReasonCodeItem, ReasonCodeTableProps } from '../ReasonCodes.types';

const ReasonCodeTable: React.FC<ReasonCodeTableProps> = ({ config, rows, onSave }) => {
  const { classes } = useStyles();
  const [localRows, setLocalRows] = useState<ReasonCodeItem[]>(rows);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ReasonCodeItem | null>(null);
  const [search, setSearch] = useState('');
  const EMPTY_FORM = { name: '', description: '' };
  const [form, setForm] = useState(EMPTY_FORM);
  const Icon = config.icon;

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  useEffect(() => {
    if (!dialogOpen) return;

    setForm(
      editingRow
        ? {
            name: editingRow.name,
            description: editingRow.description,
          }
        : EMPTY_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = useMemo(
    () => localRows.find((r) => r.id === selectedId) ?? null,
    [localRows, selectedId],
  );

  const filteredRows = useMemo(() => {
    if (!search) return localRows;

    const value = search.toLowerCase();

    return localRows.filter(
      (r) => r.name.toLowerCase().includes(value) || r.description.toLowerCase().includes(value),
    );
  }, [search, localRows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedRow) return;

    setEditingRow(selectedRow);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    let updatedRows: ReasonCodeItem[] = [];

    if (editingRow) {
      updatedRows = localRows.map((row) =>
        row.id === editingRow.id ? { ...editingRow, ...form } : row,
      );

      setSelectedId(editingRow.id);
    } else {
      const newRow: ReasonCodeItem = {
        id: `${config.idPrefix}_${Date.now()}`,
        ...form,
      };

      updatedRows = [...localRows, newRow];
      setSelectedId(newRow.id);
    }

    setLocalRows(updatedRows);
    onSave(updatedRows);
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const updatedRows = localRows.filter((row) => row.id !== selectedRow.id);
    setLocalRows(updatedRows);
    onSave(updatedRows);
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<ReasonCodeItem>[] = [
    {
      id: 'name',
      label: config.nameColumnLabel,
      minWidth: 220,
      format: (value): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(value || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: config.descriptionColumnLabel,
      minWidth: 280,
      format: (value): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(value || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion
      defaultExpanded={config.expandedByDefault ?? false}
      elevation={0}
      className={classes.sectionAccordion}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: config.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon
              sx={{
                color: '#fff',
                fontSize: '1rem',
              }}
            />
          </Box>

          <Box>
            <Typography className={classes.sectionTitle}>{config.title}</Typography>
            <Typography className={classes.sectionSubtitle}>{config.subtitle}</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <>
                <Tooltip title='Add a new Reason Code'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#2d5ebb',
                      '&:hover': {
                        bgcolor: '#2d5ebb',
                      },
                    }}
                  >
                    New
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
              </>
            ) : (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={openEditDialog}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    '&:hover': {
                      bgcolor: '#2d5ebb',
                    },
                  }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                  sx={{ textTransform: 'none' }}
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
                  onClick={() => setSelectedId(null)}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#2d5ebb',
                    color: '#2d5ebb',
                    '&:hover': {
                      borderColor: '#2d5ebb',
                      bgcolor: alpha('#2d5ebb', 0.08),
                    },
                  }}
                >
                  Clear
                </Button>
              </>
            )}
          </Box>
        </Paper>

        <Paper elevation={1} className={classes.tablePaper}>
          <DataTable
            columns={columns}
            data={filteredRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            activeRowKey={selectedId ?? undefined}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
          />
        </Paper>
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={
          <Icon
            sx={{
              color: '#fff',
              fontSize: '1.1rem',
            }}
          />
        }
        accent={config.accent}
        title={config.dialogTitle}
        subtitle={config.dialogSubtitle}
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label={config.formLabel}
          size='small'
          fullWidth
          required
          value={form.name}
          placeholder={config.formPlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          placeholder='Brief description'
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={config.entityName}
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

export default ReasonCodeTable;
