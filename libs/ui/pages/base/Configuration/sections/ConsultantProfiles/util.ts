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

export interface AUPPanelProps {
  profiles: IConfigConsultantProfile[];
  assocUsers: IConfigAssociatedUserProfile[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigAssociatedUserProfile[]) => void;
}

export interface WTPanelProps {
  profiles: IConfigConsultantProfile[];
  wTimes: IConfigConsultantWorkingTime[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantWorkingTime[]) => void;
}

export interface WSPanelProps {
  profiles: IConfigConsultantProfile[];
  wShifts: IConfigConsultantWorkingShift[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantWorkingShift[]) => void;
}

export interface TPPanelProps {
  profiles: IConfigConsultantProfile[];
  tsProjects: IConfigConsultantTimesheetProject[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantTimesheetProject[]) => void;
}

export interface EPPanelProps {
  profiles: IConfigConsultantProfile[];
  exProjects: IConfigConsultantExpenseProject[];
  defaultConsultantId: string | null;
  onBack: () => void;
  onSave: (next: IConfigConsultantExpenseProject[]) => void;
}

export interface ACPPanelProps {
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  consultantRoles: IConfigConsultantRole[];
  onBack: () => void;
  onSave: (next: IConfigAssociatedConsultantProfile[]) => void;
}

export interface CRSectionProps {
  roles: IConfigConsultantRole[];
  assocConsProfiles: IConfigAssociatedConsultantProfile[];
  applications: { id: string; name: string }[];
  onSaveRoles: (next: IConfigConsultantRole[]) => void;
  onSaveAssocConsProfiles: (next: IConfigAssociatedConsultantProfile[]) => void;
}
