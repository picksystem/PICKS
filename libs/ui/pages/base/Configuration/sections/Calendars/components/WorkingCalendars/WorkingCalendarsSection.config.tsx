import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { ToolbarButton } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';

export interface SectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  toolbarButtons: ToolbarButton[];
}

export const WORKING_CALENDAR_SECTION_CONFIG: SectionConfig = {
  title: 'Working Calendars',
  subtitle: 'Define working calendars with associated working times and consultants',
  icon: <CalendarTodayIcon sx={{ fontSize: '1rem' }} />,
  accent: '#0369a1',
  toolbarButtons: [
    {
      key: 'calendar',
      label: 'Working Calendars',
      icon: <CalendarTodayIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'workingTimes',
      label: 'Working Times (All Calendars)',
      icon: <AccessTimeIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'composedTimes',
      label: 'Composed Working Times (All Calendars)',
      icon: <EventNoteIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'workLocations',
      label: 'Work Locations (All Calendars)',
      icon: <LocationOnIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'consultants',
      label: 'Associated Consultants (All Calendars)',
      icon: <PeopleIcon />,
      isActive: false,
      onClick: () => {},
    },
  ],
};
