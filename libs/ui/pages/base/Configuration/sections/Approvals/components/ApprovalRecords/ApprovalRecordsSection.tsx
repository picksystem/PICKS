import { IConfigApprovalRecord } from '@serviceops/interfaces';
import { TABLE_CONFIG, GenericPanel } from '../shared';

interface ApprovalRecordsSectionProps {
  data?: IConfigApprovalRecord[];
  onDataChange?: (data: IConfigApprovalRecord[]) => void;
}

export const ApprovalRecordsSection = ({ data, onDataChange }: ApprovalRecordsSectionProps) => {
  const handleSave = (next: IConfigApprovalRecord[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.records} data={data || []} onSave={handleSave} />;
};
