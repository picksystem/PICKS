import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { APP_EXPENSES_CONFIG } from './AppExpensesSection.config';
import { AppExpensesSectionProps, FlatAppEXRow } from './AppExpensesSection.types';

export const AppExpensesSection = ({ data, onDataChange }: AppExpensesSectionProps) => {
  const handleSave = (next: FlatAppEXRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={APP_EXPENSES_CONFIG} data={data || []} onSave={handleSave} />;
};
