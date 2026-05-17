import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Button, Tooltip, InputAdornment, alpha } from '@mui/material';
import { TextField, DataTable, Column } from '@serviceops/component';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import tableConfig from './utils/timesheets.json';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../../dialogs/ConfigDialogs/ConfigDialogs';
import { useStyles } from './SharedComponents.styles';
import { ConfigPanelProps, FormField, TableConfig, TableName } from './utils/util';

// ── Exported table configs ──────────────────────────────────────────────────────
export const TableConfigs: Record<TableName, TableConfig> = {
  timesheetProjects: {
    name: 'timesheetProjects',
    displayName: 'Timesheet Projects',
    buttonName: tableConfig.tables.timesheetProjects.buttonName,
    columns: tableConfig.tables.timesheetProjects.columns,
    fields: tableConfig.tables.timesheetProjects.fields as FormField[],
    deleteEntityName: tableConfig.tables.timesheetProjects.deleteEntityName,
    deleteItemNameField: tableConfig.tables.timesheetProjects.deleteItemNameField,
    searchFields: tableConfig.tables.timesheetProjects.searchFields,
  },
  projectCategories: {
    name: 'projectCategories',
    displayName: 'Project Categories',
    buttonName: tableConfig.tables.projectCategories.buttonName,
    columns: tableConfig.tables.projectCategories.columns,
    fields: tableConfig.tables.projectCategories.fields as FormField[],
    deleteEntityName: tableConfig.tables.projectCategories.deleteEntityName,
    deleteItemNameField: tableConfig.tables.projectCategories.deleteItemNameField,
    searchFields: tableConfig.tables.projectCategories.searchFields,
  },
  serviceLineEntries: {
    name: 'serviceLineEntries',
    displayName: 'Service Line Entries',
    buttonName: tableConfig.tables.serviceLineEntries.buttonName,
    columns: tableConfig.tables.serviceLineEntries.columns,
    fields: tableConfig.tables.serviceLineEntries.fields as FormField[],
    deleteEntityName: tableConfig.tables.serviceLineEntries.deleteEntityName,
    deleteItemNameField: tableConfig.tables.serviceLineEntries.deleteItemNameField,
    searchFields: tableConfig.tables.serviceLineEntries.searchFields,
  },
  applicationEntries: {
    name: 'applicationEntries',
    displayName: 'Application Entries',
    buttonName: tableConfig.tables.applicationEntries.buttonName,
    columns: tableConfig.tables.applicationEntries.columns,
    fields: tableConfig.tables.applicationEntries.fields as FormField[],
    deleteEntityName: tableConfig.tables.applicationEntries.deleteEntityName,
    deleteItemNameField: tableConfig.tables.applicationEntries.deleteItemNameField,
    searchFields: tableConfig.tables.applicationEntries.searchFields,
  },
  queueEntries: {
    name: 'queueEntries',
    displayName: 'Queue Entries',
    buttonName: tableConfig.tables.queueEntries.buttonName,
    columns: tableConfig.tables.queueEntries.columns,
    fields: tableConfig.tables.queueEntries.fields as FormField[],
    deleteEntityName: tableConfig.tables.queueEntries.deleteEntityName,
    deleteItemNameField: tableConfig.tables.queueEntries.deleteItemNameField,
    searchFields: tableConfig.tables.queueEntries.searchFields,
  },
  resourceEntries: {
    name: 'resourceEntries',
    displayName: 'Resource Entries',
    buttonName: tableConfig.tables.resourceEntries.buttonName,
    columns: tableConfig.tables.resourceEntries.columns,
    fields: tableConfig.tables.resourceEntries.fields as FormField[],
    deleteEntityName: tableConfig.tables.resourceEntries.deleteEntityName,
    deleteItemNameField: tableConfig.tables.resourceEntries.deleteItemNameField,
    searchFields: tableConfig.tables.resourceEntries.searchFields,
  },
};

