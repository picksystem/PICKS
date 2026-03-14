import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfigPlaceholder from './ConfigPlaceholder';

const Calendars = () => (
  <ConfigPlaceholder
    title='Calendars'
    description='Set up business hours, holidays and on-call schedules for SLA calculations'
    Icon={CalendarMonthIcon}
    accentColor='#b45309'
  />
);

export default Calendars;
