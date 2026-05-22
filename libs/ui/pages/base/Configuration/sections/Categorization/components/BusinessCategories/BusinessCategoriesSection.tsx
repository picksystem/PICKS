import React, { useState, useEffect } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigBusinessCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const ACCENT_BC = '#2d5ebb';
const EMPTY_CAT_FORM = { name: '', description: '', head: '' };

interface BusinessCategoriesSectionProps {
  data?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigBusinessCategory[]) => void;
}

const BusinessCategoriesSection = ({ data, onDataChange }: BusinessCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigBusinessCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigBusinessCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_FORM);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.businessCategories) {
      setRows(apiCat.businessCategories);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? { name: editingRow.name, description: editingRow.description, head: editingRow.head }
          : EMPTY_CAT_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.head.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigBusinessCategory[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: next,
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigBusinessCategory = { id: `bcat_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigBusinessCategory>[] = [
    {
      id: 'name',
      label: 'Business Category Name',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'head',
      label: 'Business Category Head',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#2d5ebb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AccountTreeIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Business Categories</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage business category groups and their designated heads
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new business category'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                >
                  New
                </Button>
              </Tooltip>
            ) : (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingRow(selectedRow);
                  setDialogOpen(true);
                }}
              >
                Edit
              </Button>
            )}
            {selectedRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            )}
            {selectedRow && (
              <>
                <Box
                  sx={{
                    width: '1px',
                    height: '20px',
                    bgcolor: alpha('#2d5ebb', 0.3),
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedId(null)}
                >
                  Clear
                </Button>
              </>
            )}
            <TextField
              size='small'
              placeholder='Search…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
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
        </Paper>
        <Paper elevation={1} className={classes.tablePaper}>
          <DataTable
            columns={columns}
            data={filtered}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccountTreeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_BC}
        title='Business Category'
        subtitle='Manage business category groups and their designated heads'
        submitDisabled={!form.name.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        <TextField
          label='Business Category Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <TextField
          label='Business Category Head'
          size='small'
          fullWidth
          value={form.head}
          onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Business Category'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

export { BusinessCategoriesSection };
