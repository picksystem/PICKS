import { useMemo, useState } from 'react';
import { Box } from '@serviceops/component';
import { QUEUE_APPROVALS_CONFIG, GenericPanel, TableFilterField } from '@serviceops/configcatorshared';
import { QueueApprovalsSectionProps, FlatQueueApRow } from './QueueApprovalsSection.types';

export const QueueApprovalsSection = ({
  data,
  onDataChange,
  hideHeader,
  initialQueueFilter,
}: QueueApprovalsSectionProps) => {
  const rows = data || [];
  const [queueFilter, setQueueFilter] = useState(initialQueueFilter ?? '');
  const [roleFilter, setRoleFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  // `next` is GenericPanel's own add/edit/delete result, scoped to the
  // *filtered* subset it was given (data={filteredRows}) — merge it back
  // with whatever fell outside the active filters so other queues'
  // approval rows aren't wiped out.
  const handleSave = (next: FlatQueueApRow[]) => {
    const untouched = rows.filter((r) => !filteredRows.some((fr) => fr.id === r.id));
    onDataChange?.([...untouched, ...next]);
  };

  // Filter dropdown options — distinct values currently present in the
  // approvals table, so picking one always yields at least one result.
  const queueFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => {
      const v = String(r.queueName ?? '').trim();
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
          (!queueFilter || r.queueName === queueFilter) &&
          (!roleFilter || r.approverRole === roleFilter) &&
          (!nameFilter || r.approverName === nameFilter),
      ),
    [rows, queueFilter, roleFilter, nameFilter],
  );

  return (
    <GenericPanel
      config={QUEUE_APPROVALS_CONFIG}
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
