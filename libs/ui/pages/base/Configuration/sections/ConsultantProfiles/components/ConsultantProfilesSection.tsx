import { useState, useEffect } from 'react';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {
  IConfigConsultantProfile,
  IConfigAssociatedUserProfile,
  IConfigConsultantWorkingTime,
  IConfigConsultantWorkingShift,
  IConfigConsultantTimesheetProject,
  IConfigConsultantExpenseProject,
  IConfigConsultantRole,
  IConfigAssociatedConsultantProfile,
} from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { CP_ACCENT, CP_TABLE_CONFIG } from './ConsultantProfiles.config';
import {
  UserProfilesSection,
  WorkingTimesSection,
  WorkingShiftsSection,
  TimesheetProjectsSection,
  ExpenseProjectsSection,
  ConsultantRolesSection,
} from './index';
import { useStyles } from '../styles';

export type CPActiveView =
  | 'profiles'
  | 'userProfiles'
  | 'workingTimes'
  | 'workingShifts'
  | 'timesheetProjects'
  | 'expenseProjects'
  | 'consultantRoles';

export interface ConsultantProfilesSectionProps {
  profilesData?: IConfigConsultantProfile[];
  rolesData?: IConfigConsultantRole[];
  assocProfilesData?: IConfigAssociatedConsultantProfile[];
  onProfilesChange?: (data: IConfigConsultantProfile[]) => void;
  onRolesChange?: (data: IConfigConsultantRole[]) => void;
  onAssocProfilesChange?: (data: IConfigAssociatedConsultantProfile[]) => void;
}

const VIEW_BUTTONS: { key: CPActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'profiles',
    label: 'Consultant Profiles',
    icon: <BusinessCenterIcon sx={{ fontSize: '1rem' }} />,
  },
  { key: 'userProfiles', label: 'User Profiles', icon: <PersonIcon sx={{ fontSize: '1rem' }} /> },
  {
    key: 'workingTimes',
    label: 'Working Times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  { key: 'workingShifts', label: 'Working Shifts', icon: <UpdateIcon sx={{ fontSize: '1rem' }} /> },
  {
    key: 'timesheetProjects',
    label: 'Timesheet Projects',
    icon: <ReceiptLongIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'expenseProjects',
    label: 'Expense Projects',
    icon: <AttachMoneyIcon sx={{ fontSize: '1rem' }} />,
  },
];

