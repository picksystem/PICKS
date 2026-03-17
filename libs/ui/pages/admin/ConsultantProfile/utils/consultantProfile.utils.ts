import { IAuthUser, IConsultantProfile } from '@picks/interfaces';
import { ProfileForm, RoleForm } from '../types/consultantProfile.types';

export const emptyProfileForm: ProfileForm = {
  userId: 0,
  application: '',
  consultantRole: '',
  slaWorkingCalendar: '',
  slaExceptionCalendar: '',
  leadConsultant: '',
  applicationManager: '',
  isPocLead: false,
  isActive: true,
};

export const emptyRoleForm: RoleForm = { application: '', roleName: '', description: '' };

export const getUserName = (userId: number, consultantUsers: IAuthUser[]): string => {
  const u = consultantUsers.find((c) => c.id === userId);
  return u ? u.name : `User #${userId}`;
};

export const getConsultantInitials = (userId: number, consultantUsers: IAuthUser[]): string => {
  const u = consultantUsers.find((c) => c.id === userId);
  if (!u) return '?';
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
};

export const getConsultantProfilePicture = (
  userId: number,
  consultantUsers: IAuthUser[],
): string | undefined => {
  const u = consultantUsers.find((c) => c.id === userId);
  return u?.profilePicture || undefined;
};

export const getProfileFromForm = (profile: IConsultantProfile): ProfileForm => ({
  userId: profile.userId,
  application: profile.application,
  consultantRole: profile.consultantRole || '',
  slaWorkingCalendar: profile.slaWorkingCalendar || '',
  slaExceptionCalendar: profile.slaExceptionCalendar || '',
  leadConsultant: profile.leadConsultant || '',
  applicationManager: profile.applicationManager || '',
  isPocLead: profile.isPocLead,
  isActive: profile.isActive,
});
