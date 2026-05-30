import { GenericPanel } from '@serviceops/genericpanel';
import { APP_APPROVALS_CONFIG } from './AppApprovalsSection.config';
import { AppApprovalsSectionProps, FlatAppApRow } from './AppApprovalsSection.types';

export const AppApprovalsSection = ({ data, onDataChange }: AppApprovalsSectionProps) => {
  const handleSave = (next: FlatAppApRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={APP_APPROVALS_CONFIG} data={data || []} onSave={handleSave} />;
};
