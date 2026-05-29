import { useState, useEffect } from 'react';
import { IConfigExpenseApplicationEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_APPLICATION_CONFIG, expenseApplicationColumns } from '../shared/expenses.config';

const ExpenseApplicationSection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseApplicationEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.applicationEntries) setRows(apiEXP.applicationEntries);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseApplicationEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, applicationEntries: next });
  };

  return (
    <GenericPanel
      config={EXP_APPLICATION_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseApplicationColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { ExpenseApplicationSection };
