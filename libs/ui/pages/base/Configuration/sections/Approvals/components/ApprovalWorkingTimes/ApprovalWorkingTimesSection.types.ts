import { IConfigApprovalWorkingTime } from '@serviceops/interfaces';

export interface ApprovalWorkingTimesSectionProps {
  data?: IConfigApprovalWorkingTime[];
  onDataChange?: (data: IConfigApprovalWorkingTime[]) => void;
}
