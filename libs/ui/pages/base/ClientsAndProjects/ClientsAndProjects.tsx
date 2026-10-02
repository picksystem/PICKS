import { Box, PageHeader } from '../../../components';
import { useStyles } from './styles';
import { ClientsAccordion } from './sections/ClientsAccordion';
import { ProjectContractsAccordion } from './sections/ProjectContractsAccordion';
import { ProjectsAccordion } from './sections/ProjectsAccordion';
import { ProjectJournalsAccordion } from './sections/ProjectJournalsAccordion';
import { CustomerJournalsAccordion } from './sections/CustomerJournalsAccordion';

const ClientsAndProjects = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Clients & Projects'
        description='Manage clients, projects, contracts, and journals across the system.'
        className={classes.pageHeader}
      />

      <Box>
        <ClientsAccordion />
      </Box>

      <Box sx={{ mt: 2 }}>
        <ProjectsAccordion />
      </Box>

      <Box sx={{ mt: 2 }}>
        <ProjectContractsAccordion />
      </Box>

      <Box sx={{ mt: 2 }}>
        <ProjectJournalsAccordion />
      </Box>

      <Box sx={{ mt: 2 }}>
        <CustomerJournalsAccordion />
      </Box>
    </Box>
  );
};

export default ClientsAndProjects;
