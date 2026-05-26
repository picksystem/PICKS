import { IConfigApprovalAssocUserProfile } from '@serviceops/interfaces';

export interface UserProfilesSectionProps {
  data?: IConfigApprovalAssocUserProfile[];
  onDataChange?: (data: IConfigApprovalAssocUserProfile[]) => void;
}
