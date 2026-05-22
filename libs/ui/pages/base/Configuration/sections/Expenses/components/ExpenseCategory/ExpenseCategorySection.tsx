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
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import {
  IConfigExpenseCategoryEntry,
  IConfigExpenseCategorySubCategory,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  mkCell,
  mkChip,
  mkDescCell,
} from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  PanelHeader,
  PanelTable,
  PanelToolbar,
} from '@serviceops/pages/base/Configuration/shared/assocPanel';
import {
  ConfigDeleteDialog,
  ConfigFormDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT_CAT = '#0369a1';
const ACCENT_SUB = '#7c3aed';

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

// ── Expense Category Sub-Category View ────────────────────────────────────────

type ActiveExpenseView = 'category' | 'subCategory';

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

export { ExpenseCategorySection };
