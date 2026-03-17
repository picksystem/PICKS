import React from 'react';
import { IAuthUser } from '@picks/interfaces';

export type UserRow = IAuthUser & { sno: number };

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface EditFormShape {
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  workLocation: string;
  businessUnit: string;
  employeeId: string;
  managerName: string;
  role: string;
  isActive: boolean;
  accessFromDate: string;
  accessToDate: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  slaWorkingCalendar: string;
  slaExceptionGroup: string;
  application: string;
  applicationLead: string;
  reasonForAccess: string;
  adminNotes: string;
}

export type InitialCreateValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workLocation: string;
  department: string;
  employeeId: string;
  businessUnit: string;
  managerName: string;
  reasonForAccess: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  slaWorkingCalendar: string;
  slaExceptionGroup: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export interface NewUserDraftData {
  values: InitialCreateValues;
  savedAt: string;
  expiresAt: string;
}

export type PageStyles = {
  signIn: 'old' | 'new';
  signUp: 'old' | 'new';
  forgotPassword: 'old' | 'new';
};

export type ChangeProfileErrors = {
  role?: string;
  reasonCode?: string;
  note?: string;
};

export type ResetPwErrors = {
  password?: string;
  confirm?: string;
};

export interface ChangeLogEntry {
  id?: string | number | null;
  createdAt?: string | null;
  changeType?: string | null;
  fieldName?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  changedByName?: string | null;
  reasonCode?: string | null;
  reasonNotes?: string | null;
}
