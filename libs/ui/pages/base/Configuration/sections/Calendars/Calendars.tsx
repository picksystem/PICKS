import { Box } from '@serviceops/component';
import {
  WorkingDayTemplatesSection,
  HolidayCalendarsSection,
  WorkingCalendarsSection,
  TimesheetPeriodsSection,
} from './components';
import { ConfigurationSection } from '@serviceops/configsection';
import { useStyles } from './styles';

const Calendars = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Calendars Configuration...'>
        <WorkingDayTemplatesSection />
        <HolidayCalendarsSection />
        <WorkingCalendarsSection />
        <TimesheetPeriodsSection />
      </ConfigurationSection>
    </Box>
  );
};

export default Calendars;
