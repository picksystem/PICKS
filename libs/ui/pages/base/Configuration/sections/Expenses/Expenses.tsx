import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  DataTable,
  Column,
} from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, alpha } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AppsIcon from '@mui/icons-material/Apps';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import {
  IConfigExpenseProjectEntry,
  IConfigExpenseCategoryEntry,
  IConfigExpenseCategorySubCategory,
} from '@serviceops/interfaces';
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

// ── Shared constants ───────────────────────────────────────────────────────────

const EMPTY_CAT_SUB: Omit<IConfigExpenseCategorySubCategory, 'id'> = {
  category: '',
  subCategory: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
};

const EMPTY_CAT_FORM: Omit<IConfigExpenseCategoryEntry, 'id'> = {
  project: '',
  name: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
  itemization: '',
};

const EMPTY_PROJ_FORM: Omit<IConfigExpenseProjectEntry, 'id'> = {
  project: '',
  name: '',
  description: '',
  expensesGroup: '',
  expensesType: '',
  billable: '',
  itemization: '',
};

// ── Expense Category Sub-Category View ────────────────────────────────────────

type ActiveExpenseView = 'category' | 'subCategory';
type ActiveProjectView = 'project' | 'serviceLine' | 'application' | 'queue' | 'resource';

const ExpenseCategorySubCategoryPanel = () => {
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

// ── Expense Category View ──────────────────────────────────────────────────────

const ExpenseCategoryPanel = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigExpenseCategoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigExpenseCategoryEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_FORM);

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
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_CAT}
        icon={<CategoryIcon fontSize='small' />}
        title='Expense Categories'
      />
      <PanelToolbar
        accent={ACCENT_CAT}
        selectedLabel={selectedRow?.name ?? null}
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
      <PanelTable accent={ACCENT_CAT}>
        <DataTable
          columns={mainColumns(ACCENT_CAT)}
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
    </Box>
  );
};

// ── Expense Category + Sub-Category Section ───────────────────────────────────

const ExpenseCategorySection = () => {
  const { classes } = useStyles();
  const [activeView, setActiveView] = useState<ActiveExpenseView>('category');

  return (
    <Accordion elevation={0} className={classes.sectionAccordion}>
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
            <Typography className={classes.sectionTitle}>Expense Categories</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage expense categories and their sub-categories
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper
          variant='outlined'
          sx={{
            p: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
            }}
          >
            <Button
              size='small'
              variant={activeView === 'category' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('category')}
              startIcon={<CategoryIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_CAT,
                color: activeView === 'category' ? '#fff' : ACCENT_CAT,
                bgcolor: activeView === 'category' ? ACCENT_CAT : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'category' ? alpha(ACCENT_CAT, 0.85) : alpha(ACCENT_CAT, 0.08),
                  borderColor: ACCENT_CAT,
                },
              }}
            >
              Expense Category
            </Button>
            <Button
              size='small'
              variant={activeView === 'subCategory' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('subCategory')}
              startIcon={<AccountTreeIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_SUB,
                color: activeView === 'subCategory' ? '#fff' : ACCENT_SUB,
                bgcolor: activeView === 'subCategory' ? ACCENT_SUB : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'subCategory'
                      ? alpha(ACCENT_SUB, 0.85)
                      : alpha(ACCENT_SUB, 0.08),
                  borderColor: ACCENT_SUB,
                },
              }}
            >
              Sub-Category
            </Button>
          </Box>
        </Paper>

        {activeView === 'category' && <ExpenseCategoryPanel />}
        {activeView === 'subCategory' && <ExpenseCategorySubCategoryPanel />}
      </AccordionDetails>
    </Accordion>
  );
};

// ── Main table columns ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subCatColumns: Column<any>[] = [
  { id: 'category', label: 'Category', minWidth: 150, format: mkCell(true) },
  { id: 'subCategory', label: 'Sub-Category', minWidth: 150, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'expensesGroup', label: 'Expenses Group', minWidth: 140, format: mkCell() },
  { id: 'expensesType', label: 'Expenses Type', minWidth: 140, format: mkCell() },
  { id: 'billable', label: 'Billable', minWidth: 110, format: mkChip(ACCENT_SUB) },
];

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

