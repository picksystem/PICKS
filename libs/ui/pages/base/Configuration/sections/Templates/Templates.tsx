import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import { TicketUpdateSection, CommentSection, InternalNoteSection, ResolutionSection, TimeEntrySection } from './components';
import { ConfigurationSection } from '@serviceops/configsection';

const Templates = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Templates Configuration...'>
        <TicketUpdateSection />
        <CommentSection />
        <InternalNoteSection />
        <ResolutionSection />
        <TimeEntrySection />
      </ConfigurationSection>
    </Box>
  );
};

export default Templates;
