import { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem } from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel/GenericTablePanel';
import { UC_COLORS } from '../shared/userConfig.config';
import type { IConfigWorkLocationShift } from '@serviceops/interfaces';

interface ShiftsPanelProps {
  locations: RowData;
  shifts: IConfigWorkLocationShift[];
  defaultLocationId: string | null;
  onSave: (shifts: IConfigWorkLocationShift[]) => void;
}

const ShiftsPanel = ({ locations, shifts, defaultLocationId, onSave }: ShiftsPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationShift | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    workLocationId: defaultLocationId ?? '',
    shiftName: '',
    description: '',
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              shiftName: editingRow.shiftName,
              description: editingRow.description,
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
            }
          : {
              workLocationId: defaultLocationId ?? '',
              shiftName: '',
              description: '',
              startTime: '09:00',
              endTime: '17:00',
            },
      );
  }, [dialogOpen, editingRow, defaultLocationId]);

  const selectedRow = shifts.find((r) => r.id === selectedId) ?? null;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.shiftName.trim()) return;
    const loc = (locations as any).find((l: any) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        shifts.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationShift = {
        id: `sh_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...shifts, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(shifts.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns = [
    { id: 'workLocationName', label: 'Work Location', minWidth: 150 },
    { id: 'shiftName', label: 'Shift Name', minWidth: 140 },
    { id: 'description', label: 'Description', minWidth: 180 },
    { id: 'startTime', label: 'Start Time', minWidth: 100 },
    { id: 'endTime', label: 'End Time', minWidth: 100 },
  ];

  const config = {
    title: 'Shift Management',
    accent: UC_COLORS.workLocation,
    icon: <WatchLaterIcon fontSize='small' />,
    panelTitle: 'Shift Management',
    columns,
    formConfig: {
      title: 'Shift',
      subtitle: 'Define shift hours and assign to a work location',
      entity: 'Shift',
      fields: [
        { name: 'shiftName', label: 'Shift Name', required: true },
        { name: 'description', label: 'Description' },
        { name: 'startTime', label: 'Start Time', required: true },
        { name: 'endTime', label: 'End Time', required: true },
      ],
    },
    searchFields: ['workLocationName', 'shiftName'],
    getSelectedLabel: (row: RowData) => String(row.shiftName ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'sh',
  };

  return (
    <>
      <GenericCRUDPanel
        config={config}
        data={shifts}
        onSave={(data) => {
          const newData = data as IConfigWorkLocationShift[];
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
        icon={<WatchLaterIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={UC_COLORS.workLocation}
        title='Shift'
        subtitle='Define shift hours and assign to a work location'
        submitDisabled={!form.workLocationId || !form.shiftName.trim()}
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
          label='Shift Name'
          size='small'
          fullWidth
          required
          value={form.shiftName}
          onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Start Time'
            type='time'
            size='small'
            fullWidth
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='End Time'
            type='time'
            size='small'
            fullWidth
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </ConfigFormDialog>

      {/* Delete Dialog */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Shift'
        itemName={selectedRow?.shiftName}
      />
    </>
  );
};

export { ShiftsPanel };
