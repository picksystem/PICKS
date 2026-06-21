import { QUEUE_TIMESHEET_CONFIG, GenericPanel } from '@serviceops/configcatorshared';
import { QueueTimesheetSectionProps, FlatQueueTSRow } from './QueueTimesheetSection.types';

export const QueueTimesheetSection = ({ data, onDataChange }: QueueTimesheetSectionProps) => {
  const handleSave = (next: FlatQueueTSRow[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={QUEUE_TIMESHEET_CONFIG} data={data || []} onSave={handleSave} />;
};
