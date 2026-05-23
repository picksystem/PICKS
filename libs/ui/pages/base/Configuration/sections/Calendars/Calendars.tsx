import React from 'react';
import { Box } from '@serviceops/component';
import {
  WorkingDayTemplatesSection,
  HolidayCalendarsSection,
  WorkingCalendarsSection,
} from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection';

const Calendars = () => (
  <Box sx={{ p: 3, width: '100%' }}>
    <ConfigurationSection loaderMessage='Loading Calendars Configuration...'>
      <WorkingDayTemplatesSection />
      <HolidayCalendarsSection />
      <WorkingCalendarsSection />
    </ConfigurationSection>
  </Box>
);

export default Calendars;