import { IConfigApprovalConsultantRole } from '@serviceops/interfaces';

export interface ConsultantRolesSectionProps {
  data?: IConfigApprovalConsultantRole[];
  onDataChange?: (data: IConfigApprovalConsultantRole[]) => void;
}