export const ConsultantProfilesSection = ({
  profilesData,
  rolesData,
  assocProfilesData,
  onProfilesChange,
  onRolesChange,
  onAssocProfilesChange,
}: ConsultantProfilesSectionProps) => {
  const { classes } = useStyles();
  const { consultantProfiles: api, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<CPActiveView>('profiles');

  const [profiles, setProfiles] = useState<IConfigConsultantProfile[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigAssociatedUserProfile[]>([]);
  const [wTimes, setWTimes] = useState<IConfigConsultantWorkingTime[]>([]);
  const [wShifts, setWShifts] = useState<IConfigConsultantWorkingShift[]>([]);
  const [tsProjects, setTsProjects] = useState<IConfigConsultantTimesheetProject[]>([]);
  const [exProjects, setExProjects] = useState<IConfigConsultantExpenseProject[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigConsultantRole[]>([]);
  const [assocConsProfiles, setAssocConsProfiles] = useState<IConfigAssociatedConsultantProfile[]>(
    [],
  );

  useEffect(() => {
    if (profilesData !== undefined) {
      setProfiles(profilesData);
    } else if (api?.profiles) {
      setProfiles(api.profiles);
    }
  }, [profilesData, api]);

  useEffect(() => {
    if (api) {
      setAssocUsers(api.associatedUserProfiles ?? []);
      setWTimes(api.workingTimes ?? []);
      setWShifts(api.workingShifts ?? []);
      setTsProjects(api.timesheetProjects ?? []);
      setExProjects(api.expenseProjects ?? []);
      setConsultantRoles(api.consultantRoles ?? []);
      setAssocConsProfiles(api.associatedConsultantProfiles ?? []);
    }
  }, [api]);

  const saveAll = (overrides: {
    profiles?: IConfigConsultantProfile[];
    associatedUserProfiles?: IConfigAssociatedUserProfile[];
    workingTimes?: IConfigConsultantWorkingTime[];
    workingShifts?: IConfigConsultantWorkingShift[];
    timesheetProjects?: IConfigConsultantTimesheetProject[];
    expenseProjects?: IConfigConsultantExpenseProject[];
    consultantRoles?: IConfigConsultantRole[];
    associatedConsultantProfiles?: IConfigAssociatedConsultantProfile[];
  }) => {
    saveSection('consultantProfiles', {
      profiles: overrides.profiles ?? profiles,
      associatedUserProfiles: overrides.associatedUserProfiles ?? assocUsers,
      workingTimes: overrides.workingTimes ?? wTimes,
      workingShifts: overrides.workingShifts ?? wShifts,
      timesheetProjects: overrides.timesheetProjects ?? tsProjects,
      expenseProjects: overrides.expenseProjects ?? exProjects,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      associatedConsultantProfiles: overrides.associatedConsultantProfiles ?? assocConsProfiles,
    });
  };

  return (
    <GenericAccordion
      title='Consultant Profiles'
      subtitle='Manage consultant profiles, roles, and calendar assignments'
      icon={<BusinessCenterIcon sx={{ fontSize: '1rem' }} />}
      accent={CP_ACCENT}
      className={classes.sectionAccordion}
    >
      <GenericToolbar
        buttons={VIEW_BUTTONS.map((btn) => ({
          key: btn.key,
          label: btn.label,
          icon: btn.icon,
          isActive: activeView === btn.key,
          onClick: () => setActiveView(btn.key as CPActiveView),
        }))}
      />

      {activeView === 'profiles' && (
        <GenericPanel
          config={CP_TABLE_CONFIG.profiles}
          data={profiles}
          onSave={(next) => {
            setProfiles(next as IConfigConsultantProfile[]);
            if (onProfilesChange) {
              onProfilesChange(next as IConfigConsultantProfile[]);
            } else {
              saveAll({ profiles: next as IConfigConsultantProfile[] });
            }
          }}
        />
      )}

      {activeView === 'userProfiles' && (
        <UserProfilesSection
          data={assocUsers}
          onDataChange={(next) => {
            setAssocUsers(next);
            saveAll({ associatedUserProfiles: next });
          }}
        />
      )}

      {activeView === 'workingTimes' && (
        <WorkingTimesSection
          data={wTimes}
          onDataChange={(next) => {
            setWTimes(next);
            saveAll({ workingTimes: next });
          }}
        />
      )}

      {activeView === 'workingShifts' && (
        <WorkingShiftsSection
          data={wShifts}
          onDataChange={(next) => {
            setWShifts(next);
            saveAll({ workingShifts: next });
          }}
        />
      )}

      {activeView === 'timesheetProjects' && (
        <TimesheetProjectsSection
          data={tsProjects}
          onDataChange={(next) => {
            setTsProjects(next);
            saveAll({ timesheetProjects: next });
          }}
        />
      )}

      {activeView === 'expenseProjects' && (
        <ExpenseProjectsSection
          data={exProjects}
          onDataChange={(next) => {
            setExProjects(next);
            saveAll({ expenseProjects: next });
          }}
        />
      )}

      {activeView === 'consultantRoles' && (
        <ConsultantRolesSection
          rolesData={consultantRoles}
          assocProfilesData={assocConsProfiles}
          onRolesChange={(next) => {
            setConsultantRoles(next);
            saveAll({ consultantRoles: next });
          }}
          onAssocProfilesChange={(next) => {
            setAssocConsProfiles(next);
            saveAll({ associatedConsultantProfiles: next });
          }}
        />
      )}
    </GenericAccordion>
  );
};
