import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { ToolbarButton } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';

export interface SectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  toolbarButtons: ToolbarButton[];
}

export const PERIOD_TYPES_SECTION_CONFIG: SectionConfig = {
  title: 'Period Types',
  subtitle: 'Define timesheet period types and manage timesheet periods',
  icon: <EventRepeatIcon sx={{ fontSize: '1rem' }} />,
  accent: '#0369a1',
  toolbarButtons: [
    {
      key: 'periodTypes',
      label: 'Period Types',
      icon: <EventRepeatIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'timesheetPeriods',
      label: 'Timesheet Periods',
      icon: <PlaylistAddIcon />,
      isActive: false,
      onClick: () => {},
    },
  ],
};
