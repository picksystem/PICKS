import { useState, useEffect } from 'react';
import { IConfigExpenseCategorySubCategory } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  EXP_CATEGORY_SUBCATEGORY_CONFIG,
  expenseSubCategoryColumns,
} from '../shared/expenses.config';

const ExpenseCategorySubCategorySection = () => {
  const { expenses: apiEXP, saveSection } = useConfiguration();
  const [rows, setRows] = useState<IConfigExpenseCategorySubCategory[]>([]);

  useEffect(() => {
    if (apiEXP?.expenseCategorySubCategories) setRows(apiEXP.expenseCategorySubCategories);
  }, [apiEXP]);

  const handleSave = (next: IConfigExpenseCategorySubCategory[]) => {
    setRows(next);
    saveSection('expenses', { ...apiEXP, expenseCategorySubCategories: next });
  };

  return (
    <GenericPanel
      config={EXP_CATEGORY_SUBCATEGORY_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave as (data: unknown[]) => void}
      customColumns={expenseSubCategoryColumns as unknown as never}
      variant='standard'
    />
  );
};

export { ExpenseCategorySubCategorySection };
