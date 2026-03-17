import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const TestScripts = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Test Scripts
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Test Scripts posts
      </Typography>
    </Box>
  );
};

export default TestScripts;
