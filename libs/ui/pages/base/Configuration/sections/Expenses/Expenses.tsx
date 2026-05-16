import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Link,
  TextField,
  InputAdornment,
  Divider,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AppsIcon from '@mui/icons-material/Apps';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  IConfigExpenseProjectEntry,
  IConfigExpenseCategoryEntry,
  IConfigExpenseCategorySubCategory,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';
import {
  AssocPanel,
  toAssocRows,
  fromAssocRows,
  PanelHeader,
  PanelToolbar,
  PanelTable,
} from '../../shared/assocPanel';
import { mkCell, mkDescCell, mkChip } from '../../utils/cellRenderers';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT_PROJ = '#16a34a';
const ACCENT_CAT = '#0369a1';
const ACCENT_SUB = '#7c3aed';
const ACCENT_SL = '#059669';
const ACCENT_APP = '#2563eb';
const ACCENT_QUE = '#7c3aed';
const ACCENT_RES = '#be185d';

// ── Sub-category columns (Expense Category Sub-Category panel) ────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subCatColumns: Column<any>[] = [
  { id: 'category', label: 'Category', minWidth: 150, format: mkCell(true) },
  { id: 'subCategory', label: 'Sub-Category', minWidth: 150, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 140, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(ACCENT_SUB) },
];

// ── Expense Category Sub-Category Panel ───────────────────────────────────────

const EMPTY_CAT_SUB: Omit<IConfigExpenseCategorySubCategory, 'id'> = {
  category: '',
  subCategory: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
};

