import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import { ReactNode } from 'react';

export interface ApprovalsSectionProps {
  records?: IConfigApprovalRecord[];
  assocUserProfiles?: IConfigApprovalAssocUserProfile[];
  consultantRoles?: IConfigApprovalConsultantRole[];
  workingTimes?: IConfigApprovalWorkingTime[];
  onDataChange?: (
    key: string,
    value:
      | IConfigApprovalRecord[]
      | IConfigApprovalAssocUserProfile[]
      | IConfigApprovalConsultantRole[]
      | IConfigApprovalWorkingTime[],
  ) => void;
}

export interface AccorionData {
  name: string;
  description: string;
}

export type ActiveView = 'records' | 'userProfile' | 'consultantRoles' | 'workingTimes';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'number' | 'toggle';
}

export interface TableConfig {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  entity: string;
  fields: TableField[];
}

export const AccentColor = '#0369a1';

export const AccordionData: AccorionData = {
  name: 'Approvals',
  description: 'Configure approval workflows, roles, and working schedules',
};
