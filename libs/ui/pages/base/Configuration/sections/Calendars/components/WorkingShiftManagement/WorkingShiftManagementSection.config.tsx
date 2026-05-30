import WorkIcon from '@mui/icons-material/Work';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { ToolbarButton } from '@serviceops/generictoolbar';

export interface SectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  toolbarButtons: ToolbarButton[];
}

export const WORKING_SHIFT_MANAGEMENT_SECTION_CONFIG: SectionConfig = {
  title: 'Working Shift Management',
  subtitle: 'Define working shifts and associate consultants',
  icon: <WorkIcon sx={{ fontSize: '1rem' }} />,
  accent: '#0369a1',
  toolbarButtons: [
    {
      key: 'workingShifts',
      label: 'Working Shifts',
      icon: <WorkIcon />,
      isActive: false,
      onClick: () => {},
    },
    {
      key: 'consultants',
      label: 'Associated Consultants',
      icon: <PeopleAltIcon />,
      isActive: false,
      onClick: () => {},
    },
  ],
};
