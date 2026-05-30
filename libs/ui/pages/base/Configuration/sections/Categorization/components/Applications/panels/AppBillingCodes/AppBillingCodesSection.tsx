import {
  APP_BILLING_CODES_CONFIG,
  GenericPanel,
} from '@serviceops/configcatorshared';
import { AppBillingCodesSectionProps, FlatAppBCRow } from './AppBillingCodesSection.types';

export const AppBillingCodesSection = ({ data, onDataChange }: AppBillingCodesSectionProps) => {
  const handleSave = (next: FlatAppBCRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={APP_BILLING_CODES_CONFIG} data={data || []} onSave={handleSave} />;
};
