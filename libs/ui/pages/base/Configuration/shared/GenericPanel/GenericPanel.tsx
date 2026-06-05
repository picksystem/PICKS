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
import { alpha, Alert, InputAdornment, FormControlLabel, Switch } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ConfigFormDialog, ConfigDeleteDialog } from '@serviceops/configdialogs';
import { useStyles } from './styles';
import { GenericAccordion } from '../GenericAccordion/GenericAccordion';
import { useDebounce, useFieldError, useNotification } from '@serviceops/hooks';
import { TicketTypeSearchField } from './components/TicketTypeSearchField/TicketTypeSearchField';
import { WorkLocationSearchField } from './components/WorkLocationSearchField/WorkLocationSearchField';
import { ServiceLineSearchField } from './components/ServiceLineSearchField/ServiceLineSearchField';
import { ApplicationSearchField } from './components/ApplicationSearchField/ApplicationSearchField';
import { QueueSearchField } from './components/QueueSearchField/QueueSearchField';
import { DatePickerField } from './components/DatePickerField/DatePickerField';
import { TimePickerField } from './components/TimePickerField/TimePickerField';
import { DurationPickerField } from './components/DurationPickerField/DurationPickerField';
import { DateTimePickerField } from './components/DateTimePickerField/DateTimePickerField';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  sx?: import('@mui/system').SxProps<import('@mui/material').Theme>;
  type?:
    | 'text'
    | 'date'
    | 'datetime'
    | 'time'
    | 'duration'
    | 'number'
    | 'toggle'
    | 'ticketTypeSearch'
    | 'workLocationSearch'
    | 'serviceLineSearch'
    | 'applicationSearch'
    | 'queueSearch';
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

