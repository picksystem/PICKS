import { IConfigConsultantExpenseProject } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { EXPENSE_PROJECTS_CONFIG } from '../ConsultantProfiles.config';

export interface ExpenseProjectsSectionProps {
  data?: IConfigConsultantExpenseProject[];
  onDataChange?: (data: IConfigConsultantExpenseProject[]) => void;
}

export const ExpenseProjectsSection = ({ data, onDataChange }: ExpenseProjectsSectionProps) => {
  const handleSave = (next: IConfigConsultantExpenseProject[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={EXPENSE_PROJECTS_CONFIG} data={data || []} onSave={handleSave} />;
};
