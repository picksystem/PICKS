import { useState, useEffect } from 'react';
import { TextField, Select, MenuItem } from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';
import { UC_COLORS } from '../shared/userConfig.config';
import type { IConfigWorkLocationAssociatedProfile } from '@serviceops/interfaces';

interface AssocProfilesPanelProps {
  locations: RowData;
  associatedProfiles: IConfigWorkLocationAssociatedProfile[];
  defaultLocationId: string | null;
  onSave: (profiles: IConfigWorkLocationAssociatedProfile[]) => void;
}

const AssocProfilesPanel = ({
  locations,
  associatedProfiles,
  defaultLocationId,
  onSave,
}: AssocProfilesPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationAssociatedProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    workLocationId: defaultLocationId ?? '',
    consultantProfileId: '',
    consultantName: '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              consultantProfileId: editingRow.consultantProfileId,
              consultantName: editingRow.consultantName,
            }
          : {
              workLocationId: defaultLocationId ?? '',
              consultantProfileId: '',
              consultantName: '',
            },
      );
  }, [dialogOpen, editingRow, defaultLocationId]);

  const selectedRow = associatedProfiles.find((r) => r.id === selectedId) ?? null;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.consultantName.trim()) return;
    const loc = (locations as any).find((l: any) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        associatedProfiles.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationAssociatedProfile = {
        id: `ap_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...associatedProfiles, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(associatedProfiles.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns = [
    { id: 'workLocationName', label: 'Work Location', minWidth: 150 },
    { id: 'consultantName', label: 'Consultant Profile', minWidth: 180 },
    { id: 'consultantProfileId', label: 'Profile ID', minWidth: 120 },
  ];

  const config = {
    title: 'Associated Consultant Profiles',
    accent: UC_COLORS.workLocation,
    icon: <GroupIcon fontSize='small' />,
    panelTitle: 'Associated Consultant Profiles',
    columns,
    formConfig: {
      title: 'Associated Consultant Profile',
      subtitle: 'Link a consultant profile to a work location',
      entity: 'Associated Consultant Profile',
      fields: [
        { name: 'consultantName', label: 'Consultant Name', required: true },
        { name: 'consultantProfileId', label: 'Consultant Profile ID' },
      ],
    },
    searchFields: ['workLocationName', 'consultantName'],
    getSelectedLabel: (row: RowData) => String(row.consultantName ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'ap',
  };

  return (
    <>
      <GenericCRUDPanel
        config={config}
        data={associatedProfiles}
        onSave={(data) => {
          const newData = data as IConfigWorkLocationAssociatedProfile[];
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
        icon={<GroupIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={UC_COLORS.workLocation}
        title='Associated Consultant Profile'
        subtitle='Link a consultant profile to a work location'
        submitDisabled={!form.workLocationId || !form.consultantName.trim()}
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
        <TextField
          label='Consultant Name'
          size='small'
          fullWidth
          required
          value={form.consultantName}
          onChange={(e) => setForm((f) => ({ ...f, consultantName: e.target.value }))}
        />
        <TextField
          label='Consultant Profile ID'
          size='small'
          fullWidth
          value={form.consultantProfileId}
          onChange={(e) => setForm((f) => ({ ...f, consultantProfileId: e.target.value }))}
        />
      </ConfigFormDialog>

      {/* Delete Dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Associated Consultant Profile'
        itemName={selectedRow?.consultantName}
      />
    </>
  );
};

export { AssocProfilesPanel };
