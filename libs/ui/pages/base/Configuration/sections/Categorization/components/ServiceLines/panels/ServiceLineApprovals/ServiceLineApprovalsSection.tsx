import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Column } from '@serviceops/component';
import { IConfigServiceLine } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import {
  ServiceLineApprovalFormDialog,
  ServiceLineApprovalRow,
} from '@serviceops/pages/base/Configuration/dialogs/ServiceLineApprovalFormDialog';
import { useSharedUsers } from '../../../../../../hooks/useSharedUsers';
import { SERVICE_LINE_APPROVALS_CONFIG } from '@serviceops/configcatorshared';
import { mkCell, mkActiveChip } from '@serviceops/configutils';
import {
  ServiceLineApprovalsSectionProps,
  FlatServiceLineApRow,
} from './ServiceLineApprovalsSection.types';

export const ServiceLineApprovalsSection = ({
  data,
  onDataChange,
}: ServiceLineApprovalsSectionProps) => {
  const { categorization: apiCat, approvals: apiApprovals } = useConfiguration();
  const { options: userOptions } = useSharedUsers();

  const [rows, setRows] = useState<FlatServiceLineApRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<FlatServiceLineApRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  // Persist the local rows back through the section's parent. The
  // ServiceLinesSection (the parent) flattens the per-service-line
  // approvals, so we just pass the list along — it knows how to attach
  // them to the right `serviceLineId`.
  const handleSave = useCallback(
    (next: FlatServiceLineApRow[]) => {
      setRows(next);
      onDataChange?.(next);
    },
    [onDataChange],
  );

  // Drop-down options for the "Service Line" field. Sourced from
  // `useConfiguration().categorization.serviceLines` and mapped to
  // `{ value: name, label: name }`. We also keep a parallel
  // id-by-name lookup so we can set `serviceLineId` when the user picks
  // a name (the persisted row needs both the id and the name).
  const { serviceLineOptions, serviceLineIdByName } = useMemo(() => {
    const sls = (apiCat?.serviceLines ?? []) as IConfigServiceLine[];
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    const idByName = new Map<string, string>();
    sls.forEach((sl) => {
      const name = String(sl?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
      idByName.set(key, String(sl.id ?? ''));
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return { serviceLineOptions: options, serviceLineIdByName: idByName };
  }, [apiCat?.serviceLines]);

  // Drop-down options for the "Approver name" field. Sourced from User
  // Management → All Users; value and label are the user's full name.
  // subtitle is the user's email and shows as the secondary line in the
  // popover, mirroring the User Management data table.
  const approverOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string; subtitle?: string }[] = [];
    userOptions.forEach((u) => {
      const name = String(u.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({
        value: name,
        label: name,
        subtitle: u.email || undefined,
      });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [userOptions]);

  // Drop-down options for the "Approver role" field. Sourced from
  // `useConfiguration().approvals.consultantRoles` (the existing
  // Approvals → Consultant Roles section is the source of truth for
  // these role names per the spec note).
  const approverRoleOptions = useMemo(() => {
    const roles = apiApprovals?.consultantRoles ?? [];
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    roles.forEach((r) => {
      const name = String(r?.roleName ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiApprovals?.consultantRoles]);

  // Column definitions for the data table. `isActive` is rendered as a
  // readonly Switch chip (so the user can see the enable state at a
  // glance); other fields use the plain cell renderer since they
  // already store display-ready text.
  const approvalColumns: Column<FlatServiceLineApRow>[] = useMemo(
    () => [
      {
        id: 'serviceLineName',
        label: 'Service Line',
        minWidth: 160,
        format: mkCell(true),
      },
      {
        id: 'approverName',
        label: 'Approver Name',
        minWidth: 180,
        format: mkCell(true),
      },
      { id: 'approverRole', label: 'Approver Role', minWidth: 160, format: mkCell() },
      { id: 'approvalOrder', label: 'Approval Order', minWidth: 140, format: mkCell() },
      {
        id: 'isActive',
        label: 'Enable',
        minWidth: 100,
        format: (value: unknown): React.ReactNode => {
          // Default to enabled when undefined/null so legacy rows without
          // the isActive flag render as Active. Mirrors the chip used in
          // the Add Approved Estimate data table (see `mkActiveChip`).
          const enabled = value === undefined || value === null ? true : Boolean(value);
          return mkActiveChip(enabled);
        },
      },
      { id: 'internalNote', label: 'Internal note', minWidth: 180, format: mkCell() },
    ],
    [],
  );

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingRow(selected);
      setDialogOpen(true);
    }
  }, [rows, selectedRowId]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleDialogSave = useCallback(
    (form: Partial<ServiceLineApprovalRow>) => {
      // When the user picks a service line by name, look up the id so
      // the persisted row carries both. If the lookup fails (e.g. the
      // service line was deleted), fall back to the existing id or ''.
      const slName = String(form.serviceLineName ?? '').trim();
      const slId = serviceLineIdByName.get(slName.toLowerCase()) ?? editingRow?.serviceLineId ?? '';

      const myId = editingRow?.id;
      const next: FlatServiceLineApRow[] = myId
        ? rows.map((r) =>
            r.id === myId
              ? {
                  ...r,
                  ...form,
                  id: r.id,
                  serviceLineId: slId,
                  serviceLineName: slName,
                  isActive: form.isActive ?? true,
                }
              : r,
          )
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              serviceLineId: slId,
              serviceLineName: slName,
              approverName: form.approverName ?? '',
              approverRole: form.approverRole ?? '',
              approvalOrder: Number(form.approvalOrder) || 1,
              isRequired: form.isRequired ?? true,
              isActive: form.isActive ?? true,
              internalNote: form.internalNote,
            } as FlatServiceLineApRow,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose, serviceLineIdByName],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      setSelectedRowId(null);
    } catch {
      // Errors already surface via the parent; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <>
      <GenericPanel
        config={
          SERVICE_LINE_APPROVALS_CONFIG as unknown as Parameters<typeof GenericPanel>[0]['config']
        }
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={approvalColumns as unknown as undefined}
        variant='standard'
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <ServiceLineApprovalFormDialog
        open={dialogOpen}
        editing={editingRow as ServiceLineApprovalRow | null}
        existingApprovals={rows as unknown as ServiceLineApprovalRow[]}
        serviceLineOptions={serviceLineOptions}
        approverOptions={approverOptions}
        approverRoleOptions={approverRoleOptions}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        subtitle={SERVICE_LINE_APPROVALS_CONFIG.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Service Line Approver'
        itemName={selectedRow?.approverName ?? ''}
      />
    </>
  );
};
