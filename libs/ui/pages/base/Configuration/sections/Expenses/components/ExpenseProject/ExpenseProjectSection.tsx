import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  EXP_COLORS,
  EXP_FORM_LABELS,
  EXP_PROJECT_VIEWS,
  expenseProjectColumns,
} from '../shared/expenses.config';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel/GenericTablePanel';

type ActiveProjectView = 'project';

const ExpenseProjectPanel = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<RowData>([]);

  useEffect(() => {
    if (apiEXP?.expenseProjects) setRows(apiEXP.expenseProjects);
  }, [apiEXP]);

  const handleSave = (next: RowData) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, expenseProjects: next });
  };

  const config = {
    title: 'Expense Projects',
    accent: EXP_COLORS.category,
    icon: <ReceiptLongIcon fontSize='small' />,
    panelTitle: 'Expense Projects',
    columns: expenseProjectColumns,
    formConfig: EXP_FORM_LABELS.project,
    searchFields: ['project', 'name', 'description', 'expensesGroup', 'expensesType'],
    getSelectedLabel: (row: RowData) => String(row.name ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'expp',
  };

  return <GenericCRUDPanel config={config} data={rows} onSave={handleSave} />;
};

const ExpenseProjectSection = () => {
  const { classes } = useStyles();
  const [activeView] = useState<ActiveProjectView>('project');

  return (
    <Accordion defaultExpanded elevation={0} className={classes.sectionAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: EXP_COLORS.category,
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
            {EXP_PROJECT_VIEWS.map((view) => (
              <Button
                key={view.key}
                size='small'
                variant={activeView === view.key ? 'contained' : 'outlined'}
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

        {activeView === 'project' && <ExpenseProjectPanel />}
      </AccordionDetails>
    </Accordion>
  );
};

export { ExpenseProjectSection };
