import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import type {
  TableField,
  TableConfig,
} from '@serviceops/genericpanel';

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

export { TableField, TableConfig };

export const AccentColor = '#0369a1';

export const AccordionData: AccorionData = {
  name: 'Approvals',
  description: 'Configure approval workflows, roles, and working schedules',
};
