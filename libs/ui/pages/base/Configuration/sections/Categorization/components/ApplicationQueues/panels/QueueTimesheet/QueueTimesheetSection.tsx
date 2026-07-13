import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import { QUEUE_TIMESHEET_CONFIG, GenericPanel, TableFilterField } from '@serviceops/configcatorshared';
import { QueueTimesheetSectionProps, FlatQueueTSRow } from './QueueTimesheetSection.types';

export const QueueTimesheetSection = ({
  data,
  onDataChange,
  hideHeader,
  initialQueueFilter,
}: QueueTimesheetSectionProps) => {
  const rows = data || [];
  const [queueFilter, setQueueFilter] = useState(initialQueueFilter ?? '');
  const [projectFilter, setProjectFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other queues'
  // timesheet rows aren't wiped out.
  const handleSave = (next: FlatQueueTSRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // timesheet table, so picking one always yields at least one result.
  const queueFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.queueName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const projectFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.project ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!queueFilter || r.queueName === queueFilter) &&
          (!projectFilter || r.project === projectFilter),
      ),
    [rows, queueFilter, projectFilter],
  );

  return (
    <GenericPanel
      config={QUEUE_TIMESHEET_CONFIG}
      data={filteredRows}
      onSave={handleSave}
      hideHeader={hideHeader}
      toolbarExtra={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TableFilterField
            label='Queue'
            value={queueFilter}
            onChange={setQueueFilter}
            options={queueFilterOptions}
          />
          <TableFilterField
            label='Project'
            value={projectFilter}
            onChange={setProjectFilter}
            options={projectFilterOptions}
          />
        </Box>
      }
    />
  );
};
