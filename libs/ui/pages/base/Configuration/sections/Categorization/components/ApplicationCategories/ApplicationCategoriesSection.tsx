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
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigApplicationCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const EMPTY_APP_CAT_FORM = {
  applicationId: '',
  applicationName: '',
  categoryName: '',
  description: '',
};

interface ApplicationCategoriesSectionProps {
  data?: IConfigApplicationCategory[];
  onDataChange?: (data: IConfigApplicationCategory[]) => void;
}

const ApplicationCategoriesSection = ({
  data,
  onDataChange,
}: ApplicationCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_CAT_FORM);

  const applications = apiCat?.applications ?? [];

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationCategories) {
      setRows(apiCat.applicationCategories);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              applicationName: editingRow.applicationName,
              categoryName: editingRow.categoryName,
              description: editingRow.description,
            }
          : EMPTY_APP_CAT_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          r.categoryName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigApplicationCategory[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: next,
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.categoryName.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationCategory = { id: `appcat_${Date.now()}`, ...form };
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

  const columns: Column<IConfigApplicationCategory>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'categoryName',
      label: 'Application Category',
      minWidth: 180,
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
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderSpecialIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Categories</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage categories assigned to applications
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <>
                <Tooltip title='Add a new Application Category'>
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
              </>
            ) : (
              <>
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
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Clear
                </Button>
              </>
            )}
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
        accent='#2d5ebb'
        title='Application Category'
        subtitle='Manage categories assigned to applications'
        submitDisabled={!form.categoryName.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <TextField
            label='Application'
            size='small'
            fullWidth
            value={form.applicationName}
            disabled
          />
        ) : (
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
        )}
        <TextField
          label='Application Category'
          size='small'
          fullWidth
          required
          value={form.categoryName}
          onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
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
        entityName='Application Category'
        itemName={selectedRow?.categoryName}
      />
    </Accordion>
  );
};

export { ApplicationCategoriesSection };
