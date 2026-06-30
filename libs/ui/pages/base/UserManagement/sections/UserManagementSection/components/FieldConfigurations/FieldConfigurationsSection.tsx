import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField } from '@serviceops/component';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { FIELD_CONFIG_TABLE, FIELD_CONFIG_COLUMNS } from '../shared/fieldConfig.config';
import { useFieldError } from '@serviceops/hooks';
import { ControlSearchField } from './components/ControlSearchField/ControlSearchField';
import type {
  FieldConfigurationsSectionProps,
  IConfigField,
} from './FieldConfigurationsSection.types';

dayjs.extend(weekOfYear);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ACCENT = '#0369a1';

interface DialogForm {
  date: string;
  day: string;
  calendarWeek: string;
  calendarMonth: string;
  control: string;
}

const FieldConfigurationsSection = ({
  data: externalData,
  isLoading,
  onDataChange,
  onCreate,
  onUpdate,
  onDelete,
}: FieldConfigurationsSectionProps) => {
  const reqError = useFieldError();

  const [rows, setRows] = useState<IConfigField[]>([]);

  // Custom dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigField | null>(null);
  const [isNewDialog, setIsNewDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [form, setForm] = useState<DialogForm>({
    date: '',
    day: '',
    calendarWeek: '',
    calendarMonth: '',
    control: '',
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (externalData !== undefined) {
      setRows(externalData);
    }
  }, [externalData]);

  const selectedRow = rows.find((r) => r.id === selectedId);

  // Dialog handlers
  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setForm({ date: '', day: '', calendarWeek: '', calendarMonth: '', control: '' });
    setDatePickerOpen(false);
    setFormErrors({});
    setShowValidation(false);
    setIsNewDialog(true);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    if (selectedId && selectedRow) {
      setEditingRow(selectedRow);
      setForm({
        date: selectedRow.date,
        day: selectedRow.day,
        calendarWeek: selectedRow.calendarWeek,
        calendarMonth: selectedRow.calendarMonth,
        control: selectedRow.control,
      });
      setDatePickerOpen(false);
      setFormErrors({});
      setShowValidation(false);
      setIsNewDialog(false);
      setDialogOpen(true);
    }
  }, [selectedId, selectedRow]);

  const handleDeleteClick = useCallback(() => {
    if (selectedId) setDeleteOpen(true);
  }, [selectedId]);

  const handleRowClick = useCallback(
    (row: IConfigField) => {
      setSelectedId(selectedId === row.id ? null : row.id);
    },
    [selectedId],
  );

  const handleClearClick = useCallback(() => {
    setSelectedId(null);
    setEditingRow(null);
    setIsNewDialog(false);
    setForm({ date: '', day: '', calendarWeek: '', calendarMonth: '', control: '' });
    setDatePickerOpen(false);
    setFormErrors({});
    setShowValidation(false);
  }, []);

  // Date change with auto-calculation
  const handleDateChange = useCallback((value: Dayjs | null) => {
    if (value) {
      const dateStr = value.format('YYYY-MM-DD');
      const dayName = DAY_NAMES[value.day()];
      const weekNum = value.week().toString();
      const monthName = value.format('MMMM');
      setForm((prev) => ({
        ...prev,
        date: dateStr,
        day: dayName,
        calendarWeek: weekNum,
        calendarMonth: monthName,
      }));
    } else {
      setForm((prev) => ({ ...prev, date: '', day: '', calendarWeek: '', calendarMonth: '' }));
    }
  }, []);

  // Control field change
  const handleControlChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, control: value }));
  }, []);

  // Validate form
  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.date) errors.date = 'required';
    if (!form.control) errors.control = 'required';
    return errors;
  }, [form]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setShowValidation(true);
      return;
    }

    try {
      if (editingRow && onUpdate) {
        await onUpdate(editingRow.id, form);
      } else if (onCreate) {
        await onCreate(form);
      }
      setDialogOpen(false);
      setSelectedId(null);
      setEditingRow(null);
      setIsNewDialog(false);
      setForm({ date: '', day: '', calendarWeek: '', calendarMonth: '', control: '' });
      setFormErrors({});
      setShowValidation(false);
    } catch {
      // Error handling is done in the parent component
    }
  }, [form, editingRow, onCreate, onUpdate, validateForm]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!selectedId) return;
    try {
      if (onDelete) {
        await onDelete(selectedId);
      }
      setDeleteOpen(false);
      setSelectedId(null);
      setEditingRow(null);
    } catch {
      // Error handling is done in the parent component
    }
  }, [selectedId, onDelete]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
    setIsNewDialog(false);
    setForm({ date: '', day: '', calendarWeek: '', calendarMonth: '', control: '' });
    setDatePickerOpen(false);
    setFormErrors({});
    setShowValidation(false);
  }, []);

  const dateValue = form.date ? dayjs(form.date) : null;

  const handleSave = useCallback(
    (next: IConfigField[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      }
    },
    [onDataChange],
  );

  return (
    <>
      <GenericPanel
        config={FIELD_CONFIG_TABLE}
        data={rows}
        onSave={handleSave}
        customColumns={FIELD_CONFIG_COLUMNS as never}
        variant='standard'
        enableSuccessMessage
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onRowSelect={(id) => setSelectedId(id)}
        selectedRowId={selectedId as string | null}
      />

      <ConfigFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        isEdit={!isNewDialog}
        icon={FIELD_CONFIG_TABLE.icon}
        accent={ACCENT}
        title={FIELD_CONFIG_TABLE.entity}
        subtitle={FIELD_CONFIG_TABLE.subtitle}
        submitLabel={editingRow ? 'Save' : 'Submit'}
        maxWidth='sm'
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DatePicker
              label='Date *'
              value={dateValue}
              onChange={handleDateChange}
              open={datePickerOpen}
              onOpen={() => setDatePickerOpen(true)}
              onClose={() => setDatePickerOpen(false)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: Boolean(showValidation && formErrors.date),
                  helperText: reqError(showValidation, formErrors.date),
                  onClick: () => !datePickerOpen && setDatePickerOpen(true),
                },
              }}
            />
            <TextField
              label='Day'
              value={form.day}
              size='small'
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
              helperText='Auto-calculated from Date'
            />
            <TextField
              label='Calendar week'
              value={form.calendarWeek}
              size='small'
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
              helperText='Auto-calculated from Date'
            />
            <TextField
              label='Calendar month'
              value={form.calendarMonth}
              size='small'
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
              helperText='Auto-calculated from Date'
            />
            <ControlSearchField
              label='Control'
              value={form.control}
              onChange={handleControlChange}
              required
              error={Boolean(showValidation && formErrors.control)}
              helperText={reqError(showValidation, formErrors.control)}
            />
          </Box>
        </LocalizationProvider>
      </ConfigFormDialog>
    </>
  );
};

export { FieldConfigurationsSection };
