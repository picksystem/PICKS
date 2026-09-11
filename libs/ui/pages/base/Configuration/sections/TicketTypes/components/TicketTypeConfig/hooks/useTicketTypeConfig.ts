import { useState, useRef } from 'react';
import {
  useGetTicketTypeQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useCreateCustomFieldMutation,
  useUpdateCustomFieldMutation,
  useDeleteCustomFieldMutation,
} from '@serviceops/services';
import { ITicketType } from '@serviceops/interfaces';
import { useNotification, useAuth } from '@serviceops/hooks';
import {
  loadIconMap,
  loadTagMap,
  saveIconMap,
  saveTagMap,
} from '@serviceops/configtickettypeicons';

export interface TicketTypeFormValues {
  type: string;
  name: string;
  displayName: string;
  displayTag: string;
  shortDescription: string;
  description: string;
  prefix: string;
  isActive: boolean;
  numberLength: number;
  iconKey: string;
  tag: string;
  accessControl?: string[];
}

export function useTicketTypeConfig() {
  const { data: ticketTypes, isLoading, error } = useGetTicketTypeQuery();
  const [createTicketType] = useCreateTicketTypeMutation();
  const [updateTicketType] = useUpdateTicketTypeMutation();
  const [deleteTicketType] = useDeleteTicketTypeMutation();
  const notify = useNotification();
  const { user } = useAuth();

  const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ITicketType | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedRow =
    (ticketTypes as ITicketType[] | undefined)?.find((item) => item.id === selectedId) ?? null;
  const setSelectedRow = (row: ITicketType | null) => setSelectedId(row?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastClosedAt, setLastClosedAt] = useState(0);
  const dialogCloseRef = useRef(false);

  const [iconMap, setIconMap] = useState<Record<string, string>>(loadIconMap);
  const [tagMap, setTagMap] = useState<Record<string, string>>(loadTagMap);

  const openAddDialog = () => {
    if (isSubmitting || dialogCloseRef.current || Date.now() - lastClosedAt < 500) return;
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: ITicketType) => {
    if (isSubmitting || dialogCloseRef.current || Date.now() - lastClosedAt < 500) return;
    setEditingItem(item);
    setDialogOpen(true);
  };

  const openEditSelected = () => {
    if (selectedRow) openEditDialog(selectedRow);
  };

  const closeDialog = () => {
    dialogCloseRef.current = true;
    setDialogOpen(false);
    setEditingItem(null);
    setSelectedRow(null);
    setLastClosedAt(Date.now());
    setTimeout(() => {
      dialogCloseRef.current = false;
    }, 500);
  };

  const handleSubmit = async (values: TicketTypeFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateTicketType({
          id: editingItem.id,
          data: {
            name: values.name,
            displayName: values.displayName,
            displayTag: values.displayTag,
            shortDescription: values.shortDescription,
            description: values.description,
            prefix: values.prefix,
            isActive: values.isActive,
            numberLength: values.numberLength,
            accessControl: values.accessControl,
            iconKey: values.iconKey,
            tag: values.tag,
            lastUpdatedBy: currentUserName,
            lastUpdatedAt: new Date().toISOString(),
          },
        }).unwrap();
        notify.success('Ticket type updated successfully');
      } else {
        await createTicketType({
          type: values.type,
          name: values.name,
          displayName: values.displayName,
          displayTag: values.displayTag,
          shortDescription: values.shortDescription,
          description: values.description,
          prefix: values.prefix,
          isActive: values.isActive,
          numberLength: values.numberLength,
          accessControl: values.accessControl,
          iconKey: values.iconKey,
          tag: values.tag,
          lastUpdatedBy: currentUserName,
        }).unwrap();
        notify.success('Ticket type created successfully');
      }
      const typeKey = editingItem ? editingItem.type : values.type;
      if (typeKey) {
        if (values.iconKey) {
          const updatedIcons = { ...iconMap, [typeKey]: values.iconKey };
          setIconMap(updatedIcons);
          saveIconMap(updatedIcons);
        }
        if (values.tag) {
          const updatedTags = { ...tagMap, [typeKey]: values.tag };
          setTagMap(updatedTags);
          saveTagMap(updatedTags);
        }
      }
      closeDialog();
    } catch {
      notify.error(editingItem ? 'Failed to update ticket type' : 'Failed to create ticket type');
      throw new Error('Submit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: ITicketType) => {
    try {
      await updateTicketType({
        id: item.id,
        data: { isActive: !item.isActive, lastUpdatedBy: currentUserName },
      }).unwrap();
      notify.success(`Ticket type ${!item.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch {
      notify.error('Failed to update activation status');
    }
  };

  const handleDelete = async () => {
    const target = selectedRow;
    if (!target) return;
    try {
      await deleteTicketType(target.id).unwrap();
      notify.success('Ticket type deleted successfully');
      setSelectedRow(null);
    } catch {
      notify.error('Failed to delete ticket type');
    }
  };

  const handleLayoutSave = async (
    layoutConfig: import('@serviceops/interfaces').ITicketTypeLayoutConfig,
  ) => {
    if (!selectedRow) return;
    try {
      await updateTicketType({
        id: selectedRow.id,
        data: {
          layoutConfig,
          lastUpdatedBy: currentUserName,
          lastUpdatedAt: new Date().toISOString(),
        },
      }).unwrap();
      notify.success('Ticket screen layout saved successfully');
    } catch {
      notify.error('Failed to save ticket screen layout');
    }
  };

  const [createCustomField] = useCreateCustomFieldMutation();
  const [updateCustomField] = useUpdateCustomFieldMutation();
  const [deleteCustomField] = useDeleteCustomFieldMutation();

  const handleSaveCustomFields = async (
    fields: import('@serviceops/interfaces').ICustomField[],
  ) => {
    if (!selectedRow) return;
    try {
      await updateCustomField({
        ticketType: selectedRow.type,
        id: '__bulk__',
        data: fields,
      }).unwrap();
      notify.success('Custom field saved successfully');
    } catch {
      notify.error('Failed to save custom field');
    }
  };

  // Individual field CRUD helpers used by the dialog for optimistic add/edit/delete
  const handleCreateField = async (field: import('@serviceops/interfaces').ICustomField) => {
    if (!selectedRow) return;
    // Ensure the field has an id before persisting
    if (!field.id) {
      field = { ...field, id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
    }
    try {
      const result = await createCustomField({
        ticketType: selectedRow.type,
        data: field,
      }).unwrap();
      notify.success('Custom field created successfully');
      return result;
    } catch {
      notify.error('Failed to create custom field');
      throw new Error('Create failed');
    }
  };

  const handleUpdateField = async (field: import('@serviceops/interfaces').ICustomField) => {
    if (!selectedRow) return;
    try {
      const result = await updateCustomField({
        ticketType: selectedRow.type,
        id: field.id,
        data: [field],
      }).unwrap();
      notify.success('Custom field updated successfully');
      return result;
    } catch {
      notify.error('Failed to update custom field');
      throw new Error('Update failed');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!selectedRow) return;
    try {
      const result = await deleteCustomField({
        ticketType: selectedRow.type,
        id: fieldId,
      }).unwrap();
      notify.success('Custom field deleted successfully');
      return result;
    } catch {
      notify.error('Failed to delete custom field');
      throw new Error('Delete failed');
    }
  };

  return {
    ticketTypes: ticketTypes as ITicketType[] | undefined,
    isLoading,
    error,
    dialogOpen,
    editingItem,
    selectedRow,
    setSelectedRow,
    openAddDialog,
    openEditDialog,
    openEditSelected,
    closeDialog,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    handleLayoutSave,
    handleSaveCustomFields,
    handleCreateField,
    handleUpdateField,
    handleDeleteField,
    iconMap,
    tagMap,
    isSubmitting,
  };
}
