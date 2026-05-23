import { Box } from '@serviceops/component';
import { ExpenseProjectSection } from './components/ExpenseProject';
import { ExpenseCategorySection } from './components/ExpenseCategory';
import { useStyles } from './styles';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection';

const Expenses = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Expenses Configuration...'>
        <ExpenseProjectSection />
        <ExpenseCategorySection />
      </ConfigurationSection>
    </Box>
  );
};

export default Expenses;