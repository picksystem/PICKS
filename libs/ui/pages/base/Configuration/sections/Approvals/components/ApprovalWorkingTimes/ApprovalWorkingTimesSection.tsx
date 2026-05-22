import React from 'react';
import { IConfigApprovalWorkingTime } from '@serviceops/interfaces';
import { TABLE_CONFIG, GenericPanel } from '../shared';

interface ApprovalWorkingTimesSectionProps {
  data?: IConfigApprovalWorkingTime[];
  onDataChange?: (data: IConfigApprovalWorkingTime[]) => void;
}

export const ApprovalWorkingTimesSection = ({
  data,
  onDataChange,
}: ApprovalWorkingTimesSectionProps) => {
  const handleSave = (next: IConfigApprovalWorkingTime[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.workingTimes} data={data || []} onSave={handleSave} />;
};
