import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { TableFilterField } from '@serviceops/configcatorshared';
import { APP_EXPENSES_CONFIG } from './AppExpensesSection.config';
import { AppExpensesSectionProps, FlatAppEXRow } from './AppExpensesSection.types';

export const AppExpensesSection = ({
  data,
  onDataChange,
  hideHeader,
  initialApplicationFilter,
}: AppExpensesSectionProps) => {
  const rows = data || [];
  const [applicationFilter, setApplicationFilter] = useState(initialApplicationFilter ?? '');
  const [projectFilter, setProjectFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other applications'
  // expense rows aren't wiped out.
  const handleSave = (next: FlatAppEXRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // expenses table, so picking one always yields at least one result.
  const applicationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.applicationName ?? '').trim();
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
          (!applicationFilter || r.applicationName === applicationFilter) &&
          (!projectFilter || r.project === projectFilter),
      ),
    [rows, applicationFilter, projectFilter],
  );

  return (
    <GenericPanel
      config={APP_EXPENSES_CONFIG}
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
