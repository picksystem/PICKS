import { useState, useEffect, useCallback } from 'react';
import { IConfigTicketUpdateTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { useAuth } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { TICKET_UPDATE_CONFIG, ticketUpdateColumns } from '../shared/TemplatesPanelConfig';
import { TicketUpdateFormDialog } from './TicketUpdateFormDialog';

interface TicketUpdateSectionProps {
  data?: IConfigTicketUpdateTemplate[];
  onDataChange?: (data: IConfigTicketUpdateTemplate[]) => void;
}

const TicketUpdateSection = ({ data, onDataChange }: TicketUpdateSectionProps) => {
  const { classes } = useStyles();
  const { ticketUpdateTemplates, saveSection, statuses } = useConfiguration();
  const { user } = useAuth();

  const [rows, setRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'select' | null>(null);
  const [editingItem, setEditingItem] = useState<IConfigTicketUpdateTemplate | null>(null);
  const [selectedItem, setSelectedItem] = useState<IConfigTicketUpdateTemplate | null>(null);
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
    } else if (ticketUpdateTemplates?.items) {
      setRows(ticketUpdateTemplates.items);
    }
  }, [data, ticketUpdateTemplates]);

  const handleSave = (next: IConfigTicketUpdateTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('ticketUpdateTemplates', { items: next });
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
    let next: IConfigTicketUpdateTemplate[];

    if (existing) {
      // Edit mode — update audit fields
      next = rows.map((r) =>
        r.id === existing
          ? ({
              ...r,
              ...formData,
              updatedBy: currentUserName,
              updatedAt: now(),
            } as IConfigTicketUpdateTemplate)
          : r,
      );
    } else {
      // Create mode — only set createdBy/createdAt, no updated fields yet
      const newTemplate: IConfigTicketUpdateTemplate = {
        id: crypto.randomUUID(),
        ...formData,
        createdBy: currentUserName,
        createdAt: now(),
      } as IConfigTicketUpdateTemplate;
      next = [...rows, newTemplate];
    }

    handleSave(next);
    handleCloseDialog();
  };

  return (
    <div id='ticket-update-template' className={classes.sectionAccordion}>
      <GenericPanel
        config={TICKET_UPDATE_CONFIG}
        data={rows}
        onSave={handleSave}
        onNewClick={handleNew}
        onEditClick={handleEdit}
        customColumns={ticketUpdateColumns as any}
        variant='plain'
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
      />

      <TicketUpdateFormDialog
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

export { TicketUpdateSection };
