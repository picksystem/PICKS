import { IConfigExpenseProject } from '@serviceops/interfaces';

export interface FlatServiceLineEXRow extends Omit<IConfigExpenseProject, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface ServiceLineExpenseSectionProps {
  data: FlatServiceLineEXRow[];
  onDataChange?: (data: FlatServiceLineEXRow[]) => void;
}
