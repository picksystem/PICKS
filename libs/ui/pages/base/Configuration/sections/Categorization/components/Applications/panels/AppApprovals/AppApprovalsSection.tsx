import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { TableFilterField } from '@serviceops/configcatorshared';
import { APP_APPROVALS_CONFIG } from './AppApprovalsSection.config';
import { AppApprovalsSectionProps, FlatAppApRow } from './AppApprovalsSection.types';

export const AppApprovalsSection = ({
  data,
  onDataChange,
  hideHeader,
  initialApplicationFilter,
}: AppApprovalsSectionProps) => {
  const rows = data || [];
  const [applicationFilter, setApplicationFilter] = useState(initialApplicationFilter ?? '');
  const [roleFilter, setRoleFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other applications'
  // approval rows aren't wiped out.
  const handleSave = (next: FlatAppApRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // approvals table, so picking one always yields at least one result.
  const applicationFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.applicationName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const roleFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.approverRole ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const nameFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.approverName ?? '').trim();
      if (v) seen.add(v);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!applicationFilter || r.applicationName === applicationFilter) &&
          (!roleFilter || r.approverRole === roleFilter) &&
          (!nameFilter || r.approverName === nameFilter),
      ),
    [rows, applicationFilter, roleFilter, nameFilter],
  );

  return (
    <GenericPanel
      config={APP_APPROVALS_CONFIG}
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
            label='Approver Role'
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleFilterOptions}
          />
          <TableFilterField
            label='Approver Name'
            value={nameFilter}
            onChange={setNameFilter}
            options={nameFilterOptions}
          />
        </Box>
      }
    />
  );
};
