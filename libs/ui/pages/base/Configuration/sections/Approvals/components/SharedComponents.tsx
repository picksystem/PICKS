import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Button, Tooltip, InputAdornment, alpha } from '@mui/material';
import { TextField, DataTable, Column } from '@serviceops/component';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import tableConfig from './utils/approvals.json';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../../dialogs/ConfigDialogs/ConfigDialogs';
import { useStyles } from './SharedComponents.styles';
import {
  ConfigPanelProps,
  FormField,
  SharedDataTableProps,
  TableConfig,
  TableName,
} from './utils/util';

// ── Exported table configs ─────────────────────────────────────────────
export const TableConfigs: Record<TableName, TableConfig> = {
  approvalRecords: {
    name: 'approvalRecords',
    displayName: 'Approval Records',
    buttonName: tableConfig.tables.approvalRecords.buttonName,
    columns: tableConfig.tables.approvalRecords.columns,
    fields: tableConfig.tables.approvalRecords.fields as FormField[],
    deleteEntityName: tableConfig.tables.approvalRecords.deleteEntityName,
    deleteItemNameField: tableConfig.tables.approvalRecords.deleteItemNameField,
    searchFields: tableConfig.tables.approvalRecords.searchFields,
  },

  assocUserProfiles: {
    name: 'assocUserProfiles',
    displayName: 'Associated User Profiles',
    buttonName: tableConfig.tables.assocUserProfiles.buttonName,
    columns: tableConfig.tables.assocUserProfiles.columns,
    fields: tableConfig.tables.assocUserProfiles.fields as FormField[],
    deleteEntityName: tableConfig.tables.assocUserProfiles.deleteEntityName,
    deleteItemNameField: tableConfig.tables.assocUserProfiles.deleteItemNameField,
    searchFields: tableConfig.tables.assocUserProfiles.searchFields,
  },

  consultantRoles: {
    name: 'consultantRoles',
    displayName: 'Consultant Roles',
    buttonName: tableConfig.tables.consultantRoles.buttonName,
    columns: tableConfig.tables.consultantRoles.columns,
    fields: tableConfig.tables.consultantRoles.fields as FormField[],
    deleteEntityName: tableConfig.tables.consultantRoles.deleteEntityName,
    deleteItemNameField: tableConfig.tables.consultantRoles.deleteItemNameField,
    searchFields: tableConfig.tables.consultantRoles.searchFields,
  },

  workingTimes: {
    name: 'workingTimes',
    displayName: 'Working Times',
    buttonName: tableConfig.tables.workingTimes.buttonName,
    columns: tableConfig.tables.workingTimes.columns,
    fields: tableConfig.tables.workingTimes.fields as FormField[],
    deleteEntityName: tableConfig.tables.workingTimes.deleteEntityName,
    deleteItemNameField: tableConfig.tables.workingTimes.deleteItemNameField,
    searchFields: tableConfig.tables.workingTimes.searchFields,
  },
};

// ── SharedDataTable ────────────────────────────────────────────────────

const SharedDataTable: React.FC<SharedDataTableProps> = ({
  tableName,
  data,
  selectedId = null,
  onRowClick,
  initialRowsPerPage = 10,
  searchable = true,
}) => {
  const { classes } = useStyles();
  const config = tableConfig.tables[tableName];

  const columns: Column<any>[] = useMemo(
    () =>
      config.columns.map((col: any) => ({
        id: col.id,
        label: col.label,
        minWidth: col.minWidth ?? 100,

        format: (value: unknown): React.ReactNode => (
          <Typography
            variant='body2'
            className={col.truncate ? classes.cellTruncate : classes.cellNormal}
            noWrap={col.truncate}
          >
            {String(value || '—')}
          </Typography>
        ),
      })),
    [config.columns, classes],
  );

  return (
    <Paper elevation={1} className={classes.dataTablePaper}>
      <DataTable
        columns={columns}
        data={data}
        rowKey='id'
        initialRowsPerPage={initialRowsPerPage}
        onRowClick={onRowClick}
        activeRowKey={selectedId ?? undefined}
        searchable={searchable}
      />
    </Paper>
  );
};

// ── Panel Header ───────────────────────────────────────────────────────
const PanelHeader = ({
  icon,
  title,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  accent: string;
}) => {
  const { classes } = useStyles();

  return (
    <Box
      className={classes.panelHeader}
      sx={{
        bgcolor: alpha(accent, 0.08),
        borderColor: alpha(accent, 0.25),
      }}
    >
      <Box className={classes.panelHeaderIcon} sx={{ color: accent }}>
        {icon}
      </Box>

      <Typography className={classes.panelHeaderTitle} sx={{ color: accent }}>
        {title}
      </Typography>

      {count !== undefined && (
        <Typography variant='caption' color='text.secondary' className={classes.panelHeaderCount}>
          {count} {count !== 1 ? 'items' : 'item'}
        </Typography>
      )}
    </Box>
  );
};

