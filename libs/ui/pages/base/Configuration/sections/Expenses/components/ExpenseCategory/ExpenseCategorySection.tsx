import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  EXP_COLORS,
  EXP_CATEGORY_VIEWS,
  expenseCategoryColumns,
  expenseSubCategoryColumns,
  EXP_FORM_LABELS,
} from '../shared/expenses.config';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveExpenseView = 'category' | 'subCategory';

// ── Panels ───────────────────────────────────────────────────────────────────

const ExpenseCategoryPanel = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<RowData>([]);

  useEffect(() => {
    if (apiEXP?.expenseCategories) setRows(apiEXP.expenseCategories);
  }, [apiEXP]);

  const handleSave = (next: RowData) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, expenseCategories: next });
  };

  const config = {
    title: 'Expense Categories',
    accent: EXP_COLORS.category,
    icon: <CategoryIcon fontSize='small' />,
    panelTitle: 'Expense Categories',
    columns: expenseCategoryColumns,
    formConfig: EXP_FORM_LABELS.category,
    searchFields: ['project', 'name', 'description', 'expensesGroup', 'expensesType'],
    getSelectedLabel: (row: RowData) => String(row.name ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'expcat',
  };

  return <GenericCRUDPanel config={config} data={rows} onSave={handleSave} />;
};

const ExpenseSubCategoryPanel = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<RowData>([]);

  useEffect(() => {
    if (apiEXP?.expenseCategorySubCategories) setRows(apiEXP.expenseCategorySubCategories);
  }, [apiEXP]);

  const handleSave = (next: RowData) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, expenseCategorySubCategories: next });
  };

  const config = {
    title: 'Expense Category Sub-Categories',
    accent: EXP_COLORS.category,
    icon: <CategoryIcon fontSize='small' />,
    panelTitle: 'Expense Category Sub-Categories',
    columns: expenseSubCategoryColumns,
    formConfig: EXP_FORM_LABELS.subCategory,
    searchFields: ['category', 'subCategory', 'description', 'expensesGroup', 'expensesType'],
    getSelectedLabel: (row: RowData) => `${row.category ?? ''} / ${row.subCategory ?? ''}`,
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'expcatsub',
  };

  return <GenericCRUDPanel config={config} data={rows} onSave={handleSave} />;
};

// ── Expense Category Section ──────────────────────────────────────────────────

const ExpenseCategorySection = () => {
  const { classes } = useStyles();
  const [activeView, setActiveView] = useState<ActiveExpenseView>('category');

  const activeColor = EXP_COLORS.category;

  return (
    <Accordion elevation={0} className={classes.sectionAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: activeColor,
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
        <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {EXP_CATEGORY_VIEWS.map((view) => (
              <Button
                key={view.key}
                size='small'
                variant={activeView === view.key ? 'contained' : 'outlined'}
                onClick={() => setActiveView(view.key as ActiveExpenseView)}
                startIcon={view.icon}
                sx={{
                  textTransform: 'none',
                  bgcolor: activeView === view.key ? '#2d5ebb' : undefined,
                  color: activeView === view.key ? '#fff' : '#2d5ebb',
                }}
              >
                {view.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {activeView === 'category' && <ExpenseCategoryPanel />}
        {activeView === 'subCategory' && <ExpenseSubCategoryPanel />}
      </AccordionDetails>
    </Accordion>
  );
};

export { ExpenseCategorySection };
