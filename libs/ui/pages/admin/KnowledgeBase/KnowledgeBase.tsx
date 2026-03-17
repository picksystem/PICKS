import { Box, Typography } from '../../../components';
import { useStyles } from './styles';

const KnowledgeBase = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Typography variant='h4' className={classes.title}>
        Knowledge Base
      </Typography>
      <Typography className={classes.description}>
        Here you can manage your Knowledge Base posts
      </Typography>
    </Box>
  );
};

export default KnowledgeBase;
