import { Box } from '@serviceops/component';
import { TimesheetProjectsSection, ProjectCategorySection } from './components';
import { useStyles } from './styles';
import { ConfigurationSection } from '@serviceops/configsection';

const Timesheets = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Timesheets Configuration...'>
        <TimesheetProjectsSection />
        <ProjectCategorySection />
      </ConfigurationSection>
    </Box>
  );
};

export default Timesheets;
