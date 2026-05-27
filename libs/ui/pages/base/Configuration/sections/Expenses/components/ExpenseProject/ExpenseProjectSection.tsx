import { useState, useEffect } from 'react';
import { IConfigExpenseProjectEntry } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXP_PROJECT_CONFIG, expenseProjectColumns } from '../shared/expenses.config';

const ExpenseProjectSection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseProjectEntry[]>([]);

  useEffect(() => {
    if (apiEXP?.expenseProjects) setRows(apiEXP.expenseProjects);
  }, [apiEXP]);

  const handleSave = async (next: IConfigExpenseProjectEntry[]) => {
    setRows(next);
    await saveSection('expenses', { ...apiEXP, expenseProjects: next });
  };

  return (
    <GenericPanel
      config={EXP_PROJECT_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseProjectColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { ExpenseProjectSection };
