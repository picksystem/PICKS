import {
  SERVICE_LINE_TIMESHEET_CONFIG,
  GenericPanel,
} from '@serviceops/pages/base/Configuration/sections/Categorization/components/shared';
import {
  ServiceLineTimesheetSectionProps,
  FlatServiceLineTSRow,
} from './ServiceLineTimesheetSection.types';

export const ServiceLineTimesheetSection = ({
  data,
  onDataChange,
}: ServiceLineTimesheetSectionProps) => {
  const handleSave = (next: FlatServiceLineTSRow[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={SERVICE_LINE_TIMESHEET_CONFIG} data={data || []} onSave={handleSave} />
  );
};
