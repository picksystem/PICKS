import React from 'react';
import { Box } from '@serviceops/component';
import {
  WorkingDayTemplatesSection,
  HolidayCalendarsSection,
  WorkingCalendarsSection,
} from './components';

const Calendars = () => (
  <Box sx={{ p: 3, width: '100%' }}>
    <WorkingDayTemplatesSection />
    <HolidayCalendarsSection />
    <WorkingCalendarsSection />
  </Box>
);

export default Calendars;
