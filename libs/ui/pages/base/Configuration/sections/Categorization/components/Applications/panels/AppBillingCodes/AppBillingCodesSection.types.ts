import { IConfigBillingCode } from '@serviceops/interfaces';

export interface FlatAppBCRow extends Omit<IConfigBillingCode, 'id' | 'applicationId'> {
  id: string;
  applicationId: string;
  applicationName: string;
}

export interface AppBillingCodesSectionProps {
  data: FlatAppBCRow[];
  onDataChange?: (data: FlatAppBCRow[]) => void;
}
