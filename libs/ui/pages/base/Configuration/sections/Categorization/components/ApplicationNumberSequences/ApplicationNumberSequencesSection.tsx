import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IConfigApplicationNumberSequence } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { useSharedTicketTypes } from '../../../../hooks/useSharedTicketTypes';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationNumberSequenceFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationNumberSequenceFormDialog';
import {
  CATEG_TABLE_CONFIG,
  applicationNumberSequenceColumns,
} from '../shared/CategorizationPanelConfig';
import { useNotification } from '@serviceops/hooks';
import { ApplicationNumberSequencesSectionProps } from './ApplicationNumberSequencesSection.types';

const ApplicationNumberSequencesSection = ({
  data,
  onDataChange,
}: ApplicationNumberSequencesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { ticketTypes } = useSharedTicketTypes();
  const { success, error: showError } = useNotification();

  const [rows, setRows] = useState<IConfigApplicationNumberSequence[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationNumberSequence | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationNumberSequences) {
      setRows(apiCat.applicationNumberSequences);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigApplicationNumberSequence[]) => {
      // Transform rows to ensure ticketTypeName is set correctly
      const transformedRows = next.map((row) => {
        if (row.ticketTypeId && !row.ticketTypeName) {
          const tt = ticketTypes?.find(
            (t: { id: string | number }) => String(t.id) === String(row.ticketTypeId),
          );
          return {
            ...row,
            ticketTypeName: tt?.displayName || tt?.name || String(row.ticketTypeId),
          };
        }
        return row;
      });

      setRows(transformedRows);
      if (onDataChange) {
        onDataChange(transformedRows);
      } else {
        saveSection('categorization', {
          businessCategories: apiCat?.businessCategories ?? [],
          serviceLines: apiCat?.serviceLines ?? [],
          applications: apiCat?.applications ?? [],
          queues: apiCat?.queues ?? [],
          applicationCategories: apiCat?.applicationCategories ?? [],
          applicationSubCategories: apiCat?.applicationSubCategories ?? [],
          applicationNumberSequences: transformedRows,
        });
      }
    },
    [onDataChange, apiCat, ticketTypes, saveSection],
  );

  // Drop-down options for the "Application" field. Sourced from the
  // existing applications list. value and label are the application
  // name; deduplicated case-insensitively and sorted alphabetically.
  const applicationOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    (apiCat?.applications ?? []).forEach((a) => {
      const name = String(a?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiCat?.applications]);

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
    (form: Partial<IConfigApplicationNumberSequence>) => {
      const myId = editingRow?.id;
      const next: IConfigApplicationNumberSequence[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              applicationId: form.applicationId ?? '',
              applicationName: form.applicationName ?? '',
              ticketTypeId: (form.ticketTypeId ?? 0) as number,
              ticketTypeName: form.ticketTypeName ?? '',
              numberSequenceCode: form.numberSequenceCode ?? '',
              numericCharLength: (form.numericCharLength ?? 0) as number,
              numberSequenceFormat: form.numberSequenceFormat ?? '',
              internalNote: form.internalNote,
            } as IConfigApplicationNumberSequence,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      success('Number sequence deleted successfully');
      setSelectedRowId(null);
    } catch {
      showError('Failed to delete number sequence. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave, success, showError]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationNumberSequence}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={applicationNumberSequenceColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <ApplicationNumberSequenceFormDialog
        open={dialogOpen}
        editing={editingRow}
        existingSequences={rows}
        applicationOptions={applicationOptions}
        ticketTypes={ticketTypes ?? []}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        subtitle={CATEG_TABLE_CONFIG.applicationNumberSequence.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Number Sequence'
        itemName={
          selectedRow ? `${selectedRow.applicationName} – ${selectedRow.numberSequenceCode}` : ''
        }
      />
    </div>
  );
};

export { ApplicationNumberSequencesSection };
