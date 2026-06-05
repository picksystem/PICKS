import { GenericPanel } from '@serviceops/genericpanel';
import {
  APPROVED_ESTIMATES_CONFIG,
  approvedEstimateColumns,
} from './shared/ApprovedEstimatesConfig';
import { validateApprovedEstimateDuplicate } from './shared/validateApprovedEstimate';
import { IConfigApprovedEstimateRow } from '@serviceops/interfaces';

interface ApprovedEstimatesSectionProps {
  displayRows: IConfigApprovedEstimateRow[];
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
      enableSuccessMessage
      validate={validateApprovedEstimateDuplicate}
    />
  );
};

export { ApprovedEstimatesSection };
