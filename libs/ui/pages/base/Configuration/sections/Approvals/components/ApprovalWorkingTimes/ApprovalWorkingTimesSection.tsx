import { IConfigApprovalWorkingTime } from '@serviceops/interfaces';
import { ApprovalWorkingTimesSectionProps } from './ApprovalWorkingTimesSection.types';
import { GenericPanel } from '../../../Categorization/components/shared';
import { TABLE_CONFIG } from '../ApprovalsSection.config';
export const ApprovalWorkingTimesSection = ({
  data,
  onDataChange,
}: ApprovalWorkingTimesSectionProps) => {
  const handleSave = (next: IConfigApprovalWorkingTime[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.workingTimes} data={data || []} onSave={handleSave} />;
};
