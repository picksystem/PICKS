import { Box } from '@serviceops/component';
import { TimesheetProjectsSection } from './components/TimesheetProjects';
import { ProjectCategorySection } from './components/ProjectCategory';
import { useStyles } from './styles';

const Timesheets = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <TimesheetProjectsSection />
      <ProjectCategorySection />
    </Box>
  );
};

export default Timesheets;
