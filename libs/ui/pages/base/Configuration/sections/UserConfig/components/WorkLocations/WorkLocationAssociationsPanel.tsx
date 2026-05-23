import { useState, useEffect } from 'react';
import { TextField, Select, MenuItem } from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';
import { UC_COLORS } from '../shared/userConfig.config';
import type { IConfigWorkLocationAssociation } from '@serviceops/interfaces';

interface WorkLocationAssociationsPanelProps {
  locations: RowData;
  associations: IConfigWorkLocationAssociation[];
  defaultLocationId: string | null;
  onSave: (associations: IConfigWorkLocationAssociation[]) => void;
}

const WorkLocationAssociationsPanel = ({
  locations,
  associations,
  defaultLocationId,
  onSave,
}: WorkLocationAssociationsPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationAssociation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    workLocationId: defaultLocationId ?? '',
    associatedLocationId: '',
    description: '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              associatedLocationId: editingRow.associatedLocationId,
              description: editingRow.description,
            }
          : {
              workLocationId: defaultLocationId ?? '',
              associatedLocationId: '',
              description: '',
            },
      );
  }, [dialogOpen, editingRow, defaultLocationId]);

  const selectedRow = associations.find((r) => r.id === selectedId) ?? null;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.associatedLocationId.trim()) return;
    const loc = (locations as any).find((l: any) => l.id === form.workLocationId);
    const assocLoc = (locations as any).find((l: any) => l.id === form.associatedLocationId);
    if (editingRow) {
      onSave(
        associations.map((r) =>
          r.id === editingRow.id
            ? {
                ...editingRow,
                ...form,
                workLocationName: loc?.name ?? editingRow.workLocationName,
                associatedLocationName: assocLoc?.name ?? editingRow.associatedLocationName,
              }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationAssociation = {
        id: `wla_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        associatedLocationName: assocLoc?.name ?? '',
        ...form,
      };
      onSave([...associations, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(associations.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns = [
    { id: 'workLocationName', label: 'Work Location', minWidth: 150 },
    { id: 'associatedLocationName', label: 'Associated Location', minWidth: 160 },
    { id: 'description', label: 'Description', minWidth: 180 },
  ];

  const config = {
    title: 'Work Location Associations',
    accent: UC_COLORS.workLocation,
    icon: <LinkIcon fontSize='small' />,
    panelTitle: 'Work Location Associations',
    columns,
    formConfig: {
      title: 'Work Location Association',
      subtitle: 'Link a work location to another location',
      entity: 'Work Location Association',
      fields: [
        { name: 'associatedLocationId', label: 'Associated Location', required: true },
        { name: 'description', label: 'Description' },
      ],
    },
    searchFields: ['workLocationName', 'associatedLocationName'],
    getSelectedLabel: (row: RowData) => String(row.associatedLocationName ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'wla',
  };

  return (
    <>
      <GenericCRUDPanel
        config={config}
        data={associations}
        onSave={(data) => {
          const newData = data as IConfigWorkLocationAssociation[];
          setSelectedId(null);
        }}
      />

      {/* Form Dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<LinkIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={UC_COLORS.workLocation}
        title='Work Location Association'
        subtitle='Link a work location to another location'
        submitDisabled={!form.workLocationId || !form.associatedLocationId.trim()}
        maxWidth='sm'
      >
        {editingRow ? (
          <TextField
            label='Work Location'
            size='small'
            fullWidth
            value={editingRow.workLocationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Work Location</InputLabel>
            <Select
              label='Work Location'
              value={form.workLocationId}
              onChange={(e) => setForm((f) => ({ ...f, workLocationId: e.target.value }))}
            >
              {locations.map((l: any) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl size='small' fullWidth required>
          <InputLabel>Associated Location</InputLabel>
          <Select
            label='Associated Location'
            value={form.associatedLocationId}
            onChange={(e) => setForm((f) => ({ ...f, associatedLocationId: e.target.value }))}
          >
            {locations
              .filter((l: any) => l.id !== form.workLocationId)
              .map((l: any) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </ConfigFormDialog>

      {/* Delete Dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Work Location Association'
        itemName={selectedRow?.associatedLocationName}
      />
    </>
  );
};

export { WorkLocationAssociationsPanel };