// ── Expense Project Panel ──────────────────────────────────────────────────────

const ExpenseProjectPanel = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigExpenseProjectEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigExpenseProjectEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_PROJ_FORM);

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

  const save = (next: IConfigExpenseProjectEntry[]) => {
    setRows(next);
    saveSection('expenses', {
      expenseProjects: next,
      expenseProjectSubCategories: apiEXP?.expenseProjectSubCategories ?? [],
      expenseCategories: apiEXP?.expenseCategories ?? [],
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
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_PROJ}
        icon={<ReceiptLongIcon fontSize='small' />}
        title='Expense Projects'
      />
      <PanelToolbar
        accent={ACCENT_PROJ}
        selectedLabel={selectedRow?.name ?? null}
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
      <PanelTable accent={ACCENT_PROJ}>
        <DataTable
          columns={mainColumns(ACCENT_PROJ)}
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
    </Box>
  );
};

// ── Expense Project Section ───────────────────────────────────────────────────

const ExpenseProjectSection = () => {
  const { classes } = useStyles();
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<ActiveProjectView>('project');

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

  return (
    <Accordion defaultExpanded elevation={0} className={classes.sectionAccordion}>
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
        <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              size='small'
              variant={activeView === 'project' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('project')}
              startIcon={<ReceiptLongIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_PROJ,
                color: activeView === 'project' ? '#fff' : ACCENT_PROJ,
                bgcolor: activeView === 'project' ? ACCENT_PROJ : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'project' ? alpha(ACCENT_PROJ, 0.85) : alpha(ACCENT_PROJ, 0.08),
                  borderColor: ACCENT_PROJ,
                },
              }}
            >
              Expense Project
            </Button>
            <Button
              size='small'
              variant={activeView === 'serviceLine' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('serviceLine')}
              startIcon={<AccountTreeIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_SL,
                color: activeView === 'serviceLine' ? '#fff' : ACCENT_SL,
                bgcolor: activeView === 'serviceLine' ? ACCENT_SL : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'serviceLine' ? alpha(ACCENT_SL, 0.85) : alpha(ACCENT_SL, 0.08),
                  borderColor: ACCENT_SL,
                },
              }}
            >
              Add to Service Line
            </Button>
            <Button
              size='small'
              variant={activeView === 'application' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('application')}
              startIcon={<AppsIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_APP,
                color: activeView === 'application' ? '#fff' : ACCENT_APP,
                bgcolor: activeView === 'application' ? ACCENT_APP : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'application'
                      ? alpha(ACCENT_APP, 0.85)
                      : alpha(ACCENT_APP, 0.08),
                  borderColor: ACCENT_APP,
                },
              }}
            >
              Add to Application
            </Button>
            <Button
              size='small'
              variant={activeView === 'queue' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('queue')}
              startIcon={<QueueIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_QUE,
                color: activeView === 'queue' ? '#fff' : ACCENT_QUE,
                bgcolor: activeView === 'queue' ? ACCENT_QUE : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'queue' ? alpha(ACCENT_QUE, 0.85) : alpha(ACCENT_QUE, 0.08),
                  borderColor: ACCENT_QUE,
                },
              }}
            >
              Add to Queue
            </Button>
            <Button
              size='small'
              variant={activeView === 'resource' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('resource')}
              startIcon={<PersonIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_RES,
                color: activeView === 'resource' ? '#fff' : ACCENT_RES,
                bgcolor: activeView === 'resource' ? ACCENT_RES : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'resource' ? alpha(ACCENT_RES, 0.85) : alpha(ACCENT_RES, 0.08),
                  borderColor: ACCENT_RES,
                },
              }}
            >
              Add to Resource
            </Button>
          </Box>
        </Paper>

        {activeView === 'project' && <ExpenseProjectPanel />}
        {activeView === 'serviceLine' && (
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
          />
        )}
        {activeView === 'application' && (
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
          />
        )}
        {activeView === 'queue' && (
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
          />
        )}
        {activeView === 'resource' && (
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
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const Expenses = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ExpenseProjectSection />
      <ExpenseCategorySection />
    </Box>
  );
};

export default Expenses;
