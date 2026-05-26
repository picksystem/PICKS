import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  DataTable,
  Column,
  Chip,
} from '@serviceops/component';
import { alpha, InputAdornment, FormControlLabel, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useStyles } from './styles';
import { GenericAccordion } from '../GenericAccordion/GenericAccordion';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'number' | 'toggle';
}

export interface TableConfig {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  entity: string;
  fields: TableField[];
}

interface PanelHeaderProps {
  icon: React.ReactNode;
  title: string;
  accent: string;
}

export const PanelHeader = ({ icon, title, accent }: PanelHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      bgcolor: alpha(accent, 0.08),
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderRadius: '10px 10px 0 0',
      borderBottom: 'none',
    }}
  >
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: accent }}>{title}</Typography>
  </Box>
);

// ── ActiveChip ─────────────────────────────────────────────────────────────────

export const ActiveChip = (v: unknown): React.ReactNode => {
  const on = Boolean(v);
  return (
    <Chip
      label={on ? 'Active' : 'Inactive'}
      size='small'
      sx={{
        height: 20,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: on ? alpha('#059669', 0.12) : alpha('#9ca3af', 0.12),
        color: on ? '#059669' : '#6b7280',
      }}
    />
  );
};

// ── PanelTable ─────────────────────────────────────────────────────────────────

export const PanelTable = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
  <Paper
    elevation={1}
    sx={{
      borderRadius: '0 0 10px 10px',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderTop: 'none',
    }}
  >
    {children}
  </Paper>
);

// ── PanelToolbar ───────────────────────────────────────────────────────────────

export interface PanelToolbarProps {
  accent: string;
  selectedLabel: string | null;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  search: string;
  onSearch: (v: string) => void;
  onClear: () => void;
}

export const PanelToolbar = ({
  selectedLabel,
  onNew,
  onEdit,
  onDelete,
  search,
  onSearch,
  onClear,
}: PanelToolbarProps) => {
  const { classes } = useStyles();
  const hasSelection = selectedLabel !== null;

  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 0,
        borderTop: 'none',
        borderBottom: 'none',
        px: 1,
        py: 0.75,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box className={classes.toolbarButtons}>
        {!hasSelection ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box className={classes.newButtonContainer}>
              <Tooltip title='Add new row'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    '&:hover': { bgcolor: '#2d5ebb' },
                  }}
                  onClick={onNew}
                >
                  New
                </Button>
              </Tooltip>
            </Box>
            <Box className={classes.searchFieldContainer}>
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className={classes.tableSearchField}
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
          </Box>
        ) : (
          <>
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: '#2d5ebb',
                '&:hover': { bgcolor: '#2d5ebb' },
              }}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              sx={{ textTransform: 'none' }}
              onClick={onDelete}
            >
              Delete
            </Button>
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': {
                  borderColor: '#2d5ebb',
                  bgcolor: alpha('#2d5ebb', 0.08),
                },
              }}
              onClick={onClear}
            >
              Clear
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericData = Record<string, any>;
type FormData = Record<string, string | boolean | number | undefined>;

export type GenericPanelVariant = 'standard' | 'plain';

interface GenericPanelProps {
  config: TableConfig;
  data: GenericData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any[]) => void;
  customColumns?: Column<Record<string, unknown>>[];
  variant?: GenericPanelVariant;
  defaultExpanded?: boolean;
}

const createColumns = (fields: TableField[]): Column<Record<string, unknown>>[] =>
  fields.map((field) => ({
    id: field.name,
    label: field.label,
    minWidth: field.minWidth || 140,
    format: (v: unknown): React.ReactNode => {
      if (field.type === 'toggle') {
        return (
          <Typography
            variant='body2'
            sx={{ fontSize: '0.8rem', color: v ? 'text.primary' : 'text.disabled' }}
          >
            {v ? 'Yes' : 'No'}
          </Typography>
        );
      }
      return (
        <Typography
          variant='body2'
          sx={{
            fontSize: field.bold ? '0.82rem' : '0.8rem',
            fontWeight: field.bold ? 600 : 400,
            color: v ? 'text.primary' : 'text.disabled',
          }}
        >
          {String(v || '—')}
        </Typography>
      );
    },
  }));

const createEmptyForm = (fields: TableField[]): FormData =>
  fields.reduce((acc, field) => {
    if (field.type === 'toggle') {
      acc[field.name] = field.defaultValue ?? false;
    } else if (field.type === 'number') {
      acc[field.name] = field.defaultValue ?? '';
    } else {
      acc[field.name] = (field.defaultValue ?? '') as string;
    }
    return acc;
  }, {} as FormData);

