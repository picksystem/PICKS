import { useState, useEffect } from 'react';
import { IConfigExpenseQueueEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_QUEUE_CONFIG, expenseQueueColumns } from '../shared/expenses.config';

const ExpenseQueueSection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseQueueEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.queueEntries) setRows(apiEXP.queueEntries);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseQueueEntry[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, queueEntries: next });
  };

  return (
    <GenericPanel
      config={EXP_QUEUE_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseQueueColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { ExpenseQueueSection };
