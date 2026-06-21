import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IConfigApplicationSubCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationSubCategoryFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationSubCategoryFormDialog';
import {
  CATEG_TABLE_CONFIG,
  applicationSubCategoryColumns,
} from '../shared/CategorizationPanelConfig';
import { useNotification } from '@serviceops/hooks';
import { ApplicationSubCategoriesSectionProps } from './ApplicationSubCategoriesSection.types';

const ApplicationSubCategoriesSection = ({
  data,
  onDataChange,
}: ApplicationSubCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { success, error: showError } = useNotification();

  const [rows, setRows] = useState<IConfigApplicationSubCategory[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationSubCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationSubCategories) {
      setRows(apiCat.applicationSubCategories);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigApplicationSubCategory[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      } else {
        saveSection('categorization', {
          businessCategories: apiCat?.businessCategories ?? [],
          serviceLines: apiCat?.serviceLines ?? [],
          applications: apiCat?.applications ?? [],
          queues: apiCat?.queues ?? [],
          applicationCategories: apiCat?.applicationCategories ?? [],
          applicationSubCategories: next,
          applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
        });
      }
    },
    [onDataChange, apiCat, saveSection],
  );

  // Drop-down options for the "Application category" field. Sourced from
  // the existing application-categories list. value and label are the
  // application category name; deduplicated case-insensitively and
  // sorted alphabetically.
  const applicationCategoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    (apiCat?.applicationCategories ?? []).forEach((c) => {
      const name = String(c?.categoryName ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiCat?.applicationCategories]);

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
    (form: Partial<IConfigApplicationSubCategory>) => {
      const myId = editingRow?.id;
      const next: IConfigApplicationSubCategory[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              applicationId: form.applicationId ?? '',
              applicationName: form.applicationName ?? '',
              applicationCategoryId: form.applicationCategoryId ?? '',
              applicationCategoryName: form.applicationCategoryName ?? '',
              subCategoryName: form.subCategoryName ?? '',
              shortDescription: form.shortDescription ?? '',
              description: form.description ?? '',
              internalNote: form.internalNote,
            } as IConfigApplicationSubCategory,
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
      success('Application sub-category deleted successfully');
      setSelectedRowId(null);
    } catch {
      showError('Failed to delete application sub-category. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave, success, showError]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationSubCategory}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={applicationSubCategoryColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <ApplicationSubCategoryFormDialog
        open={dialogOpen}
        editing={editingRow}
        existingSubCategories={rows}
        applicationCategoryOptions={applicationCategoryOptions}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        subtitle={CATEG_TABLE_CONFIG.applicationSubCategory.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Application Sub-Category'
        itemName={selectedRow?.subCategoryName ?? ''}
      />
    </div>
  );
};

export { ApplicationSubCategoriesSection };
