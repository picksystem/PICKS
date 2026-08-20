import { PageHeader, Grid } from '../../../components';
import { useStyles } from './styles';

const Dashboard = () => {
  const { classes } = useStyles();

  return (
    <Grid className={classes.container}>
      <PageHeader
        title='Dashboard'
        description='Overview of your ticketing system activity, recent items, and key metrics.'
        className={classes.pageHeader}
      />
    </Grid>
  );
};

export default Dashboard;
