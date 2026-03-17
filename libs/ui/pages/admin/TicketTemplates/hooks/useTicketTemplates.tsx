import { useState } from 'react';
import {
  useGetTicketTypeQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
} from '../../../../../services';
import { ITicketType } from '@picks/interfaces';
import { useNotification } from '@picks/hooks';
import { loadIconMap, saveIconMap, loadTagMap, saveTagMap } from '../utils/ticketTypeIcons';

export interface TicketTypeFormValues {
  type: string;
  name: string;
  displayName: string;
  description: string;
  prefix: string;
  isActive: boolean;
  numberLength: number;
  iconKey: string;
  tag: string;
}

export function useTicketTemplates() {
  const { data: ticketTypes, isLoading, error } = useGetTicketTypeQuery();
  const [createTicketType] = useCreateTicketTypeMutation();
  const [updateTicketType] = useUpdateTicketTypeMutation();
  const [deleteTicketType] = useDeleteTicketTypeMutation();
  const notify = useNotification();

  const [advancedSequences, setAdvancedSequences] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ITicketType | null>(null);

  const [selectedRow, setSelectedRow] = useState<ITicketType | null>(null);

  // Icon map: type → iconKey (stored in localStorage)
  const [iconMap, setIconMap] = useState<Record<string, string>>(loadIconMap);
  // Tag map: type → tag value (stored in localStorage)
  const [tagMap, setTagMap] = useState<Record<string, string>>(loadTagMap);

  const openAddDialog = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: ITicketType) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const openEditSelected = () => {
    if (selectedRow) openEditDialog(selectedRow);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (values: TicketTypeFormValues) => {
    try {
      if (editingItem) {
        await updateTicketType({
          id: editingItem.id,
          data: {
            name: values.name,
            displayName: values.displayName,
            description: values.description,
            prefix: values.prefix,
            isActive: values.isActive,
            numberLength: values.numberLength,
          },
        }).unwrap();
        notify.success('Ticket type updated successfully');
      } else {
        await createTicketType({
          type: values.type,
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          prefix: values.prefix,
          isActive: values.isActive,
          numberLength: values.numberLength,
        }).unwrap();
        notify.success('Ticket type created successfully');
      }
      // Save icon + tag to localStorage
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
    advancedSequences,
    setAdvancedSequences,
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
  };
}
