import { Box } from '@serviceops/component';
import {
  WorkingDayTemplatesSection,
  HolidayCalendarsSection,
  WorkingCalendarsSection,
  PeriodTypesSection,
  WorkingShiftManagementSection,
} from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useStyles } from './styles';

const Calendars = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Calendars Configuration...'>
        <WorkingDayTemplatesSection />
        <HolidayCalendarsSection />
        <WorkingCalendarsSection />
        <PeriodTypesSection />
        <WorkingShiftManagementSection />
      </ConfigurationSection>
    </Box>
  );
};

export default Calendars;
