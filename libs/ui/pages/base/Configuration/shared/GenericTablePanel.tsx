import { useState, useEffect } from 'react';
import { Box, Paper, Button, TextField, DataTable, Column } from '@serviceops/component';
import { alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useStyles } from '../sections/Timesheets/styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

// ── Types ─────────────────────────────────────────────────────────────────────

export type RowData = any;

export interface FormField {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
}

export interface TableConfig {
  title: string;
  accent: string;
  icon: React.ReactNode;
  panelTitle: string;
  columns: Column<any>[];
  formConfig: { title: string; subtitle: string; entity: string; fields: readonly FormField[] };
  searchFields: string[];
  getSelectedLabel: (row: RowData) => string;
  getId: (row: RowData) => string;
  idPrefix: string;
}

// ── Generic CRUD Panel ──────────────────────────────────────────────────────────

export const GenericCRUDPanel = ({
  config,
  data,
  onSave,
}: {
  config: TableConfig;
  data: any[];
  onSave: (data: any[]) => void;
}) => {
  const { classes } = useStyles();

  const [rows, setRows] = useState(data);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(config.formConfig.fields.map((f) => [f.name, ''])),
  );

  useEffect(() => {
    setRows(data);
  }, [data]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? Object.fromEntries(
            config.formConfig.fields.map((f) => [f.name, String(editingRow[f.name] ?? '')]),
          )
        : Object.fromEntries(config.formConfig.fields.map((f) => [f.name, ''])),
    );
  }, [dialogOpen, editingRow, config.formConfig.fields]);

  const selectedRow = rows.find((r) => config.getId(r) === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) =>
        config.searchFields.some((field) =>
          String(r[field] ?? '')
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : rows;

  const handleSubmit = () => {
    const requiredField = config.formConfig.fields.find((f) => f.required);
    if (requiredField && !form[requiredField.name]?.trim()) return;
    const rowData = { ...form };
    const newId = `${config.idPrefix}_${Date.now()}`;
    const next = editingRow
      ? rows.map((r) =>
          config.getId(r) === config.getId(editingRow) ? { ...editingRow, ...rowData } : r,
        )
      : [...rows, { ...rowData, id: newId, [config.idPrefix]: newId }];
    onSave(next);
    setSelectedId(editingRow ? config.getId(editingRow) : config.getId(next[next.length - 1]));
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(rows.filter((r) => config.getId(r) !== config.getId(selectedRow)));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const btnSx = { bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' }, textTransform: 'none' };
  const outlinedBtnSx = {
    borderColor: '#2d5ebb',
    color: '#2d5ebb',
    '&:hover': { borderColor: '#2d5ebb', bgcolor: alpha('#2d5ebb', 0.08) },
    textTransform: 'none',
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      {/* Panel Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha(config.accent, 0.08),
          border: '1px solid',
          borderColor: alpha(config.accent, 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <Box sx={{ color: config.accent, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
        <Box sx={{ fontWeight: 700, fontSize: '0.9rem', color: config.accent }}>
          {config.panelTitle}
        </Box>
      </Box>

      {/* Toolbar */}
      <Paper
        variant='outlined'
        sx={{
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          px: 1.5,
          py: 0.75,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={btnSx}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>

              <TextField
                size='small'
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={classes.tableSearchField}
                sx={{ ml: 'auto' }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Box component='span' sx={{ display: 'flex', alignItems: 'center' }}>
                        <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      </Box>
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
                sx={btnSx}
                onClick={() => {
                  setEditingRow(selectedRow);
                  setDialogOpen(true);
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
                sx={outlinedBtnSx}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(config.accent, 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={config.columns}
          data={filtered}
          rowKey={config.idPrefix}
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) =>
            setSelectedId(selectedId === config.getId(row) ? null : config.getId(row))
          }
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>

      {/* Form Dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<Box sx={{ color: '#fff' }}>{config.icon}</Box>}
        accent={config.accent}
        title={config.formConfig.title}
        subtitle={config.formConfig.subtitle}
        submitDisabled={
          !config.formConfig.fields.filter((f) => f.required).every((f) => form[f.name]?.trim())
        }
        maxWidth='sm'
      >
        {config.formConfig.fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            multiline={field.multiline}
            minRows={field.minRows ?? 2}
            required={field.required}
            value={form[field.name]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.placeholder}
          />
        ))}
      </ConfigFormDialog>

      {/* Delete Dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={config.formConfig.entity}
        itemName={selectedRow ? config.getSelectedLabel(selectedRow) : ''}
      />
    </Box>
  );
};
