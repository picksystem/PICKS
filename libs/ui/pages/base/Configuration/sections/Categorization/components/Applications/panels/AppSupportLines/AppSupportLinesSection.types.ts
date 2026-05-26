import { IConfigSupportLine } from '@serviceops/interfaces';

export interface FlatAppSlRow extends Omit<IConfigSupportLine, 'id'> {
  id: string;
  applicationId: string;
  applicationName: string;
}

export interface AppSupportLinesSectionProps {
  data: FlatAppSlRow[];
  onDataChange?: (data: FlatAppSlRow[]) => void;
}
