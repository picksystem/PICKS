import { IConfigApprovalWorkingTime } from '@serviceops/interfaces';
import { ApprovalWorkingTimesSectionProps } from './ApprovalWorkingTimesSection.types';
import { TABLE_CONFIG } from './ApprovalWorkingTimesSection.config';
import { GenericPanel } from '../../../Categorization/components/shared';
export const ApprovalWorkingTimesSection = ({
  data,
  onDataChange,
}: ApprovalWorkingTimesSectionProps) => {
  const handleSave = (next: IConfigApprovalWorkingTime[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.workingTimes} data={data || []} onSave={handleSave} />;
};
