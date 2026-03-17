import { IConsultantProfile, IConsultantRole } from '@picks/interfaces';

export type ProfileRow = IConsultantProfile & { sno: number };
export type RoleRow = IConsultantRole & { sno: number };

export interface ProfileForm {
  userId: number;
  application: string;
  consultantRole: string;
  slaWorkingCalendar: string;
  slaExceptionCalendar: string;
  leadConsultant: string;
  applicationManager: string;
  isPocLead: boolean;
  isActive: boolean;
}

export interface RoleForm {
  application: string;
  roleName: string;
  description: string;
}
