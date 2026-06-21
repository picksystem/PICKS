import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IConfigApplicationCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationCategoryFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationCategoryFormDialog';
import {
  CATEG_TABLE_CONFIG,
  applicationCategoryColumns,
} from '../shared/CategorizationPanelConfig';
import { useNotification } from '@serviceops/hooks';
import { ApplicationCategoriesSectionProps } from './ApplicationCategoriesSection.types';

const ApplicationCategoriesSection = ({
  data,
  onDataChange,
}: ApplicationCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { success, error: showError } = useNotification();

  const [rows, setRows] = useState<IConfigApplicationCategory[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationCategories) {
      setRows(apiCat.applicationCategories);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigApplicationCategory[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      } else {
        saveSection('categorization', {
          businessCategories: apiCat?.businessCategories ?? [],
          serviceLines: apiCat?.serviceLines ?? [],
          applications: apiCat?.applications ?? [],
          queues: apiCat?.queues ?? [],
          applicationCategories: next,
          applicationSubCategories: apiCat?.applicationSubCategories ?? [],
          applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
        });
      }
    },
    [onDataChange, apiCat, saveSection],
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
    (form: Partial<IConfigApplicationCategory>) => {
      const myId = editingRow?.id;
      const next: IConfigApplicationCategory[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              applicationId: form.applicationId ?? '',
              applicationName: form.applicationName ?? '',
              categoryName: form.categoryName ?? '',
              shortDescription: form.shortDescription ?? '',
              description: form.description ?? '',
              internalNote: form.internalNote,
            } as IConfigApplicationCategory,
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
      success('Application category deleted successfully');
      setSelectedRowId(null);
    } catch {
      showError('Failed to delete application category. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave, success, showError]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationCategory}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={applicationCategoryColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <ApplicationCategoryFormDialog
        open={dialogOpen}
        editing={editingRow}
        existingCategories={rows}
        applicationOptions={applicationOptions}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        subtitle={CATEG_TABLE_CONFIG.applicationCategory.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Application Category'
        itemName={selectedRow?.categoryName ?? ''}
      />
    </div>
  );
};

export { ApplicationCategoriesSection };