const ExpenseCategorySubCategoryPanel = ({ onBack }: { onBack: () => void }) => {
  const { expenses: apiEXP, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigExpenseCategorySubCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigExpenseCategorySubCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_SUB);

  useEffect(() => {
    if (apiEXP?.expenseCategorySubCategories) setRows(apiEXP.expenseCategorySubCategories);
  }, [apiEXP]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            category: editingRow.category,
            subCategory: editingRow.subCategory,
            description: editingRow.description,
            expensesGroup: editingRow.expensesGroup,
            expensesType: editingRow.expensesType,
            billable: editingRow.billable,
          }
        : EMPTY_CAT_SUB,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.category.toLowerCase().includes(search.toLowerCase()) ||
          r.subCategory.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesGroup.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesType.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigExpenseCategorySubCategory[]) => {
    setRows(next);
    saveSection('expenses', {
      expenseProjects: apiEXP?.expenseProjects ?? [],
      expenseProjectSubCategories: apiEXP?.expenseProjectSubCategories ?? [],
      expenseCategories: apiEXP?.expenseCategories ?? [],
      expenseCategorySubCategories: next,
      serviceLineEntries: apiEXP?.serviceLineEntries ?? [],
      applicationEntries: apiEXP?.applicationEntries ?? [],
      queueEntries: apiEXP?.queueEntries ?? [],
      resourceEntries: apiEXP?.resourceEntries ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.category.trim() || !form.subCategory.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseCategorySubCategory = { id: `expcatsub_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_SUB}
        icon={<AccountTreeIcon fontSize='small' />}
        title='Expense Category Sub-Categories'
        onBack={onBack}
      />
      <PanelToolbar
        accent={ACCENT_SUB}
        selectedLabel={selectedRow ? `${selectedRow.category} / ${selectedRow.subCategory}` : null}
        onNew={() => {
          setEditingRow(null);
          setDialogOpen(true);
        }}
        onEdit={() => {
          setEditingRow(selectedRow);
          setDialogOpen(true);
        }}
        onDelete={() => setDeleteOpen(true)}
        search={search}
        onSearch={setSearch}
        onClear={() => setSelectedId(null)}
      />
      <PanelTable accent={ACCENT_SUB}>
        <DataTable
          columns={subCatColumns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
          activeRowKey={selectedId ?? undefined}
        />
      </PanelTable>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccountTreeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_SUB}
        title='Expense Category Sub-Category'
        subtitle='Define a sub-category for an expense category'
        submitDisabled={!form.category.trim() || !form.subCategory.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Category'
          size='small'
          fullWidth
          required
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder='e.g. Travel, Equipment'
        />
        <TextField
          label='Sub-Category'
          size='small'
          fullWidth
          required
          value={form.subCategory}
          onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
          placeholder='e.g. Flights, Laptops'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description'
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Expenses Group'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesGroup}
            onChange={(e) => setForm((f) => ({ ...f, expensesGroup: e.target.value }))}
            placeholder='e.g. Operations'
          />
          <TextField
            label='Expenses Type'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesType}
            onChange={(e) => setForm((f) => ({ ...f, expensesType: e.target.value }))}
            placeholder='e.g. Direct, Indirect'
          />
        </Box>
        <TextField
          label='Billable'
          size='small'
          fullWidth
          value={form.billable}
          onChange={(e) => setForm((f) => ({ ...f, billable: e.target.value }))}
          placeholder='e.g. Billable, Non-Billable'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Category Sub-Category'
        itemName={selectedRow ? `${selectedRow.category} / ${selectedRow.subCategory}` : undefined}
      />
    </Box>
  );
};

// ── Main table columns ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mainColumns = (accent: string): Column<any>[] => [
  { id: 'project', label: 'Project', minWidth: 140, format: mkCell(true) },
  { id: 'name', label: 'Name', minWidth: 140, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 130, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(accent) },
  { id: 'itemization', label: 'Itemization', minWidth: 110, format: mkChip('#0891b2') },
];

// ── Expense Projects accordion (panel-switching) ───────────────────────────────

type ActivePanel = 'none' | 'serviceLine' | 'application' | 'queue' | 'resource';

const EMPTY_PROJ_FORM: Omit<IConfigExpenseProjectEntry, 'id'> = {
  project: '',
  name: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
  itemization: '',
};

const ExpenseProjects = () => {
  const { classes } = useStyles();
  const { expenses: apiEXP, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigExpenseProjectEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigExpenseProjectEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_PROJ_FORM);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const panelActive = activePanel !== 'none';

  useEffect(() => {
    if (apiEXP?.expenseProjects) setRows(apiEXP.expenseProjects);
  }, [apiEXP]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(editingRow ? { ...editingRow } : EMPTY_PROJ_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesGroup.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesType.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  // Full expenses section snapshot — used as base when association panels save
  const expBase = () => ({
    expenseProjects: apiEXP?.expenseProjects ?? [],
    expenseProjectSubCategories: apiEXP?.expenseProjectSubCategories ?? [],
    expenseCategories: apiEXP?.expenseCategories ?? [],
    expenseCategorySubCategories: apiEXP?.expenseCategorySubCategories ?? [],
    serviceLineEntries: apiEXP?.serviceLineEntries ?? [],
    applicationEntries: apiEXP?.applicationEntries ?? [],
    queueEntries: apiEXP?.queueEntries ?? [],
    resourceEntries: apiEXP?.resourceEntries ?? [],
  });

  const save = (next: IConfigExpenseProjectEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...expBase(), expenseProjects: next });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseProjectEntry = { id: `expp_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_PROJ,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ReceiptLongIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Expense Projects</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define expense projects with their group, type, billability and associations
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!panelActive &&
              (!selectedRow ? (
                <Tooltip title='Add a new expense project'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_PROJ,
                      '&:hover': { bgcolor: alpha(ACCENT_PROJ, 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
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
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_PROJ,
                      '&:hover': { bgcolor: alpha(ACCENT_PROJ, 0.85) },
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
                </>
              ))}

            <Divider
              orientation='vertical'
              flexItem
              className={classes.toolbarDivider}
              sx={{ mx: 0.5 }}
            />

            <Button
              size='small'
              startIcon={<AccountTreeIcon />}
              variant={activePanel === 'serviceLine' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel((p) => (p === 'serviceLine' ? 'none' : 'serviceLine'))}
              sx={{
                textTransform: 'none',
                borderColor: ACCENT_SL,
                color: activePanel === 'serviceLine' ? '#fff' : ACCENT_SL,
                bgcolor: activePanel === 'serviceLine' ? ACCENT_SL : undefined,
                '&:hover': {
                  bgcolor:
                    activePanel === 'serviceLine' ? alpha(ACCENT_SL, 0.85) : alpha(ACCENT_SL, 0.07),
                  borderColor: ACCENT_SL,
                },
              }}
            >
              Add to Service Line
            </Button>
            <Button
              size='small'
              startIcon={<AppsIcon />}
              variant={activePanel === 'application' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel((p) => (p === 'application' ? 'none' : 'application'))}
              sx={{
                textTransform: 'none',
                borderColor: ACCENT_APP,
                color: activePanel === 'application' ? '#fff' : ACCENT_APP,
                bgcolor: activePanel === 'application' ? ACCENT_APP : undefined,
                '&:hover': {
                  bgcolor:
                    activePanel === 'application'
                      ? alpha(ACCENT_APP, 0.85)
                      : alpha(ACCENT_APP, 0.07),
                  borderColor: ACCENT_APP,
                },
              }}
            >
              Add to Application
            </Button>
            <Button
              size='small'
              startIcon={<QueueIcon />}
              variant={activePanel === 'queue' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel((p) => (p === 'queue' ? 'none' : 'queue'))}
              sx={{
                textTransform: 'none',
                borderColor: ACCENT_QUE,
                color: activePanel === 'queue' ? '#fff' : ACCENT_QUE,
                bgcolor: activePanel === 'queue' ? ACCENT_QUE : undefined,
                '&:hover': {
                  bgcolor:
                    activePanel === 'queue' ? alpha(ACCENT_QUE, 0.85) : alpha(ACCENT_QUE, 0.07),
                  borderColor: ACCENT_QUE,
                },
              }}
            >
              Add to Queue
            </Button>
            <Button
              size='small'
              startIcon={<PersonIcon />}
              variant={activePanel === 'resource' ? 'contained' : 'outlined'}
              onClick={() => setActivePanel((p) => (p === 'resource' ? 'none' : 'resource'))}
              sx={{
                textTransform: 'none',
                borderColor: ACCENT_RES,
                color: activePanel === 'resource' ? '#fff' : ACCENT_RES,
                bgcolor: activePanel === 'resource' ? ACCENT_RES : undefined,
                '&:hover': {
                  bgcolor:
                    activePanel === 'resource' ? alpha(ACCENT_RES, 0.85) : alpha(ACCENT_RES, 0.07),
                  borderColor: ACCENT_RES,
                },
              }}
            >
              Add to Resource
            </Button>

            {!panelActive && (
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
                        <SearchIcon fontSize='small' />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Box>

          {!panelActive && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {!panelActive && (
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable
              columns={mainColumns(ACCENT_PROJ)}
              data={filtered}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        )}

        {activePanel === 'serviceLine' && (
          <AssocPanel
            Icon={AccountTreeIcon}
            accent={ACCENT_SL}
            title='Service Line Associations'
            entityName='Service Line Entry'
            assocLabel='Service Line'
            idPrefix='expsl'
            rows={toAssocRows(apiEXP?.serviceLineEntries ?? [], 'serviceLine')}
            onSave={(next) =>
              saveSection('expenses', {
                ...expBase(),
                serviceLineEntries: fromAssocRows(next, 'serviceLine'),
              })
            }
            onBack={() => setActivePanel('none')}
          />
        )}
        {activePanel === 'application' && (
          <AssocPanel
            Icon={AppsIcon}
            accent={ACCENT_APP}
            title='Application Associations'
            entityName='Application Entry'
            assocLabel='Application'
            idPrefix='expapp'
            rows={toAssocRows(apiEXP?.applicationEntries ?? [], 'application')}
            onSave={(next) =>
              saveSection('expenses', {
                ...expBase(),
                applicationEntries: fromAssocRows(next, 'application'),
              })
            }
            onBack={() => setActivePanel('none')}
          />
        )}
        {activePanel === 'queue' && (
          <AssocPanel
            Icon={QueueIcon}
            accent={ACCENT_QUE}
            title='Queue Associations'
            entityName='Queue Entry'
            assocLabel='Queue'
            idPrefix='expq'
            rows={toAssocRows(apiEXP?.queueEntries ?? [], 'queue')}
            onSave={(next) =>
              saveSection('expenses', {
                ...expBase(),
                queueEntries: fromAssocRows(next, 'queue'),
              })
            }
            onBack={() => setActivePanel('none')}
          />
        )}
        {activePanel === 'resource' && (
          <AssocPanel
            Icon={PersonIcon}
            accent={ACCENT_RES}
            title='Resource Associations'
            entityName='Resource Entry'
            assocLabel='Resource'
            idPrefix='expres'
            rows={toAssocRows(apiEXP?.resourceEntries ?? [], 'resource')}
            onSave={(next) =>
              saveSection('expenses', {
                ...expBase(),
                resourceEntries: fromAssocRows(next, 'resource'),
              })
            }
            onBack={() => setActivePanel('none')}
          />
        )}
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ReceiptLongIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_PROJ}
        title='Expense Project'
        subtitle='Define an expense project with its group, type and billability'
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
          placeholder='e.g. Q2 Infrastructure'
        />
        <TextField
          label='Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Field Operations, IT Upgrade'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of this expense project'
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Expenses Group'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesGroup}
            onChange={(e) => setForm((f) => ({ ...f, expensesGroup: e.target.value }))}
            placeholder='e.g. Operations, Admin'
          />
          <TextField
            label='Expenses Type'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesType}
            onChange={(e) => setForm((f) => ({ ...f, expensesType: e.target.value }))}
            placeholder='e.g. Direct, Indirect'
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Billable'
            size='small'
            sx={{ flex: 1 }}
            value={form.billable}
            onChange={(e) => setForm((f) => ({ ...f, billable: e.target.value }))}
            placeholder='e.g. Billable, Non-Billable'
          />
          <TextField
            label='Itemization'
            size='small'
            sx={{ flex: 1 }}
            value={form.itemization}
            onChange={(e) => setForm((f) => ({ ...f, itemization: e.target.value }))}
            placeholder='e.g. Required, Optional'
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Project'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Expense Category accordion ────────────────────────────────────────────────

const EMPTY_CAT_FORM: Omit<IConfigExpenseCategoryEntry, 'id'> = {
  project: '',
  name: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
  itemization: '',
};

const ExpenseCategory = () => {
  const { classes } = useStyles();
  const { expenses: apiEXP, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigExpenseCategoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigExpenseCategoryEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_FORM);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (apiEXP?.expenseCategories) setRows(apiEXP.expenseCategories);
  }, [apiEXP]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(editingRow ? { ...editingRow } : EMPTY_CAT_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesGroup.toLowerCase().includes(search.toLowerCase()) ||
          r.expensesType.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigExpenseCategoryEntry[]) => {
    setRows(next);
    saveSection('expenses', {
      expenseProjects: apiEXP?.expenseProjects ?? [],
      expenseProjectSubCategories: apiEXP?.expenseProjectSubCategories ?? [],
      expenseCategories: next,
      expenseCategorySubCategories: apiEXP?.expenseCategorySubCategories ?? [],
      serviceLineEntries: apiEXP?.serviceLineEntries ?? [],
      applicationEntries: apiEXP?.applicationEntries ?? [],
      queueEntries: apiEXP?.queueEntries ?? [],
      resourceEntries: apiEXP?.resourceEntries ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseCategoryEntry = { id: `expcat_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_CAT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CategoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Expense Category</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define expense categories with their group, type, billability and itemization
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!panelOpen &&
              (!selectedRow ? (
                <Tooltip title='Add a new expense category'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_CAT,
                      '&:hover': { bgcolor: alpha(ACCENT_CAT, 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
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
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_CAT,
                      '&:hover': { bgcolor: alpha(ACCENT_CAT, 0.85) },
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
                </>
              ))}

            <Divider
              orientation='vertical'
              flexItem
              className={classes.toolbarDivider}
              sx={{ mx: 0.5 }}
            />

            <Button
              size='small'
              startIcon={<AccountTreeIcon />}
              variant={panelOpen ? 'contained' : 'outlined'}
              onClick={() => setPanelOpen((p) => !p)}
              sx={{
                textTransform: 'none',
                borderColor: ACCENT_SUB,
                color: panelOpen ? '#fff' : ACCENT_SUB,
                bgcolor: panelOpen ? ACCENT_SUB : undefined,
                '&:hover': {
                  bgcolor: panelOpen ? alpha(ACCENT_SUB, 0.85) : alpha(ACCENT_SUB, 0.07),
                  borderColor: ACCENT_SUB,
                },
              }}
            >
              Sub-Category
            </Button>

            {!panelOpen && (
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
                        <SearchIcon fontSize='small' />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Box>

          {!panelOpen && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {!panelOpen && (
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable
              columns={mainColumns(ACCENT_CAT)}
              data={filtered}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        )}

        {panelOpen && <ExpenseCategorySubCategoryPanel onBack={() => setPanelOpen(false)} />}
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
        accent={ACCENT_CAT}
        title='Expense Category'
        subtitle='Define an expense category with its group, type and billability'
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
          placeholder='e.g. Q2 Infrastructure'
        />
        <TextField
          label='Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Travel, Supplies'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of this expense category'
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Expenses Group'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesGroup}
            onChange={(e) => setForm((f) => ({ ...f, expensesGroup: e.target.value }))}
            placeholder='e.g. Operations, Admin'
          />
          <TextField
            label='Expenses Type'
            size='small'
            sx={{ flex: 1 }}
            value={form.expensesType}
            onChange={(e) => setForm((f) => ({ ...f, expensesType: e.target.value }))}
            placeholder='e.g. Direct, Indirect'
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Billable'
            size='small'
            sx={{ flex: 1 }}
            value={form.billable}
            onChange={(e) => setForm((f) => ({ ...f, billable: e.target.value }))}
            placeholder='e.g. Billable, Non-Billable'
          />
          <TextField
            label='Itemization'
            size='small'
            sx={{ flex: 1 }}
            value={form.itemization}
            onChange={(e) => setForm((f) => ({ ...f, itemization: e.target.value }))}
            placeholder='e.g. Required, Optional'
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Category'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const Expenses = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ExpenseProjects />
      <ExpenseCategory />
    </Box>
  );
};

export default Expenses;
