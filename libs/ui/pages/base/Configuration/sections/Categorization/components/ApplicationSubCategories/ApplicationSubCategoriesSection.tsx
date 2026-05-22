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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigApplicationSubCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const EMPTY_APP_SUBCAT_FORM = {
  applicationId: '',
  applicationName: '',
  applicationCategoryId: '',
  applicationCategoryName: '',
  subCategoryName: '',
  description: '',
};

interface ApplicationSubCategoriesSectionProps {
  data?: IConfigApplicationSubCategory[];
  onDataChange?: (data: IConfigApplicationSubCategory[]) => void;
}

const ApplicationSubCategoriesSection = ({ data, onDataChange }: ApplicationSubCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationSubCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationSubCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_SUBCAT_FORM);

  const applications = apiCat?.applications ?? [];
  const allCategories = apiCat?.applicationCategories ?? [];
  const filteredCategories = allCategories.filter(
    (c) => !form.applicationId || c.applicationId === form.applicationId,
  );

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationSubCategories) {
      setRows(apiCat.applicationSubCategories);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              applicationName: editingRow.applicationName,
              applicationCategoryId: editingRow.applicationCategoryId,
              applicationCategoryName: editingRow.applicationCategoryName,
              subCategoryName: editingRow.subCategoryName,
              description: editingRow.description,
            }
          : EMPTY_APP_SUBCAT_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationCategoryName.toLowerCase().includes(search.toLowerCase()) ||
          r.subCategoryName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigApplicationSubCategory[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: next,
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({
      ...f,
      applicationId: id,
      applicationName: app?.name ?? '',
      applicationCategoryId: '',
      applicationCategoryName: '',
    }));
  };

  const handleCategoryChange = (id: string) => {
    const cat = allCategories.find((c) => c.id === id);
    setForm((f) => ({
      ...f,
      applicationCategoryId: id,
      applicationCategoryName: cat?.categoryName ?? '',
    }));
  };

  const handleSubmit = () => {
    if (!form.subCategoryName.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationSubCategory = { id: `appsubcat_${Date.now()}`, ...form };
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

  const columns: Column<IConfigApplicationSubCategory>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'applicationCategoryName',
      label: 'Application Category',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'subCategoryName',
      label: 'Application Sub-Category',
      minWidth: 190,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
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
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CategoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Sub-Categories</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage sub-categories assigned to application categories
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new application sub-category'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                    bgcolor: alpha('#7c3aed', 0.3),
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
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
        icon={<CategoryIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#7c3aed'
        title='Application Sub-Category'
        subtitle='Manage sub-categories assigned to application categories'
        submitDisabled={!form.subCategoryName.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <>
            <TextField
              label='Application'
              size='small'
              fullWidth
              value={form.applicationName}
              disabled
            />
            <TextField
              label='Application Category'
              size='small'
              fullWidth
              value={form.applicationCategoryName}
              disabled
            />
          </>
        ) : (
          <>
            <FormControl size='small' fullWidth required>
              <InputLabel>Application</InputLabel>
              <Select
                label='Application'
                value={form.applicationId}
                onChange={(e) => handleApplicationChange(e.target.value)}
              >
                {applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size='small' fullWidth required disabled={!form.applicationId}>
              <InputLabel>Application Category</InputLabel>
              <Select
                label='Application Category'
                value={form.applicationCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {filteredCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          label='Application Sub-Category'
          size='small'
          fullWidth
          required
          value={form.subCategoryName}
          onChange={(e) => setForm((f) => ({ ...f, subCategoryName: e.target.value }))}
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
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Application Sub-Category'
        itemName={selectedRow?.subCategoryName}
      />
    </Accordion>
  );
};

export { ApplicationSubCategoriesSection };