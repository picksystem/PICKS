import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const RecentItems = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Recent Items
      </Typography>
      <Typography className={classes.description}>Here you can manage your products</Typography>
    </Box>
  );
};

export default RecentItems;
