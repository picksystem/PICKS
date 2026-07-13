import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { TableFilterField } from '@serviceops/configcatorshared';
import { APP_SUPPORT_LINES_CONFIG } from './AppSupportLinesSection.config';
import { AppSupportLinesSectionProps, FlatAppSlRow } from './AppSupportLinesSection.types';

export const AppSupportLinesSection = ({
  data,
  onDataChange,
  hideHeader,
  initialApplicationFilter,
}: AppSupportLinesSectionProps) => {
  const rows = data || [];
  const [applicationFilter, setApplicationFilter] = useState(initialApplicationFilter ?? '');
  const [queueFilter, setQueueFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other applications'
  // support-line rows aren't wiped out.
  const handleSave = (next: FlatAppSlRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // support lines table, so picking one always yields at least one result.
  const applicationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.applicationName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const queueFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.queueName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!applicationFilter || r.applicationName === applicationFilter) &&
          (!queueFilter || r.queueName === queueFilter),
      ),
    [rows, applicationFilter, queueFilter],
  );

  return (
    <GenericPanel
      config={APP_SUPPORT_LINES_CONFIG}
      data={filteredRows}
      onSave={handleSave}
      hideHeader={hideHeader}
      toolbarExtra={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TableFilterField
            label='Application'
            value={applicationFilter}
            onChange={setApplicationFilter}
            options={applicationFilterOptions}
          />
          <TableFilterField
            label='Queue'
            value={queueFilter}
            onChange={setQueueFilter}
            options={queueFilterOptions}
          />
        </Box>
      }
    />
  );
};
