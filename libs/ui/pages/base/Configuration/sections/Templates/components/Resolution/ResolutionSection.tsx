import { useState, useEffect, useCallback } from 'react';
import { IConfigResolutionTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { useAuth } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { RESOLUTION_CONFIG, resolutionColumns } from '../shared/TemplatesPanelConfig';
import { ResolutionFormDialog } from './ResolutionFormDialog';

interface ResolutionSectionProps {
  data?: IConfigResolutionTemplate[];
  onDataChange?: (data: IConfigResolutionTemplate[]) => void;
}

const ResolutionSection = ({ data, onDataChange }: ResolutionSectionProps) => {
  const { classes } = useStyles();
  const { resolutionTemplates, saveSection, statuses, categorization } = useConfiguration();
  const { user } = useAuth();

  const [rows, setRows] = useState<IConfigResolutionTemplate[]>([]);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'select' | null>(null);
  const [editingItem, setEditingItem] = useState<IConfigResolutionTemplate | null>(null);
  const [selectedItem, setSelectedItem] = useState<IConfigResolutionTemplate | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedRowId(id);
  }, []);

  const statusOptions = (statuses?.items ?? []).map((s) => ({
    value: s.displayName,
    label: s.displayName,
  }));

  const applicationOptions = (categorization?.applications ?? []).map((a) => ({
    value: a.name,
    label: a.name,
  }));

  const categoryOptions = (categorization?.applicationCategories ?? []).map((c) => ({
    value: c.categoryName,
    label: c.categoryName,
  }));

  const subCategoryOptions = (categorization?.applicationSubCategories ?? []).map((sc) => ({
    value: sc.subCategoryName,
    label: sc.subCategoryName,
  }));

  const resolutionCodeOptions = [
    ...(statuses?.items ?? []).map((s) => ({ value: s.displayName, label: s.displayName })),
    { value: 'N/A', label: 'N/A' },
  ];

  const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const now = () => new Date().toISOString();

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (resolutionTemplates?.items) {
      setRows(resolutionTemplates.items);
    }
  }, [data, resolutionTemplates]);

  const handleSave = (next: IConfigResolutionTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('resolutionTemplates', { items: next });
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setSelectedItem(null);
    setSelectedRowId(null);
    setDialogMode('create');
  };

  const handleEdit = () => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingItem(selected);
      setDialogMode('edit');
    }
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditingItem(null);
    setSelectedItem(null);
    setSelectedRowId(null);
  };

  const handleDialogSave = (formData: Record<string, unknown>) => {
    const existing = formData.id as string | undefined;
    let next: IConfigResolutionTemplate[];

    if (existing) {
      next = rows.map((r) =>
        r.id === existing
          ? ({
              ...r,
              ...formData,
              updatedBy: currentUserName,
              updatedAt: now(),
            } as IConfigResolutionTemplate)
          : r,
      );
    } else {
      const newTemplate: IConfigResolutionTemplate = {
        id: crypto.randomUUID(),
        ...formData,
        createdBy: currentUserName,
        createdAt: now(),
      } as IConfigResolutionTemplate;
      next = [...rows, newTemplate];
    }

    handleSave(next);
    handleCloseDialog();
  };

  return (
    <div id='resolution-template' className={classes.sectionAccordion}>
      <GenericPanel
        config={RESOLUTION_CONFIG}
        data={rows}
        onSave={handleSave}
        onNewClick={handleNew}
        onEditClick={handleEdit}
        customColumns={resolutionColumns as any}
        variant='plain'
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
      />

      <ResolutionFormDialog
        open={dialogMode !== null}
        onClose={handleCloseDialog}
        mode={dialogMode || 'create'}
        initialData={
          dialogMode === 'edit' ? editingItem : dialogMode === 'select' ? selectedItem : undefined
        }
        onSave={handleDialogSave}
        statusOptions={statusOptions}
        applicationOptions={applicationOptions}
        categoryOptions={categoryOptions}
        subCategoryOptions={subCategoryOptions}
        resolutionCodeOptions={resolutionCodeOptions}
      />
    </div>
  );
};

export { ResolutionSection };
