import {
  SERVICE_LINE_APPROVALS_CONFIG,
  GenericPanel,
} from '@serviceops/configcatorshared';
import {
  ServiceLineApprovalsSectionProps,
  FlatServiceLineApRow,
} from './ServiceLineApprovalsSection.types';

export const ServiceLineApprovalsSection = ({
  data,
  onDataChange,
}: ServiceLineApprovalsSectionProps) => {
  const handleSave = (next: FlatServiceLineApRow[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={SERVICE_LINE_APPROVALS_CONFIG} data={data || []} onSave={handleSave} />
  );
};
