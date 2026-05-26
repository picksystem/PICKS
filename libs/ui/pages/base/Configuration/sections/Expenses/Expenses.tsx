import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { ExpensesSection } from './components';

const Expenses = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ExpensesSection />
    </Box>
  );
};

export default Expenses;
