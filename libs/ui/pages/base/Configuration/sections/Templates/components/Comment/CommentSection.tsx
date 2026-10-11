import { useState, useEffect, useCallback } from 'react';
import { IConfigCommentTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { useAuth } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { COMMENT_CONFIG, commentColumns } from '../shared/TemplatesPanelConfig';
import { CommentFormDialog } from './CommentFormDialog';

interface CommentSectionProps {
  data?: IConfigCommentTemplate[];
  onDataChange?: (data: IConfigCommentTemplate[]) => void;
}

const CommentSection = ({ data, onDataChange }: CommentSectionProps) => {
  const { classes } = useStyles();
  const { commentTemplates, saveSection, statuses } = useConfiguration();
  const { user } = useAuth();

  const [rows, setRows] = useState<IConfigCommentTemplate[]>([]);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'select' | null>(null);
  const [editingItem, setEditingItem] = useState<IConfigCommentTemplate | null>(null);
  const [selectedItem, setSelectedItem] = useState<IConfigCommentTemplate | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedRowId(id);
  }, []);

  const statusOptions = (statuses?.items ?? []).map((s) => ({
    value: s.displayName,
    label: s.displayName,
  }));

  const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  const now = () => new Date().toISOString();

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (commentTemplates?.items) {
      setRows(commentTemplates.items);
    }
  }, [data, commentTemplates]);

  const handleSave = (next: IConfigCommentTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('commentTemplates', { items: next });
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
    let next: IConfigCommentTemplate[];

    if (existing) {
      next = rows.map((r) =>
        r.id === existing
          ? ({
              ...r,
              ...formData,
              updatedBy: currentUserName,
              updatedAt: now(),
            } as IConfigCommentTemplate)
          : r,
      );
    } else {
      const newTemplate: IConfigCommentTemplate = {
        id: crypto.randomUUID(),
        ...formData,
        createdBy: currentUserName,
        createdAt: now(),
      } as IConfigCommentTemplate;
      next = [...rows, newTemplate];
    }

    handleSave(next);
    handleCloseDialog();
  };

  return (
    <div id='comment-template' className={classes.sectionAccordion}>
      <GenericPanel
        config={COMMENT_CONFIG}
        data={rows}
        onSave={handleSave}
        onNewClick={handleNew}
        onEditClick={handleEdit}
        customColumns={commentColumns as any}
        variant='plain'
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
      />

      <CommentFormDialog
        open={dialogMode !== null}
        onClose={handleCloseDialog}
        mode={dialogMode || 'create'}
        initialData={
          dialogMode === 'edit' ? editingItem : dialogMode === 'select' ? selectedItem : undefined
        }
        onSave={handleDialogSave}
        statusOptions={statusOptions}
      />
    </div>
  );
};

export { CommentSection };
