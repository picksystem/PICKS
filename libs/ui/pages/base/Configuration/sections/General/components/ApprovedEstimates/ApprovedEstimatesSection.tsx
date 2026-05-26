import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  APPROVED_ESTIMATES_CONFIG,
  approvedEstimateColumns,
} from './shared/ApprovedEstimatesConfig';
import { IConfigApprovedEstimateRow, ITicketType } from '@serviceops/interfaces';

interface ApprovedEstimatesSectionProps {
  displayRows: IConfigApprovedEstimateRow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigApprovedEstimateRow[]) => void;
}

const ApprovedEstimatesSection = ({ displayRows, onDataChange }: ApprovedEstimatesSectionProps) => {
  return (
    <GenericPanel
      config={APPROVED_ESTIMATES_CONFIG}
      data={displayRows as unknown as Record<string, unknown>[]}
      onSave={onDataChange as (data: unknown[]) => void}
      customColumns={approvedEstimateColumns() as unknown as never}
      variant='plain'
      defaultExpanded={false}
    />
  );
};

export { ApprovedEstimatesSection };
