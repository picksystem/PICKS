import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { APP_SUPPORT_LINES_CONFIG } from './AppSupportLinesSection.config';
import { AppSupportLinesSectionProps, FlatAppSlRow } from './AppSupportLinesSection.types';

export const AppSupportLinesSection = ({ data, onDataChange }: AppSupportLinesSectionProps) => {
  const handleSave = (next: FlatAppSlRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={APP_SUPPORT_LINES_CONFIG} data={data || []} onSave={handleSave} />;
};
