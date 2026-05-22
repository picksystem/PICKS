import { Box } from '@serviceops/component';
import { ExpenseProjectSection } from './components/ExpenseProject';
import { ExpenseCategorySection } from './components/ExpenseCategory';
import { useStyles } from './styles';

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
