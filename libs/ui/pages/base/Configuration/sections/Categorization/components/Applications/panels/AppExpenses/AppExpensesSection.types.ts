import { IConfigExpenseProject } from '@serviceops/interfaces';

export interface FlatAppEXRow extends Omit<IConfigExpenseProject, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface AppExpensesSectionProps {
  data: FlatAppEXRow[];
  onDataChange?: (data: FlatAppEXRow[]) => void;
}
