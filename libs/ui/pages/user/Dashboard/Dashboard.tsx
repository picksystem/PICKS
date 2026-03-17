import { Box, Typography, Card, TextField, Button } from '../../../components';
import { useForm, useEventCallback, useCurrentDate } from '../../../hooks';
import { DATE_FORMATS } from '../../../../utils';
import Chart from 'react-apexcharts';
import { useStyles } from './styles';

// Static chart configuration - defined outside component for optimal performance
const chartOptions = {
  chart: { id: 'sales-chart' },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
};

const chartSeries = [{ name: 'Sales', data: [30, 40, 35, 50, 49, 60] }];

const Dashboard = () => {
  const { classes } = useStyles();

  // Use centralized date format constant
  const currentDate = useCurrentDate(1000, DATE_FORMATS.DATE_SHORT);

  const handleSubmit = useEventCallback(
    (_values: { firstName: string; lastName: string; email: string }) => {
      // Handle form submission
      // TODO: Add API call or form processing logic
    },
  );

  const formik = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    onSubmit: handleSubmit,
  });

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Dashboard - {currentDate}
      </Typography>

      <Box className={classes.gridContainer}>
        {/* Sales Chart Card */}
        <Card className={classes.card}>
          <Typography variant='h6' className={classes.cardTitle}>
            Sales Chart
          </Typography>
          <Chart options={chartOptions} series={chartSeries} type='bar' height={300} />
        </Card>

        {/* Login Form Card */}
        <Card className={classes.card}>
          <Typography variant='h6' className={classes.cardTitle}>
            Login Form
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Box className={classes.formContainer}>
              <TextField
                id='firstName'
                name='firstName'
                label='First Name'
                type='text'
                onChange={formik.handleChange}
                value={formik.values.firstName}
                fullWidth
              />

              <TextField
                id='lastName'
                name='lastName'
                label='Last Name'
                type='text'
                onChange={formik.handleChange}
                value={formik.values.lastName}
                fullWidth
              />

              <TextField
                id='email'
                name='email'
                label='Email Address'
                type='email'
                onChange={formik.handleChange}
                value={formik.values.email}
                fullWidth
              />

              <Button type='submit' variant='contained' color='primary'>
                Submit
              </Button>
            </Box>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
