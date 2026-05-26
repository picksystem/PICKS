import { IConfigApprovalRecord } from '@serviceops/interfaces';

export interface ApprovalRecordsSectionProps {
  data?: IConfigApprovalRecord[];
  onDataChange?: (data: IConfigApprovalRecord[]) => void;
}
