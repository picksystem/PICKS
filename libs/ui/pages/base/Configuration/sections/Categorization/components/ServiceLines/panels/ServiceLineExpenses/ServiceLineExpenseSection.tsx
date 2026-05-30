import {
  SERVICE_LINE_EXPENSES_CONFIG,
  GenericPanel,
} from '@serviceops/configcatorshared';
import {
  ServiceLineExpenseSectionProps,
  FlatServiceLineEXRow,
} from './ServiceLineExpenseSection.types';

export const ServiceLineExpenseSection = ({
  data,
  onDataChange,
}: ServiceLineExpenseSectionProps) => {
  const handleSave = (next: FlatServiceLineEXRow[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={SERVICE_LINE_EXPENSES_CONFIG} data={data || []} onSave={handleSave} />
  );
};
