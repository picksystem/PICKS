import {
  QUEUE_APPROVALS_CONFIG,
  GenericPanel,
} from '@serviceops/configcatorshared';
import { QueueApprovalsSectionProps, FlatQueueApRow } from './QueueApprovalsSection.types';

export const QueueApprovalsSection = ({ data, onDataChange }: QueueApprovalsSectionProps) => {
  const handleSave = (next: FlatQueueApRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={QUEUE_APPROVALS_CONFIG} data={data || []} onSave={handleSave} />;
};
