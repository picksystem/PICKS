import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { APP_TIMESHEET_CONFIG } from './AppTimesheetSection.config';
import { AppTimesheetSectionProps, FlatAppTSRow } from './AppTimesheetSection.types';

export const AppTimesheetSection = ({ data, onDataChange }: AppTimesheetSectionProps) => {
  const handleSave = (next: FlatAppTSRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={APP_TIMESHEET_CONFIG} data={data || []} onSave={handleSave} />;
};