// ── SharedDataTable ─────────────────────────────────────────────────────────────
export const getColumns = (tableName: TableName): Column<any>[] => {
  const config = tableConfig.tables[tableName];
  return config.columns.map((col: any) => ({
    id: col.id,
    label: col.label,
    minWidth: col.minWidth ?? 100,
    format: col.truncate
      ? (v: unknown): React.ReactNode => (
          <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.secondary' }} noWrap>
            {String(v || '—')}
          </Typography>
        )
      : (v: unknown): React.ReactNode => (
          <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.82rem' }}>
            {String(v || '—')}
          </Typography>
        ),
  }));
};

interface SharedDataTableProps {
  tableName: TableName;
  data: any[];
  selectedId?: string | null;
  onRowClick?: (row: any) => void;
  initialRowsPerPage?: number;
  searchable?: boolean;
}

const SharedDataTable: React.FC<SharedDataTableProps> = ({
  tableName,
  data,
  selectedId = null,
  onRowClick,
  initialRowsPerPage = 10,
  searchable = true,
}) => {
  const columns = getColumns(tableName);

  return (
    <Paper elevation={1} className={useStyles().classes.dataTablePaper}>
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

// ── Panel Header ────────────────────────────────────────────────────────────────
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
}) => (
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
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
    {count !== undefined && (
      <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
        {count} {count !== 1 ? 'items' : 'item'}
      </Typography>
    )}
  </Box>
);

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

  const selectedRow = data.find((r: any) => r.id === activeSelectedId) ?? null;

  const tableConfig = useMemo(() => TableConfigs[config.tableName], [config.tableName]);
  const searchFields = tableConfig.searchFields as string[];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row: any) =>
      searchFields.some((field) => {
        const val = row[field as keyof T];
        return typeof val === 'string' && val.toLowerCase().includes(term);
      }),
    );
  }, [data, searchTerm, searchFields]);

  const getInitialForm = () => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.name] = f.defaultValue ?? '';
    });
    return initial;
  };

  const [form, setForm] = useState<Record<string, string>>(getInitialForm);

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? fields.reduce(
              (acc, f) => {
                const val = editingRow[f.name as keyof T];
                acc[f.name] = typeof val === 'string' ? val : String(val ?? '');
                return acc;
              },
              {} as Record<string, string>,
            )
          : getInitialForm(),
      );
    }
  }, [dialogOpen, editingRow]);

  const handleSubmit = () => {
    const requiredField = fields.find((f) => f.required);
    if (requiredField && !form[requiredField.name]?.trim()) return;

    let next: T[];
    if (editingRow) {
      next = data.map((r: any) => (r.id === editingRow.id ? ({ ...editingRow, ...form } as T) : r));
      setActiveSelectedId(editingRow.id);
    } else {
      const n = { id: `${Date.now()}`, ...form } as T;
      next = [...data, n];
      setActiveSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(data.filter((r: any) => r.id !== selectedRow.id));
    setActiveSelectedId(null);
    setDeleteOpen(false);
  };

  const getDeleteItemName = () => {
    if (!selectedRow) return '';
    if (deleteItemNameField) {
      const val = selectedRow[deleteItemNameField];
      return typeof val === 'string' ? val : '';
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

      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            p: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          {!selectedRow ? (
            <Tooltip title={`Add new ${config.title.toLowerCase()}`}>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: config.accent,
                  px: 2,
                  width: { xs: '100%', sm: 'auto' },
                }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                sx={{ bgcolor: config.accent, px: 2 }}
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
                sx={{ px: 2 }}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
              <Button
                size='small'
                variant='outlined'
                onClick={() => setActiveSelectedId(null)}
                sx={{ px: 2 }}
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
            sx={{ width: { xs: '100%', sm: '160px' }, ml: { sm: 'auto' } }}
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
        onRowClick={(row: any) => setActiveSelectedId(activeSelectedId === row.id ? null : row.id)}
        searchable={false}
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
            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
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
