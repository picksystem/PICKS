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
import { alpha, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TableConfig, TableField } from './types';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

interface PanelHeaderProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  accent: string;
}

export const PanelHeader = ({ icon, title, count, accent }: PanelHeaderProps) => (
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
    <Box sx={{ color: accent }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
  </Box>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericData = Record<string, any>;

interface GenericPanelProps {
  config: TableConfig;
  data: GenericData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any[]) => void;
}

const createColumns = (fields: TableField[]): Column<Record<string, unknown>>[] =>
  fields.map((field) => ({
    id: field.name,
    label: field.label,
    minWidth: field.minWidth || 140,
    format: (v: unknown): React.ReactNode => (
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
    ),
  }));

const createEmptyForm = (fields: TableField[]) =>
  fields.reduce(
    (acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    },
    {} as Record<string, string>,
  );

export const GenericPanel = ({ config, data, onSave }: GenericPanelProps) => {
  const { classes } = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GenericData | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Record<string, string>>(createEmptyForm(config.fields));

  const selectedRow = data.find((r) => r.id === selectedId);

  useEffect(() => {
    if (!dialogOpen) return;

    if (editingRow) {
      const values: Record<string, string> = {};
      config.fields.forEach((field) => {
        values[field.name] = String(editingRow[field.name] || '');
      });
      setForm(values);
    } else {
      setForm(createEmptyForm(config.fields));
    }
  }, [dialogOpen, editingRow, config.fields]);

  const columns = useMemo(() => createColumns(config.fields), [config.fields]);

  const filtered = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = () => {
    const updated = editingRow
      ? data.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))
      : [...data, { id: `${Date.now()}`, ...form }];

    onSave(updated);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    onSave(data.filter((r) => r.id !== selectedId));
    setDeleteOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <PanelHeader
          icon={config.icon}
          title={config.title}
          count={data.length}
          accent={config.accent}
        />

        <Paper
          variant='outlined'
          sx={{
            borderRadius: 0,
            borderTop: 'none',
            borderBottom: 'none',
            px: 1.5,
            py: 0.75,
          }}
        >
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <>
                <Tooltip title='Add a new Approval'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#2d5ebb',
                      '&:hover': {
                        bgcolor: '#2d5ebb',
                      },
                    }}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
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
                  sx={{ ml: 'auto' }}
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
              </>
            ) : (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    '&:hover': {
                      bgcolor: '#2d5ebb',
                    },
                  }}
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
            columns={columns as Column<GenericData>[]}
            data={filtered as GenericData[]}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            activeRowKey={selectedId || undefined}
            onRowClick={(row) =>
              setSelectedId(selectedId === (row.id as string) ? null : (row.id as string))
            }
          />
        </Paper>
      </Box>

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
        title={editingRow ? `Edit ${config.entity}` : `New ${config.entity}`}
        subtitle={config.subtitle}
        submitDisabled={false}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {config.fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            size='small'
            fullWidth
            required={field.required}
            value={form[field.name]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
          />
        ))}
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
