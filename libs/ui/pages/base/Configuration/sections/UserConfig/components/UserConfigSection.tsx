import { useState, useEffect } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LinkIcon from '@mui/icons-material/Link';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericAccordion } from '@serviceops/genericaccordion';
import type {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
  IConfigWorkLocationAssociation,
} from '@serviceops/interfaces';
import { useStyles } from '../styles';
import {
  AssociatedProfilesSection,
  AssociationsSection,
  ShiftsSection,
  WorkingTimesSection,
  WorkLocationsSection,
} from './WorkLocations';

export type UserConfigActiveView =
  | 'workLocations'
  | 'workingTimes'
  | 'associatedProfiles'
  | 'shifts'
  | 'associations';

const ACCENT = '#0369a1';

const VIEW_CONFIG: Record<UserConfigActiveView, { title: string; icon: React.ReactNode }> = {
  workLocations: {
    title: 'Work Locations',
    icon: <LocationOnIcon sx={{ fontSize: '1rem' }} />,
  },
  workingTimes: {
    title: 'Working Times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  associatedProfiles: {
    title: 'Associated Consultant Profiles',
    icon: <GroupIcon sx={{ fontSize: '1rem' }} />,
  },
  shifts: {
    title: 'Shift Management',
    icon: <WatchLaterIcon sx={{ fontSize: '1rem' }} />,
  },
  associations: {
    title: 'Work Location Associations',
    icon: <LinkIcon sx={{ fontSize: '1rem' }} />,
  },
};

const UserConfigSection = () => {
  const { classes } = useStyles();
  const { userConfig: apiUC, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<UserConfigActiveView>('workLocations');
  const [workLocations, setWorkLocations] = useState<IConfigWorkLocation[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigWorkLocationWorkingTime[]>([]);
  const [associatedProfiles, setAssociatedProfiles] = useState<
    IConfigWorkLocationAssociatedProfile[]
  >([]);
  const [shifts, setShifts] = useState<IConfigWorkLocationShift[]>([]);
  const [associations, setAssociations] = useState<IConfigWorkLocationAssociation[]>([]);

  useEffect(() => {
    if (apiUC?.workLocations) setWorkLocations(apiUC.workLocations);
  }, [apiUC]);

  useEffect(() => {
    if (apiUC?.workingTimes) setWorkingTimes(apiUC.workingTimes);
  }, [apiUC]);

  useEffect(() => {
    if (apiUC?.associatedProfiles) setAssociatedProfiles(apiUC.associatedProfiles);
  }, [apiUC]);

  useEffect(() => {
    if (apiUC?.shifts) setShifts(apiUC.shifts);
  }, [apiUC]);

  useEffect(() => {
    if (apiUC?.workLocationAssociations) setAssociations(apiUC.workLocationAssociations);
  }, [apiUC]);

  const saveAll = (key: string, value: unknown) => {
    saveSection('userConfig', {
      workLocations,
      workingTimes,
      associatedProfiles,
      shifts,
      workLocationAssociations: associations,
      [key]: value,
    });
  };

  const views: UserConfigActiveView[] = [
    'workLocations',
    'workingTimes',
    'associatedProfiles',
    'shifts',
    'associations',
  ];

  return (
    <GenericAccordion
      title='User Configuration'
      subtitle='Define work locations and configure their regional, time and calendar settings'
      icon={<LocationOnIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
      accent={ACCENT}
      className={classes.sectionAccordion}
    >
      <GenericToolbar
        buttons={views.map((key) => ({
          key,
          label: VIEW_CONFIG[key].title,
          icon: VIEW_CONFIG[key].icon,
          isActive: activeView === key,
          onClick: () => setActiveView(key),
        }))}
      />

      {activeView === 'workLocations' && (
        <WorkLocationsSection
          data={workLocations}
          onDataChange={(next) => {
            setWorkLocations(next);
            saveAll('workLocations', next);
          }}
        />
      )}
      {activeView === 'workingTimes' && (
        <WorkingTimesSection
          data={workingTimes}
          onDataChange={(next) => {
            setWorkingTimes(next);
            saveAll('workingTimes', next);
          }}
        />
      )}
      {activeView === 'associatedProfiles' && (
        <AssociatedProfilesSection
          data={associatedProfiles}
          onDataChange={(next) => {
            setAssociatedProfiles(next);
            saveAll('associatedProfiles', next);
          }}
        />
      )}
      {activeView === 'shifts' && (
        <ShiftsSection
          data={shifts}
          onDataChange={(next) => {
            setShifts(next);
            saveAll('shifts', next);
          }}
        />
      )}
      {activeView === 'associations' && (
        <AssociationsSection
          data={associations}
          onDataChange={(next) => {
            setAssociations(next);
            saveAll('workLocationAssociations', next);
          }}
        />
      )}
    </GenericAccordion>
  );
};

export { UserConfigSection };
