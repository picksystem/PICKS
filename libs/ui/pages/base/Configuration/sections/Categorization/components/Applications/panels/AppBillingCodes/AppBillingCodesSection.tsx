import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import {
  APP_BILLING_CODES_CONFIG,
  GenericPanel,
  TableFilterField,
} from '@serviceops/configcatorshared';
import { AppBillingCodesSectionProps, FlatAppBCRow } from './AppBillingCodesSection.types';

export const AppBillingCodesSection = ({
  data,
  onDataChange,
  hideHeader,
  initialApplicationFilter,
}: AppBillingCodesSectionProps) => {
  const rows = data || [];
  const [applicationFilter, setApplicationFilter] = useState(initialApplicationFilter ?? '');
  const [billingCodeFilter, setBillingCodeFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other applications'
  // billing-code rows aren't wiped out.
  const handleSave = (next: FlatAppBCRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // billing codes table, so picking one always yields at least one result.
  const applicationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.applicationName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const billingCodeFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.billingCode ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!applicationFilter || r.applicationName === applicationFilter) &&
          (!billingCodeFilter || r.billingCode === billingCodeFilter),
      ),
    [rows, applicationFilter, billingCodeFilter],
  );

  return (
    <GenericPanel
      config={APP_BILLING_CODES_CONFIG}
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
            label='Billing Code'
            value={billingCodeFilter}
            onChange={setBillingCodeFilter}
            options={billingCodeFilterOptions}
          />
        </Box>
      }
    />
  );
};
