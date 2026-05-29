import { IConfigApprovalRecord } from '@serviceops/interfaces';
import { ApprovalRecordsSectionProps } from './ApprovalRecordsSection.types';
import { GenericPanel } from '../../../Categorization/components/shared';
import { TABLE_CONFIG } from '../ApprovalsSection.config';
export const ApprovalRecordsSection = ({ data, onDataChange }: ApprovalRecordsSectionProps) => {
  const handleSave = (next: IConfigApprovalRecord[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel
      config={TABLE_CONFIG.records}
      data={data || []}
      onSave={handleSave}
      variant='standard'
      enableSuccessMessage
    />
  );
};
