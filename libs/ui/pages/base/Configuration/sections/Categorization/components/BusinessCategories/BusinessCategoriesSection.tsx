import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography } from '@serviceops/component';
import { IConfigBusinessCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useNotification } from '@serviceops/hooks';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { BusinessCategoryFormDialog } from '@serviceops/pages/base/Configuration/dialogs/BusinessCategoryFormDialog';
import { CATEG_TABLE_CONFIG } from '../shared/CategorizationPanelConfig';
import { useSharedUsers } from '../../../../hooks/useSharedUsers';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';

interface BusinessCategoriesSectionProps {
  data?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigBusinessCategory[]) => void;
}

const BusinessCategoriesSection = ({ data, onDataChange }: BusinessCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const {
    categorization: apiCat,
    saveSection,
  } = useConfiguration();
  const { options: userOptions } = useSharedUsers();

  const [rows, setRows] = useState<IConfigBusinessCategory[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigBusinessCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sync local rows with props/api whenever the upstream source changes.
  // The dialog flow goes through `handleSave`, which calls setRows, so
  // this only matters for first-load / external updates.
  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.businessCategories) {
      setRows(apiCat.businessCategories);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigBusinessCategory[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      } else {
        saveSection('categorization', {
          businessCategories: next,
          serviceLines: apiCat?.serviceLines ?? [],
          applications: apiCat?.applications ?? [],
          queues: apiCat?.queues ?? [],
          applicationCategories: apiCat?.applicationCategories ?? [],
          applicationSubCategories: apiCat?.applicationSubCategories ?? [],
          applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
        });
      }
    },
    [onDataChange, apiCat, saveSection],
  );

  // Column definitions for the data table. The `head` column uses a custom
  // formatter that resolves a stored user id (or name) back to the user's
  // full name via the shared users cache. This keeps legacy rows — saved
  // when an earlier version of the dialog stored the user id in `head` —
  // rendering correctly in the table, while new rows that store the full
  // name render correctly as well.
  const businessCategoryColumns: Column<IConfigBusinessCategory>[] = useMemo(
    () => [
      { id: 'name', label: 'Business Category Name', minWidth: 180, format: mkCell(true) },
      { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
      { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
      {
        id: 'head',
        label: 'Business Category Head',
        minWidth: 160,
        format: (value: unknown): React.ReactNode => {
          const stored = String(value ?? '').trim();
          if (!stored) return <span>—</span>;
          // First try to match by user id (legacy rows). If that doesn't
          // match, the stored value is already the full name — render it
          // directly.
          const byId = userOptions.find((u) => String(u.id) === stored);
          const displayName = byId?.name ?? stored;
          return (
            <Typography variant='body2' fontSize='0.82rem'>
              {displayName}
            </Typography>
          );
        },
      },
      { id: 'internalNote', label: 'Internal note', minWidth: 200, format: mkCell() },
    ],
    [userOptions],
  );

  // Drop-down options for the "Business Category Head" field. Pulled from
  // the same source as the User Management page so the names shown here
  // match `firstName + ' ' + lastName` (full name) rather than the single
  // `consultantName` field stored on the consultant profile, which often
  // only contains one name. We store the user's full name in `value` (and
  // show the same in `label`) so the data table renders the name directly
  // via its plain `mkCell` renderer — no id→name resolution needed in the
  // table. `subtitle` is the user's email, surfaced as the secondary line
  // in the popover to mirror the Work Email column on the User Management
  // data table. (If two users share a name, both resolve to the same stored
  // value; acceptable for this internal team directory.)
  const headOptions = useMemo(() => {
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
    (form: Partial<IConfigBusinessCategory>) => {
      const myId = editingRow?.id;
      const next: IConfigBusinessCategory[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [...rows, { id: `${Date.now()}`, ...form } as IConfigBusinessCategory];
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
      success('Business category deleted successfully');
      setSelectedRowId(null);
    } catch (err) {
      showError('Failed to delete business category. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave, success, showError]);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.businessCategory}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={businessCategoryColumns as unknown as undefined}
        variant='plain'
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <BusinessCategoryFormDialog
        open={dialogOpen}
        editing={editingRow}
        existingCategories={rows}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        headOptions={headOptions}
        subtitle={CATEG_TABLE_CONFIG.businessCategory.subtitle}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName='Business Category'
        itemName={selectedRow?.name ?? ''}
      />
    </div>
  );
};

export { BusinessCategoriesSection };
