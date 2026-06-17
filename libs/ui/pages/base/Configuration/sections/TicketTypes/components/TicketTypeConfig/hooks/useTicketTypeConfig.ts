import { useState, useRef } from 'react';
import {
  useGetTicketTypeQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
} from '@serviceops/services';
import { ITicketType } from '@serviceops/interfaces';
import { useNotification } from '@serviceops/hooks';
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ITicketType | null>(null);
  const [selectedRow, setSelectedRow] = useState<ITicketType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastClosedAt, setLastClosedAt] = useState(0);
  const dialogCloseRef = useRef(false);

  const [iconMap, setIconMap] = useState<Record<string, string>>(loadIconMap);
  const [tagMap, setTagMap] = useState<Record<string, string>>(loadTagMap);

  const openAddDialog = () => {
    // Prevent opening during submission or within 500ms after closing
    if (isSubmitting || dialogCloseRef.current || Date.now() - lastClosedAt < 500) return;
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: ITicketType) => {
    // Prevent opening during submission or within 500ms after closing
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
    // Reset the ref after a delay to prevent immediate re-open
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
      await updateTicketType({ id: item.id, data: { isActive: !item.isActive } }).unwrap();
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
    iconMap,
    tagMap,
    isSubmitting,
  };
}