// ── ConfigPanel ────────────────────────────────────────────────────────
function ConfigPanel<T extends { id: string }>({
  config,
  data,
  selectedId,
  onSave,
  onSelectId,
  fields,
  deleteEntityName,
  deleteItemNameField,
}: ConfigPanelProps<T>) {
  const { classes } = useStyles();

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const activeSelectedId = selectedId !== undefined ? selectedId : internalSelectedId;
  const setActiveSelectedId = selectedId !== undefined ? onSelectId : setInternalSelectedId;
  const selectedRow = data.find((r) => r.id === activeSelectedId) ?? null;
  const currentTableConfig = useMemo(() => TableConfigs[config.tableName], [config.tableName]);
  const searchFields = currentTableConfig.searchFields as string[];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => {
        const value = row[field as keyof T];

        return typeof value === 'string' && value.toLowerCase().includes(term);
      }),
    );
  }, [data, searchTerm, searchFields]);

  const getInitialForm = () => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue ?? '';
    });

    return initial;
  };

  const [form, setForm] = useState<Record<string, string>>(getInitialForm);

  useEffect(() => {
    if (!dialogOpen) return;

    setForm(
      editingRow
        ? fields.reduce(
            (acc, field) => {
              const value = editingRow[field.name as keyof T];
              acc[field.name] = typeof value === 'string' ? value : String(value ?? '');
              return acc;
            },
            {} as Record<string, string>,
          )
        : getInitialForm(),
    );
  }, [dialogOpen, editingRow]);

  const handleSubmit = () => {
    const requiredField = fields.find((field) => field.required);

    if (requiredField && !form[requiredField.name]?.trim()) {
      return;
    }

    let next: T[];
    if (editingRow) {
      next = data.map((row) =>
        row.id === editingRow.id ? ({ ...editingRow, ...form } as T) : row,
      );

      setActiveSelectedId(editingRow.id);
    } else {
      const newRow = {
        id: `${Date.now()}`,
        ...form,
      } as T;
      next = [...data, newRow];
      setActiveSelectedId(newRow.id);
    }

    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(data.filter((row) => row.id !== selectedRow.id));
    setActiveSelectedId(null);
    setDeleteOpen(false);
  };

  const getDeleteItemName = () => {
    if (!selectedRow) return '';

    if (deleteItemNameField) {
      const value = selectedRow[deleteItemNameField];
      return typeof value === 'string' ? value : '';
    }
    return '';
  };

  return (
    <Box className={classes.container}>
      <PanelHeader
        icon={config.icon}
        title={config.title}
        count={data.length}
        accent={config.accent}
      />

      <Paper variant='outlined' className={classes.toolbarPaper}>
        <Box className={classes.toolbarContainer}>
          {!selectedRow ? (
            <Tooltip title={`Add new ${config.title.toLowerCase()}`}>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                className={classes.primaryButton}
                sx={{ bgcolor: config.accent }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Box className={classes.actionButtons}>
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                className={classes.primaryButton}
                sx={{ bgcolor: config.accent }}
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
                className={classes.dangerButton}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>

              <Button
                size='small'
                variant='outlined'
                className={classes.clearButton}
                onClick={() => setActiveSelectedId(null)}
              >
                Clear
              </Button>
            </Box>
          )}

          <TextField
            size='small'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classes.tableSearchField}
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
      </Paper>

      <SharedDataTable
        tableName={config.tableName}
        data={filteredData}
        selectedId={activeSelectedId}
        searchable={false}
        onRowClick={(row: any) => setActiveSelectedId(activeSelectedId === row.id ? null : row.id)}
      />

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={config.icon}
        accent={config.accent}
        title={editingRow ? `Edit ${config.title}` : `New ${config.title}`}
        subtitle={`Configure ${config.title.toLowerCase()} settings`}
        submitDisabled={!form[fields.find((f) => f.required)?.name ?? '']?.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type === 'time' ? 'time' : undefined}
            size='small'
            fullWidth
            required={field.required}
            disabled={field.disabled}
            value={form[field.name]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            multiline={field.type === 'multiline'}
            minRows={field.type === 'multiline' ? 2 : undefined}
            slotProps={{
              inputLabel: field.type === 'time' ? { shrink: true } : undefined,
            }}
          />
        ))}
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={deleteEntityName}
        itemName={getDeleteItemName()}
      />
    </Box>
  );
}

export default ConfigPanel;

export { SharedDataTable };
