import { IConfigApproval } from '@serviceops/interfaces';

export interface FlatAppApRow extends Omit<IConfigApproval, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface AppApprovalsSectionProps {
  data: FlatAppApRow[];
  onDataChange?: (data: FlatAppApRow[]) => void;
}
