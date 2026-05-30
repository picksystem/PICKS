import { useState, useEffect, useCallback } from 'react';
import { IConfigBusinessCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { CATEG_TABLE_CONFIG, businessCategoryColumns } from '../shared/CategorizationPanelConfig';

interface BusinessCategoriesSectionProps {
  data?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigBusinessCategory[]) => void;
}

const BusinessCategoriesSection = ({ data, onDataChange }: BusinessCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigBusinessCategory[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigBusinessCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleClearClick = useCallback(() => {
    setSelectedRowId(null);
  }, []);

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.businessCategory}
        data={rows}
        onSave={handleSave}
        customColumns={businessCategoryColumns as any}
        variant='plain'
        enableNewButton={false}
        enableEditButton={false}
        enableDeleteButton={false}
        selectedRowId={selectedRowId}
        onRowSelect={setSelectedRowId}
      />
    </div>
  );
};

export { BusinessCategoriesSection };
