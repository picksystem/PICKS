import { IConfigApproval } from '@serviceops/interfaces';

export interface FlatServiceLineApRow extends Omit<IConfigApproval, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface ServiceLineApprovalsSectionProps {
  data: FlatServiceLineApRow[];
  onDataChange?: (data: FlatServiceLineApRow[]) => void;
}
