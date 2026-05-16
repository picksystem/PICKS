import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';

const KnowledgeBase = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Knowledge Base'
        description='View and manage all knowledge base articles across the system.'
        className={classes.pageHeader}
      />
    </Box>
  );
};

export default KnowledgeBase;
