import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { TicketUpdateSection, CommentSection, InternalNoteSection } from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';

const Templates = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Templates Configuration...'>
        <TicketUpdateSection />
        <CommentSection />
        <InternalNoteSection />
      </ConfigurationSection>
    </Box>
  );
};

export default Templates;
