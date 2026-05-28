import React, { ReactNode, useEffect, useMemo, useState, useCallback, memo } from 'react';
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
  Loader,
} from '@serviceops/component';
import { alpha, InputAdornment, FormControlLabel, Switch } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
import { useDebounce, useNotification } from '@serviceops/hooks';
import { TicketTypeSearchField } from './components/TicketTypeSearchField/TicketTypeSearchField';
import { WorkLocationSearchField } from './components/WorkLocationSearchField/WorkLocationSearchField';
import { DatePickerField } from './components/DatePickerField/DatePickerField';
import { TimePickerField } from './components/TimePickerField/TimePickerField';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'time' | 'number' | 'toggle' | 'ticketTypeSearch' | 'workLocationSearch';
  /** For workLocationSearch type - fields to auto-fill when location is selected */
  autoFillFields?: {
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
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

export const PanelHeader = memo(({ icon, title, accent }: PanelHeaderProps) => (
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
));

PanelHeader.displayName = 'PanelHeader';

// ── ActiveChip ─────────────────────────────────────────────────────────────────

export const ActiveChip = memo((v: unknown): React.ReactNode => {
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
});

ActiveChip.displayName = 'ActiveChip';

// ── PanelTable ─────────────────────────────────────────────────────────────────

export const PanelTable = memo(
  ({ accent, children }: { accent: string; children: React.ReactNode }) => (
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
  ),
);

PanelTable.displayName = 'PanelTable';

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

export const PanelToolbar = memo(
  ({ selectedLabel, onNew, onEdit, onDelete, search, onSearch, onClear }: PanelToolbarProps) => {
    const { classes } = useStyles();
    const hasSelection = selectedLabel !== null;

    // Debounce search to prevent excessive filtering
    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSearch = useDebounce(localSearch, 300);

    // Sync debounced value to parent
    useEffect(() => {
      onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

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
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
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
  },
);

PanelToolbar.displayName = 'PanelToolbar';

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
  isLoading?: boolean;
  loaderMessage?: string;
  enableSuccessMessage?: boolean;
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

const PanelContent = memo(
  ({
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
                sx={{
                  textTransform: 'none',
                  bgcolor: '#2d5ebb',
                  '&:hover': { bgcolor: '#2d5ebb' },
                }}
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
  },
);

PanelContent.displayName = 'PanelContent';

// ── Standard Variant (like Approvals section) ─────────────────────────────────

const StandardPanel = memo(
  ({
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
  },
);
StandardPanel.displayName = 'StandardPanel';

// ── Plain Variant (like ReasonCodes section) ──────────────────────────────────

const PlainPanel = memo(
  ({
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
  },
);

PlainPanel.displayName = 'PlainPanel';

// ── Main GenericPanel ──────────────────────────────────────────────────────────

export const GenericPanel = ({
  config,
  data,
  onSave,
  customColumns,
  variant = 'standard',
  defaultExpanded = true,
  isLoading = false,
  loaderMessage = 'Loading...',
  enableSuccessMessage = true,
}: GenericPanelProps) => {
  const { success, error: showError } = useNotification();
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

  // Initialize form when dialog opens
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

  // Use debounce for search to prevent excessive filtering
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return data;
    const lower = debouncedSearch.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(lower));
  }, [debouncedSearch, data]);

  const handleRowClick = useCallback((row: GenericData) => {
    setSelectedId((prev) => (prev === row.id ? null : row.id));
  }, []);

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setForm(createEmptyForm(config.fields));
    setIsNewDialog(true);
    setDialogOpen(true);
  }, [config.fields]);

  const handleEditClick = useCallback(() => {
    if (selectedId !== null && selectedRow) {
      setEditingRow(selectedRow);
      setIsNewDialog(false);
      setDialogOpen(true);
    }
  }, [selectedId, selectedRow]);

  const handleDeleteClick = useCallback(() => {
    if (selectedId !== null) {
      setDeleteOpen(true);
    }
  }, [selectedId]);

  const handleClearClick = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => {
      setEditingRow(null);
      setIsNewDialog(false);
      setSelectedId(null);
      setForm(createEmptyForm(config.fields));
    }, 0);
  }, [config.fields]);

  const handleSubmit = useCallback(async () => {
    // Check if form has any actual values to save
    const hasAnyValue = Object.values(form).some(
      (v) =>
        v !== undefined &&
        v !== '' &&
        v !== false &&
        v !== null &&
        (Array.isArray(v) ? v.length > 0 : true),
    );

    // For editing: check if anything actually changed
    // For new: only save if there's at least one value
    const shouldSave = editingRow
      ? config.fields.some((field) => {
          const original = editingRow[field.name];
          const current = form[field.name];
          return original !== current;
        })
      : hasAnyValue;

    // If no changes and no values, just close without saving
    if (!shouldSave) {
      setDialogOpen(false);
      setTimeout(() => {
        setEditingRow(null);
        setSelectedId(null);
        setIsNewDialog(false);
        setForm(createEmptyForm(config.fields));
      }, 0);
      return;
    }

    const newId = `${Date.now()}`;
    const updated = editingRow
      ? data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))
      : [...data, { id: newId, ...form }];

    try {
      await onSave(updated);
      if (enableSuccessMessage) {
        const message = editingRow
          ? `${config.title} updated successfully`
          : `${config.title} added successfully`;
        success(message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      showError(errorMessage);
    } finally {
      setDialogOpen(false);
      setTimeout(() => {
        setEditingRow(null);
        setSelectedId(null);
        setIsNewDialog(false);
        setForm(createEmptyForm(config.fields));
      }, 0);
    }
  }, [
    editingRow,
    data,
    form,
    onSave,
    config.fields,
    config.title,
    enableSuccessMessage,
    success,
    showError,
  ]);

  const handleDelete = useCallback(async () => {
    try {
      await onSave(data.filter((r) => r.id !== selectedId));
      if (enableSuccessMessage) {
        success(`${config.title} deleted successfully`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete. Please try again.';
      showError(errorMessage);
    } finally {
      setDeleteOpen(false);
      setTimeout(() => {
        setSelectedId(null);
        setEditingRow(null);
      }, 0);
    }
  }, [selectedId, data, onSave, config.title, enableSuccessMessage, success, showError]);

  const panelProps = useMemo(
    () => ({
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
    }),
    [
      config,
      columns,
      filtered,
      selectedId,
      search,
      handleRowClick,
      handleNewClick,
      handleEditClick,
      handleDeleteClick,
      handleClearClick,
      defaultExpanded,
    ],
  );

  // Memoized dialog close handler
  const handleDialogClose = useCallback(
    (_event: unknown, reason?: string) => {
      if (reason === undefined) {
        setDialogOpen(false);
        setTimeout(() => {
          setEditingRow(null);
          setIsNewDialog(false);
          setSelectedId(null);
          setForm(createEmptyForm(config.fields));
        }, 0);
      }
    },
    [config.fields],
  );

  // Memoized toggle change handler
  const handleToggleChange = useCallback((fieldName: string, checked: boolean) => {
    setForm((prev) => ({ ...prev, [fieldName]: checked }));
  }, []);

  // Memoized text field change handler
  const handleTextFieldChange = useCallback((fieldName: string, value: string) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader text={loaderMessage} />
      ) : variant === 'plain' ? (
        <PlainPanel {...panelProps} />
      ) : (
        <StandardPanel {...panelProps} />
      )}

      <ConfigFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        isEdit={!isNewDialog}
        icon={config.icon}
        accent={config.accent}
        title={config.entity}
        subtitle={config.subtitle}
        submitDisabled={false}
        submitLabel={editingRow ? 'Save' : 'Submit'}
        maxWidth='sm'
      >
        <LocalizationProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {config.fields.map((field) => {
              if (field.type === 'toggle') {
                return (
                  <FormControlLabel
                    key={field.name}
                    control={
                      <Switch
                        checked={form[field.name] === 'true' || form[field.name] === true}
                        onChange={(e) => handleToggleChange(field.name, e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.85rem' }}>{field.label}</Typography>}
                  />
                );
              }
              if (field.type === 'ticketTypeSearch') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <TicketTypeSearchField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
                  />
                );
              }
              if (field.type === 'workLocationSearch') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <WorkLocationSearchField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    onLocationSelect={
                      field.autoFillFields
                        ? (location) => {
                            if (field.autoFillFields?.city) {
                              setForm((prev) => ({
                                ...prev,
                                [field.autoFillFields!.city!]: location.city,
                              }));
                            }
                            if (field.autoFillFields?.state) {
                              setForm((prev) => ({
                                ...prev,
                                [field.autoFillFields!.state!]: location.state,
                              }));
                            }
                            if (field.autoFillFields?.country) {
                              setForm((prev) => ({
                                ...prev,
                                [field.autoFillFields!.country!]: location.country,
                              }));
                            }
                            if (field.autoFillFields?.timezone) {
                              setForm((prev) => ({
                                ...prev,
                                [field.autoFillFields!.timezone!]: location.timezone,
                              }));
                            }
                          }
                        : undefined
                    }
                    required={field.required}
                  />
                );
              }
              if (field.type === 'date') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <DatePickerField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
                  />
                );
              }
              if (field.type === 'time') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <TimePickerField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
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
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={textValue}
                  onChange={(e) => handleTextFieldChange(field.name, e.target.value)}
                />
              );
            })}
          </Box>
        </LocalizationProvider>
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

// Display names for memo debugging
GenericPanel.displayName = 'GenericPanel';