export const PanelTable = memo(({ children }: { children: React.ReactNode }) => (
  <Paper elevation={0}>{children}</Paper>
));

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
  /** Set to false to hide the New button (for read-only/view-only panels) */
  enableNewButton?: boolean;
  /** Set to false to hide the Edit button */
  enableEditButton?: boolean;
  /** Set to false to hide the Delete button */
  enableDeleteButton?: boolean;
  /** Optional controlled selected row ID */
  selectedRowId?: string | null;
  /** Optional callback when a row is selected (works with selectedRowId) */
  onRowSelect?: (id: string | null) => void;
  /** Optional callback when New button is clicked */
  onNewClick?: () => void;
  /** Optional callback when Edit button is clicked */
  onEditClick?: () => void;
  /** Optional callback when Delete button is clicked */
  onDeleteClick?: () => void;
  /**
   * Optional cross-field validator. When provided, the returned message is
   * rendered as an inline error at the bottom of the form and blocks submit
   * (greys the Submit button). Re-evaluates on every form change.
   */
  validate?: (form: FormData, data: GenericData[], editingRow: GenericData | null) => string | null;
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
  enableNewButton?: boolean;
  enableEditButton?: boolean;
  enableDeleteButton?: boolean;
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
    enableNewButton = true,
    enableEditButton = true,
    enableDeleteButton = true,
  }: PanelContentProps) => {
    const { classes } = useStyles();
    const hasSelection = selectedId !== null;

    return (
      <Paper
        elevation={0}
        className={classes.actionToolbar}
        sx={{ border: 'none', boxShadow: 'none' }}
      >
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
              {enableNewButton && (
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
              )}
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
              {enableEditButton && (
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
              )}
              {enableDeleteButton && (
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
              )}
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
    enableNewButton = true,
    enableEditButton = true,
    enableDeleteButton = true,
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
    enableNewButton?: boolean;
    enableEditButton?: boolean;
    enableDeleteButton?: boolean;
  }) => {
    return (
      <Box
        sx={{
          mt: 1.5,
          border: '1px solid',
          borderColor: alpha(config.accent, 0.25),
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
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
          enableNewButton={enableNewButton}
          enableEditButton={enableEditButton}
          enableDeleteButton={enableDeleteButton}
        />

        <Paper elevation={0} sx={{ borderRadius: 0 }}>
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
    enableNewButton = true,
    enableEditButton = true,
    enableDeleteButton = true,
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
    enableNewButton?: boolean;
    enableEditButton?: boolean;
    enableDeleteButton?: boolean;
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
        <Box
          sx={{
            mt: 1.5,
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(config.accent, 0.25),
          }}
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
            enableNewButton={enableNewButton}
            enableEditButton={enableEditButton}
            enableDeleteButton={enableDeleteButton}
          />

          <Paper elevation={0} sx={{ borderRadius: 0 }}>
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
  enableNewButton = true,
  enableEditButton = true,
  enableDeleteButton = true,
  selectedRowId,
  onRowSelect,
  onNewClick,
  onEditClick,
  onDeleteClick,
  validate,
}: GenericPanelProps) => {
  const { success, error: showError } = useNotification();
  const reqError = useFieldError();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GenericData | null>(null);
  const [isNewDialog, setIsNewDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormData>(createEmptyForm(config.fields));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Use controlled selection if provided, otherwise use internal state
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const isControlled = selectedRowId !== undefined;
  const activeSelection = isControlled ? selectedRowId : internalSelectedId;
  const activeSetSelection = isControlled
    ? (id: string | null) => onRowSelect?.(id)
    : setInternalSelectedId;

  const selectedRow = useMemo(
    () => data.find((r) => r.id === activeSelection),
    [data, activeSelection],
  );

  // Reset internal selection when data changes (only for uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      setInternalSelectedId((prev) => {
        if (prev && !data.find((r) => r.id === prev)) return null;
        return prev;
      });
    }
  }, [data, isControlled]);

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
    setFormErrors({});
    setShowValidation(false);
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
    // Use only the configured searchable fields instead of JSON.stringify
    const searchableKeys = config.fields.map((f) => f.name);
    return data.filter((row) =>
      searchableKeys.some((key) => {
        const val = row[key];
        return val !== null && String(val).toLowerCase().includes(lower);
      }),
    );
  }, [debouncedSearch, data, config.fields]);

  const handleRowClick = useCallback(
    (row: GenericData) => {
      activeSetSelection(activeSelection === row.id ? null : row.id);
    },
    [activeSelection, activeSetSelection],
  );

  const handleNewClick = useCallback(() => {
    // Call external callback if provided
    if (onNewClick) {
      onNewClick();
      return;
    }
    // Default behavior
    setEditingRow(null);
    setForm(createEmptyForm(config.fields));
    setIsNewDialog(true);
    setDialogOpen(true);
  }, [config.fields, onNewClick]);

  const handleEditClick = useCallback(() => {
    // Call external callback if provided
    if (onEditClick) {
      onEditClick();
      return;
    }
    // Default behavior
    if (activeSelection !== null && selectedRow) {
      setEditingRow(selectedRow);
      setIsNewDialog(false);
      setDialogOpen(true);
    }
  }, [activeSelection, selectedRow, onEditClick]);

  const handleDeleteClick = useCallback(() => {
    // Call external callback if provided
    if (onDeleteClick) {
      onDeleteClick();
      return;
    }
    // Default behavior
    if (activeSelection !== null) {
      setDeleteOpen(true);
    }
  }, [activeSelection, onDeleteClick]);

  const handleClearClick = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => {
      setEditingRow(null);
      setIsNewDialog(false);
      activeSetSelection(null);
      setForm(createEmptyForm(config.fields));
    }, 0);
  }, [config.fields, activeSetSelection]);

  const handleSubmit = useCallback(async () => {
    // For editing: check if anything actually changed
    // For new: treat the form as having values if any field is filled
    const hasAnyValue = Object.values(form).some(
      (v) =>
        v !== undefined &&
        v !== '' &&
        v !== false &&
        v !== null &&
        (Array.isArray(v) ? v.length > 0 : true),
    );
    const hasChanges = editingRow
      ? config.fields.some((field) => {
          const original = editingRow[field.name];
          const current = form[field.name];
          return original !== current;
        })
      : hasAnyValue;

    // Always run required-field validation when the user attempts to submit.
    // This prevents bypassing validation by submitting a completely empty new form.
    const errors = validateForm();
    const hasRequiredErrors = Object.keys(errors).length > 0;

    if (hasRequiredErrors) {
      setFormErrors(errors);
      setShowValidation(true);
      showError('Please fill in all required fields');
      return;
    }

    if (validate) {
      const dupErr = validate(form, data, editingRow);
      if (dupErr) {
        showError(dupErr);
        return;
      }
    }

    // No required errors, but nothing to save (e.g. user opened a row, made no
    // changes, and clicked Submit) — close silently.
    if (!hasChanges) {
      setDialogOpen(false);
      setTimeout(() => {
        setEditingRow(null);
        activeSetSelection(null);
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
        activeSetSelection(null);
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
    activeSetSelection,
    validate,
  ]);

  const handleDelete = useCallback(async () => {
    try {
      await onSave(data.filter((r) => r.id !== activeSelection));
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
        activeSetSelection(null);
        setEditingRow(null);
      }, 0);
    }
  }, [
    activeSelection,
    data,
    onSave,
    config.title,
    enableSuccessMessage,
    success,
    showError,
    activeSetSelection,
  ]);

  const panelProps = useMemo(
    () => ({
      config,
      columns: columns as Column<GenericData>[],
      filtered: filtered as GenericData[],
      selectedId: activeSelection,
      search,
      onSearchChange: setSearch,
      onRowClick: handleRowClick,
      onNewClick: handleNewClick,
      onEditClick: handleEditClick,
      onDeleteClick: handleDeleteClick,
      onClearClick: handleClearClick,
      defaultExpanded,
      enableNewButton,
      enableEditButton,
      enableDeleteButton,
    }),
    [
      config,
      columns,
      filtered,
      activeSelection,
      search,
      handleRowClick,
      handleNewClick,
      handleEditClick,
      handleDeleteClick,
      handleClearClick,
      defaultExpanded,
      enableNewButton,
      enableEditButton,
      enableDeleteButton,
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
          activeSetSelection(null);
          setForm(createEmptyForm(config.fields));
        }, 0);
      }
    },
    [config.fields, activeSetSelection],
  );

  // Memoized toggle change handler
  const handleToggleChange = useCallback((fieldName: string, checked: boolean) => {
    setForm((prev) => ({ ...prev, [fieldName]: checked }));
  }, []);

  // Memoized text field change handler
  const handleTextFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setForm((prev) => ({ ...prev, [fieldName]: value }));
      if (showValidation) {
        setFormErrors((prev) => {
          if (!prev[fieldName]) return prev;
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    },
    [showValidation],
  );

  // Validate required fields. Returns a map of field name -> error message.
  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    config.fields.forEach((field) => {
      if (!field.required) return;
      const value = form[field.name];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (typeof value === 'boolean' && value === false) ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) errors[field.name] = 'required';
    });
    return errors;
  }, [config.fields, form]);

  // Cross-field validation (e.g. duplicate-row detection). Re-evaluates on
  // every form/data change so the inline error appears/disappears live.
  const crossFieldError = useMemo(
    () => (validate ? validate(form, data, editingRow) : null),
    [validate, form, data, editingRow],
  );

  // Reflect required-field validity in the submit button so users get visual
  // feedback before they click Submit. Also block submit on any cross-field
  // validation error returned by the optional `validate` prop.
  const formIsInvalid = useMemo(
    () =>
      (config.fields.some((f) => f.required) && Object.keys(validateForm()).length > 0) ||
      !!crossFieldError,
    [config.fields, validateForm, crossFieldError],
  );

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
        submitDisabled={formIsInvalid}
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
                    onSelect={(option) => {
                      setForm((prev) => ({ ...prev, ticketTypeName: option.name }));
                    }}
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
              if (field.type === 'serviceLineSearch') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <ServiceLineSearchField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
                  />
                );
              }
              if (field.type === 'applicationSearch') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <ApplicationSearchField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
                  />
                );
              }
              if (field.type === 'queueSearch') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <QueueSearchField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
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
              if (field.type === 'datetime') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <DateTimePickerField
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
              if (field.type === 'duration') {
                const currentValue = (form[field.name] ?? '') as string;
                return (
                  <DurationPickerField
                    key={field.name}
                    label={field.label}
                    value={currentValue}
                    onChange={(value) => handleTextFieldChange(field.name, value)}
                    required={field.required}
                    sx={field.sx}
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
                  error={Boolean(showValidation && formErrors[field.name])}
                  helperText={reqError(showValidation, formErrors[field.name])}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={textValue}
                  onChange={(e) => handleTextFieldChange(field.name, e.target.value)}
                />
              );
            })}
            {crossFieldError && (
              <Alert severity='error' sx={{ mt: 0.5 }}>
                {crossFieldError}
              </Alert>
            )}
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
