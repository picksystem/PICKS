import { useEffect, useState } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useStyles } from '../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import {
  ApprovalRecordsSection,
  UserProfilesSection,
  ConsultantRolesSection,
  ApprovalWorkingTimesSection,
} from './index';
import {
  AccentColor,
  AccordionData,
  ActiveView,
  ApprovalsSectionProps,
} from './ApprovalsSection.types';
import {
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalRecord,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import { TABLE_CONFIG } from './ApprovalsSection.config';

const ApprovalsSection = ({
  records: externalRecords,
  assocUserProfiles: externalAssocUsers,
  consultantRoles: externalConsultantRoles,
  workingTimes: externalWorkingTimes,
  onDataChange,
}: ApprovalsSectionProps) => {
  const { classes } = useStyles();
  const { approvals: api, saveSection } = useConfiguration();

  const [activeView, setActiveView] = useState<ActiveView>('records');
  const [records, setRecords] = useState<IConfigApprovalRecord[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigApprovalAssocUserProfile[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigApprovalConsultantRole[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigApprovalWorkingTime[]>([]);

  useEffect(() => {
    if (externalRecords !== undefined) {
      setRecords(externalRecords);
    } else if (api?.records) {
      setRecords(api.records);
    }
  }, [externalRecords, api]);

  useEffect(() => {
    if (externalAssocUsers !== undefined) {
      setAssocUsers(externalAssocUsers);
    } else if (api?.assocUserProfiles) {
      setAssocUsers(api.assocUserProfiles);
    }
  }, [externalAssocUsers, api]);

  useEffect(() => {
    if (externalConsultantRoles !== undefined) {
      setConsultantRoles(externalConsultantRoles);
    } else if (api?.consultantRoles) {
      setConsultantRoles(api.consultantRoles);
    }
  }, [externalConsultantRoles, api]);

  useEffect(() => {
    if (externalWorkingTimes !== undefined) {
      setWorkingTimes(externalWorkingTimes);
    } else if (api?.workingTimes) {
      setWorkingTimes(api.workingTimes);
    }
  }, [externalWorkingTimes, api]);

  const saveAll = (key: string, value: any) => {
    if (onDataChange) {
      onDataChange(key, value);
    } else {
      saveSection('approvals', {
        records,
        assocUserProfiles: assocUsers,
        consultantRoles,
        workingTimes,
        [key === 'assocUserProfiles' ? 'assocUserProfiles' : key]: value,
      });
    }
  };

  const views: ActiveView[] = ['records', 'userProfile', 'consultantRoles', 'workingTimes'];

  return (
    <GenericAccordion
      title={AccordionData.name}
      subtitle={AccordionData.description}
      icon={<HowToRegIcon sx={{ fontSize: '1rem' }} />}
      accent={AccentColor}
      className={classes.sectionAccordion}
    >
      <GenericToolbar
        buttons={views.map((key) => ({
          key,
          label: TABLE_CONFIG[key].title,
          icon: TABLE_CONFIG[key].icon,
          isActive: activeView === key,
          onClick: () => setActiveView(key),
        }))}
      />

      {activeView === 'records' && (
        <ApprovalRecordsSection
          data={records}
          onDataChange={(next) => {
            setRecords(next);
            saveAll('records', next);
          }}
        />
      )}
      {activeView === 'userProfile' && (
        <UserProfilesSection
          data={assocUsers}
          onDataChange={(next) => {
            setAssocUsers(next);
            saveAll('assocUserProfiles', next);
          }}
        />
      )}
      {activeView === 'consultantRoles' && (
        <ConsultantRolesSection
          data={consultantRoles}
          onDataChange={(next) => {
            setConsultantRoles(next);
            saveAll('consultantRoles', next);
          }}
        />
      )}
      {activeView === 'workingTimes' && (
        <ApprovalWorkingTimesSection
          data={workingTimes}
          onDataChange={(next) => {
            setWorkingTimes(next);
            saveAll('workingTimes', next);
          }}
        />
      )}
    </GenericAccordion>
  );
};

export { ApprovalsSection };
