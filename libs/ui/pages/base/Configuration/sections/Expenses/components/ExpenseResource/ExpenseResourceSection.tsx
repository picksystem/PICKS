import { useState, useEffect } from 'react';
import { IConfigExpenseResourceEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_RESOURCE_CONFIG, expenseResourceColumns } from '../shared/expenses.config';

const ExpenseResourceSection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseResourceEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.resourceEntries) setRows(apiEXP.resourceEntries);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseResourceEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, resourceEntries: next });
  };

  return (
    <GenericPanel
      config={EXP_RESOURCE_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseResourceColumns as unknown as never}
      variant='standard'
    />
  );
};

export { ExpenseResourceSection };
