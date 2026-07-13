import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import {
  SERVICE_LINE_EXPENSES_CONFIG,
  GenericPanel,
  TableFilterField,
} from '@serviceops/configcatorshared';
import {
  ServiceLineExpenseSectionProps,
  FlatServiceLineEXRow,
} from './ServiceLineExpenseSection.types';

export const ServiceLineExpenseSection = ({
  data,
  onDataChange,
  hideHeader,
  initialServiceLineFilter,
}: ServiceLineExpenseSectionProps) => {
  const rows = data || [];
  const [serviceLineFilter, setServiceLineFilter] = useState(initialServiceLineFilter ?? '');
  const [projectFilter, setProjectFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other service lines'
  // expense rows aren't wiped out.
  const handleSave = (next: FlatServiceLineEXRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // expenses table, so picking one always yields at least one result.
  const serviceLineFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.serviceLineName ?? '').trim();
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
          (!serviceLineFilter || r.serviceLineName === serviceLineFilter) &&
          (!projectFilter || r.project === projectFilter),
      ),
    [rows, serviceLineFilter, projectFilter],
  );

  return (
    <GenericPanel
      config={SERVICE_LINE_EXPENSES_CONFIG}
      data={filteredRows}
      onSave={handleSave}
      hideHeader={hideHeader}
      toolbarExtra={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TableFilterField
            label='Service Line'
            value={serviceLineFilter}
            onChange={setServiceLineFilter}
            options={serviceLineFilterOptions}
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
