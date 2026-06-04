import { useState, useEffect, useCallback } from 'react';
import { IConfigTimeEntryTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { TIME_ENTRY_CONFIG, timeEntryColumns } from '../shared/TemplatesPanelConfig';
import { TimeEntryFormDialog } from './TimeEntryFormDialog';

interface TimeEntrySectionProps {
  data?: IConfigTimeEntryTemplate[];
  onDataChange?: (data: IConfigTimeEntryTemplate[]) => void;
}

const TimeEntrySection = ({ data, onDataChange }: TimeEntrySectionProps) => {
  const { classes } = useStyles();
  const { timeEntryTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTimeEntryTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigTimeEntryTemplate | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (timeEntryTemplates?.items) {
      setRows(timeEntryTemplates.items);
    }
  }, [data, timeEntryTemplates]);

  const handleSave = (next: IConfigTimeEntryTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('timeEntryTemplates', { items: next });
    }
  };

  const handleNew = useCallback(() => {
    setIsEdit(false);
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    const row = rows.find((r) => r.id === selectedId);
    if (row) {
      setIsEdit(true);
      setEditingRow(row);
      setDialogOpen(true);
    }
  }, [rows, selectedId]);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleSubmit = useCallback(
    (formData: IConfigTimeEntryTemplate) => {
      if (isEdit && editingRow) {
        handleSave(rows.map((r) => (r.id === editingRow.id ? formData : r)));
      } else {
        handleSave([...rows, formData]);
      }
      setDialogOpen(false);
      setEditingRow(null);
    },
    [isEdit, editingRow, rows],
  );

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TIME_ENTRY_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={timeEntryColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
        selectedRowId={selectedId}
        onRowSelect={handleRowSelect}
        onNewClick={handleNew}
        onEditClick={handleEdit}
      />
      <TimeEntryFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        initialData={editingRow || undefined}
      />
    </div>
  );
};

export { TimeEntrySection };
