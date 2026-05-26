import { useState, useEffect } from 'react';
import { IConfigExpenseCategoryEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_CATEGORY_CONFIG, expenseCategoryColumns } from '../shared/expenses.config';

const ExpenseCategorySection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseCategoryEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.expenseCategories) setRows(apiEXP.expenseCategories);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseCategoryEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, expenseCategories: next });
  };

  return (
    <GenericPanel
      config={EXP_CATEGORY_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseCategoryColumns as unknown as never}
      variant='standard'
    />
  );
};

export { ExpenseCategorySection };
