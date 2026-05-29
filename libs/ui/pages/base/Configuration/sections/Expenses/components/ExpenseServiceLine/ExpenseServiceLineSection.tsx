import { useState, useEffect } from 'react';
import { IConfigExpenseServiceLineEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_SERVICE_LINE_CONFIG, expenseServiceLineColumns } from '../shared/expenses.config';

const ExpenseServiceLineSection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseServiceLineEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.serviceLineEntries) setRows(apiEXP.serviceLineEntries);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseServiceLineEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, serviceLineEntries: next });
  };

  return (
    <GenericPanel
      config={EXP_SERVICE_LINE_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseServiceLineColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { ExpenseServiceLineSection };