// ── Common Panel Content ───────────────────────────────────────────────────────

interface PanelContentProps {
  config: TableConfig;
  columns: Column<GenericData>[];
  filtered: GenericData[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onRowClick: (row: GenericData) => void;
  onNewClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onClearClick: () => void;
}

const PanelContent = ({
  config,
  selectedId,
  search,
  onSearchChange,
  onNewClick,
  onEditClick,
  onDeleteClick,
  onClearClick,
}: PanelContentProps) => {
  const { classes } = useStyles();
  const hasSelection = selectedId !== null;

  return (
    <Paper variant='outlined' className={classes.actionToolbar}>
      <Box className={classes.toolbarButtons}>
        {!hasSelection ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
            }}
          >
            <Box className={classes.newButtonContainer}>
              <Tooltip title={`Add a new ${config.entity}`}>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={onNewClick}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    width: '100%',
                    '&:hover': { bgcolor: '#2d5ebb' },
                  }}
                >
                  New
                </Button>
              </Tooltip>
            </Box>
            <Box className={classes.searchFieldContainer}>
              <TextField
                size='small'
                placeholder='Search...'
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className={classes.tableSearchField}
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
          </Box>
        ) : (
          <>
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              onClick={onEditClick}
              sx={{ textTransform: 'none', bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
            >
              Edit
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={onDeleteClick}
              sx={{ textTransform: 'none' }}
            >
              Delete
            </Button>
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              onClick={onClearClick}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': { borderColor: '#2d5ebb', bgcolor: alpha('#2d5ebb', 0.08) },
              }}
            >
              Clear
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

// ── Standard Variant (like Approvals section) ─────────────────────────────────

const StandardPanel = ({
  config,
  columns,
  filtered,
  selectedId,
  search,
  onSearchChange,
  onRowClick,
  onNewClick,
  onEditClick,
  onDeleteClick,
  onClearClick,
}: {
  config: TableConfig;
  columns: Column<GenericData>[];
  filtered: GenericData[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onRowClick: (row: GenericData) => void;
  onNewClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onClearClick: () => void;
}) => {
  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader icon={config.icon} title={config.title} accent={config.accent} />

      <PanelContent
        config={config}
        columns={columns}
        filtered={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={onSearchChange}
        onRowClick={onRowClick}
        onNewClick={onNewClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onClearClick={onClearClick}
      />

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
        <DataTable<GenericData>
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          activeRowKey={selectedId ?? undefined}
          onRowClick={onRowClick}
        />
      </Paper>
    </Box>
  );
};

// ── Plain Variant (like ReasonCodes section) ──────────────────────────────────

const PlainPanel = ({
  config,
  columns,
  filtered,
  selectedId,
  search,
  onSearchChange,
  onRowClick,
  onNewClick,
  onEditClick,
  onDeleteClick,
  onClearClick,
  defaultExpanded = true,
}: {
  config: TableConfig;
  columns: Column<GenericData>[];
  filtered: GenericData[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onRowClick: (row: GenericData) => void;
  onNewClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onClearClick: () => void;
  defaultExpanded?: boolean;
}) => {
  const { classes } = useStyles();

  return (
    <GenericAccordion
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      accent={config.accent}
      defaultExpanded={defaultExpanded}
      className={classes.sectionAccordion}
    >
      <PanelContent
        config={config}
        columns={columns}
        filtered={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={onSearchChange}
        onRowClick={onRowClick}
        onNewClick={onNewClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onClearClick={onClearClick}
      />

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
        <DataTable<GenericData>
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          activeRowKey={selectedId ?? undefined}
          onRowClick={onRowClick}
        />
      </Paper>
    </GenericAccordion>
  );
};

// ── Main GenericPanel ──────────────────────────────────────────────────────────

export const GenericPanel = ({
  config,
  data,
  onSave,
  customColumns,
  variant = 'standard',
  defaultExpanded = true,
}: GenericPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GenericData | null>(null);
  const [isNewDialog, setIsNewDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormData>(createEmptyForm(config.fields));

  const selectedRow = useMemo(() => data.find((r) => r.id === selectedId), [data, selectedId]);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedId((prev) => {
      if (prev && !data.find((r) => r.id === prev)) return null;
      return prev;
    });
  }, [data]);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    if (editingRow) {
      const values: FormData = {};
      config.fields.forEach((field) => {
        if (field.type === 'toggle') {
          values[field.name] = editingRow[field.name] ?? false;
        } else if (field.type === 'number') {
          values[field.name] = editingRow[field.name] ?? '';
        } else {
          values[field.name] = String(editingRow[field.name] || '');
        }
      });
      setForm(values);
    } else {
      setForm(createEmptyForm(config.fields));
    }
  }, [dialogOpen, editingRow, config.fields]);

  const columns = useMemo(
    () => customColumns || createColumns(config.fields),
    [config.fields, customColumns],
  );

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  }, [search, data]);

  const handleRowClick = (row: GenericData) => {
    setSelectedId((prev) => (prev === row.id ? null : row.id));
  };

  const handleNewClick = () => {
    setEditingRow(null);
    setForm(createEmptyForm(config.fields));
    setIsNewDialog(true);
    setDialogOpen(true);
  };

  const handleEditClick = () => {
    if (selectedId !== null && selectedRow) {
      setEditingRow(selectedRow);
      setIsNewDialog(false);
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedId !== null) {
      setDeleteOpen(true);
    }
  };

  const handleClearClick = () => {
    // First close the dialog, then reset all state in a deferred manner
    setDialogOpen(false);
    // Use setTimeout to ensure dialog closes before resetting other state
    setTimeout(() => {
      setEditingRow(null);
      setIsNewDialog(false);
      setSelectedId(null);
      setForm(createEmptyForm(config.fields));
    }, 0);
  };

  const handleSubmit = () => {
    const newId = `${Date.now()}`;
    const updated = editingRow
      ? data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))
      : [...data, { id: newId, ...form }];

    onSave(updated);
    setDialogOpen(false);
    setTimeout(() => {
      setEditingRow(null);
      setSelectedId(null);
      setIsNewDialog(false);
      setForm(createEmptyForm(config.fields));
    }, 0);
  };

  const handleDelete = () => {
    onSave(data.filter((r) => r.id !== selectedId));
    setDeleteOpen(false);
    setTimeout(() => {
      setSelectedId(null);
      setEditingRow(null);
    }, 0);
  };

  const panelProps = {
    config,
    columns: columns as Column<GenericData>[],
    filtered: filtered as GenericData[],
    selectedId,
    search,
    onSearchChange: setSearch,
    onRowClick: handleRowClick,
    onNewClick: handleNewClick,
    onEditClick: handleEditClick,
    onDeleteClick: handleDeleteClick,
    onClearClick: handleClearClick,
    defaultExpanded,
  };

  return (
    <>
      {variant === 'plain' ? <PlainPanel {...panelProps} /> : <StandardPanel {...panelProps} />}

      <ConfigFormDialog
        open={dialogOpen}
        onClose={(event, reason) => {
          // Only close from Cancel button click (reason is undefined for buttons)
          // Ignore backdrop clicks and escape key
          if (reason === undefined) {
            setDialogOpen(false);
            setTimeout(() => {
              setEditingRow(null);
              setIsNewDialog(false);
              setSelectedId(null);
              setForm(createEmptyForm(config.fields));
            }, 0);
          }
        }}
        onSubmit={handleSubmit}
        isEdit={!isNewDialog}
        icon={config.icon}
        accent={config.accent}
        title={editingRow ? `Edit ${config.entity}` : `New ${config.entity}`}
        subtitle={config.subtitle}
        submitDisabled={false}
        submitLabel={editingRow ? 'Save' : 'Submit'}
        maxWidth='sm'
      >
        <Box sx={{ display: dialogOpen ? 'flex' : 'none', flexDirection: 'column', gap: 2.5 }}>
          {config.fields.map((field) => {
            if (field.type === 'toggle') {
              return (
                <FormControlLabel
                  key={field.name}
                  control={
                    <Switch
                      checked={form[field.name] === 'true' || form[field.name] === true}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.name]: e.target.checked,
                        }))
                      }
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem' }}>{field.label}</Typography>}
                />
              );
            }
            const textValue: string =
              typeof form[field.name] === 'boolean' ? '' : String(form[field.name] ?? '');
            return (
              <TextField
                key={field.name}
                label={field.label}
                size='small'
                fullWidth
                required={field.required}
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                value={textValue}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
              />
            );
          })}
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={config.entity}
        itemName={(selectedRow?.[config.fields[0].name] as string) || ''}
      />
    </>
  );
};
