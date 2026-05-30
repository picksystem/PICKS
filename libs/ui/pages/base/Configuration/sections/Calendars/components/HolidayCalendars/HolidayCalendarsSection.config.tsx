import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { ToolbarButton } from '@serviceops/generictoolbar';

export interface SectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  toolbarButtons: ToolbarButton[];
}

export const HOLIDAY_CALENDAR_SECTION_CONFIG: SectionConfig = {
  title: 'Holiday Calendar',
  subtitle: 'Manage holiday calendars and their public bank holidays',
  icon: <CalendarMonthIcon sx={{ fontSize: '1rem' }} />,
  accent: '#0369a1',
  toolbarButtons: [
    {
      key: 'holiday',
      label: 'Holiday Calendar',
      icon: <CalendarMonthIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'bankHolidays',
      label: 'Bank Holidays',
      icon: <BeachAccessIcon />,
      isActive: false,
      onClick: () => {},
    },
  ],
};
