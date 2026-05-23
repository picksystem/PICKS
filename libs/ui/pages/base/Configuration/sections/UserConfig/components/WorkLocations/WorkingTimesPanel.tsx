import { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem } from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';
import { UC_COLORS } from '../shared/userConfig.config';
import type { IConfigWorkLocationWorkingTime } from '@serviceops/interfaces';

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WorkingTimesPanelProps {
  locations: RowData;
  workingTimes: IConfigWorkLocationWorkingTime[];
  defaultLocationId: string | null;
  onSave: (times: IConfigWorkLocationWorkingTime[]) => void;
}

const WorkingTimesPanel = ({
  locations,
  workingTimes,
  defaultLocationId,
  onSave,
}: WorkingTimesPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    workLocationId: defaultLocationId ?? '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              dayOfWeek: editingRow.dayOfWeek,
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
            }
          : {
              workLocationId: defaultLocationId ?? '',
              dayOfWeek: 'Monday',
              startTime: '09:00',
              endTime: '17:00',
            },
      );
  }, [dialogOpen, editingRow, defaultLocationId]);

  const selectedRow = workingTimes.find((r) => r.id === selectedId) ?? null;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.dayOfWeek) return;
    const loc = (locations as any).find((l: any) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        workingTimes.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationWorkingTime = {
        id: `wt_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...workingTimes, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(workingTimes.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns = [
    { id: 'workLocationName', label: 'Work Location', minWidth: 150 },
    { id: 'dayOfWeek', label: 'Day of Week', minWidth: 120 },
    { id: 'startTime', label: 'Start Time', minWidth: 100 },
    { id: 'endTime', label: 'End Time', minWidth: 100 },
  ];

  const config = {
    title: 'Working Times',
    accent: UC_COLORS.workLocation,
    icon: <AccessTimeIcon fontSize='small' />,
    panelTitle: 'Working Times',
    columns,
    formConfig: {
      title: 'Working Time',
      subtitle: 'Configure working hours for a day and location',
      entity: 'Working Time',
      fields: [
        { name: 'dayOfWeek', label: 'Day of Week', required: true },
        { name: 'startTime', label: 'Start Time', required: true },
        { name: 'endTime', label: 'End Time', required: true },
      ],
    },
    searchFields: ['workLocationName', 'dayOfWeek'],
    getSelectedLabel: (row: RowData) => `${row.dayOfWeek ?? ''} · ${row.workLocationName ?? ''}`,
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'wt',
  };

  return (
    <>
      <GenericCRUDPanel
        config={config}
        data={workingTimes}
        onSave={(data) => {
          const newData = data as IConfigWorkLocationWorkingTime[];
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
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={UC_COLORS.workLocation}
        title='Working Time'
        subtitle='Configure working hours for a day and location'
        submitDisabled={!form.workLocationId || !form.dayOfWeek}
        maxWidth='xs'
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
          <InputLabel>Day of Week</InputLabel>
          <Select
            label='Day of Week'
            value={form.dayOfWeek}
            onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
          >
            {DAY_OPTIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        entityName='Working Time'
        itemName={selectedRow ? `${selectedRow.dayOfWeek} · ${selectedRow.workLocationName}` : ''}
      />
    </>
  );
};

export { WorkingTimesPanel };
