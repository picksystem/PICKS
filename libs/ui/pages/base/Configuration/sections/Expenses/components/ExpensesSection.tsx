import { useState } from 'react';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import DividerIcon from '@mui/icons-material/CallSplit';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import {
  ExpenseProjectSection,
  ExpenseServiceLineSection,
  ExpenseApplicationSection,
  ExpenseQueueSection,
  ExpenseResourceSection,
  ExpenseCategorySection,
  ExpenseCategorySubCategorySection,
} from '.';
import { EXP_ACCENT } from './shared/expenses.config.types';
import { useStyles } from '../styles';

// Expense Projects sub-views
export type ExpenseProjectsView = 'project' | 'serviceLine' | 'application' | 'queue' | 'resource';

export const EXPENSE_PROJECTS_CONFIG: Record<
  ExpenseProjectsView,
  { title: string; icon: React.ReactNode }
> = {
  project: { title: 'Expense Projects', icon: <AccountTreeIcon sx={{ fontSize: '1rem' }} /> },
  serviceLine: { title: 'Add to Service Line', icon: <LayersIcon sx={{ fontSize: '1rem' }} /> },
  application: { title: 'Add to Application', icon: <AppsIcon sx={{ fontSize: '1rem' }} /> },
  queue: { title: 'Add to Queue', icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} /> },
  resource: { title: 'Add to Resource', icon: <PersonIcon sx={{ fontSize: '1rem' }} /> },
};

export const expenseProjectsViews: ExpenseProjectsView[] = [
  'project',
  'serviceLine',
  'application',
  'queue',
  'resource',
];

// Expense Categories sub-views
export type ExpenseCategoriesView = 'category' | 'categorySubCategory';

export const EXPENSE_CATEGORIES_CONFIG: Record<
  ExpenseCategoriesView,
  { title: string; icon: React.ReactNode }
> = {
  category: { title: 'Expense Categories', icon: <CategoryIcon sx={{ fontSize: '1rem' }} /> },
  categorySubCategory: { title: 'Sub-Categories', icon: <DividerIcon sx={{ fontSize: '1rem' }} /> },
};

export const expenseCategoriesViews: ExpenseCategoriesView[] = ['category', 'categorySubCategory'];

const ExpensesSection = () => {
  const { classes } = useStyles();
  const [projectsView, setProjectsView] = useState<ExpenseProjectsView>('project');
  const [categoriesView, setCategoriesView] = useState<ExpenseCategoriesView>('category');

  return (
    <>
      {/* Expenses Projects Accordion */}
      <GenericAccordion
        title='Expenses Projects'
        subtitle='Configure expense projects and their associations'
        icon={<ReceiptLongIcon sx={{ fontSize: '1rem' }} />}
        accent={EXP_ACCENT}
        className={classes.sectionAccordion}
      >
        <GenericToolbar
          buttons={expenseProjectsViews.map((key) => ({
            key,
            label: EXPENSE_PROJECTS_CONFIG[key].title,
            icon: EXPENSE_PROJECTS_CONFIG[key].icon,
            isActive: projectsView === key,
            onClick: () => setProjectsView(key),
          }))}
        />

        {projectsView === 'project' && <ExpenseProjectSection />}
        {projectsView === 'serviceLine' && <ExpenseServiceLineSection />}
        {projectsView === 'application' && <ExpenseApplicationSection />}
        {projectsView === 'queue' && <ExpenseQueueSection />}
        {projectsView === 'resource' && <ExpenseResourceSection />}
      </GenericAccordion>

      {/* Expenses Categories Accordion */}
      <GenericAccordion
        title='Expenses Categories'
        subtitle='Configure expense categories and sub-categories'
        icon={<FolderSpecialIcon sx={{ fontSize: '1rem' }} />}
        accent={EXP_ACCENT}
        className={classes.sectionAccordion}
        defaultExpanded={false}
      >
        <GenericToolbar
          buttons={expenseCategoriesViews.map((key) => ({
            key,
            label: EXPENSE_CATEGORIES_CONFIG[key].title,
            icon: EXPENSE_CATEGORIES_CONFIG[key].icon,
            isActive: categoriesView === key,
            onClick: () => setCategoriesView(key),
          }))}
        />

        {categoriesView === 'category' && <ExpenseCategorySection />}
        {categoriesView === 'categorySubCategory' && <ExpenseCategorySubCategorySection />}
      </GenericAccordion>
    </>
  );
};

export { ExpensesSection };
