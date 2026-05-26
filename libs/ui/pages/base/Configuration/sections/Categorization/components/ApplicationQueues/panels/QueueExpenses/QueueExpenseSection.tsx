import {
  QUEUE_EXPENSES_CONFIG,
  GenericPanel,
} from '@serviceops/pages/base/Configuration/sections/Categorization/components/shared';
import { QueueExpenseSectionProps, FlatQueueEXRow } from './QueueExpenseSection.types';

export const QueueExpenseSection = ({ data, onDataChange }: QueueExpenseSectionProps) => {
  const handleSave = (next: FlatQueueEXRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={QUEUE_EXPENSES_CONFIG} data={data || []} onSave={handleSave} />;
};
