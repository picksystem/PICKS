import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, TextField } from '@serviceops/component';
import { CalendarMonth } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigHolidayCalendar } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';

const HC_ACCENT = '#0369a1';

interface HolidayCalendarFormDialogProps {
  open: boolean;
  editing: IConfigHolidayCalendar | null;
  /** Other holiday-calendar rows for duplicate-name detection. */
  existingCalendars?: IConfigHolidayCalendar[];
  onClose: () => void;
  onSave: (data: Partial<IConfigHolidayCalendar>) => void;
  subtitle?: string;
}

const HolidayCalendarFormDialog = ({
  open,
  editing,
  existingCalendars = [],
  onClose,
  onSave,
  subtitle,
}: HolidayCalendarFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigHolidayCalendar>>({});
  const formRef = useRef<Partial<IConfigHolidayCalendar>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ name?: boolean }>({});
  const [requiredErrors, setRequiredErrors] = useState<{ name?: string }>({});

  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigHolidayCalendar>
        | ((f: Partial<IConfigHolidayCalendar>) => Partial<IConfigHolidayCalendar>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  const validateRequired = (f: Partial<IConfigHolidayCalendar>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<IConfigHolidayCalendar>): string | null => {
    const myId = editing?.id;
    const others = existingCalendars.filter((c) => c.id !== myId);
    const nameVal = String(f.name ?? '')
      .trim()
      .toLowerCase();
    if (nameVal && others.some((c) => String(c.name ?? '').trim().toLowerCase() === nameVal)) {
      return 'Holiday Calendar already exists. Please use a different value.';
    }
    return null;
  };

  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingCalendars]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigHolidayCalendar> = editing
      ? {
          name: editing.name,
          shortDescription: editing.shortDescription ?? '',
          description: editing.description ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : { name: '', shortDescription: '', description: '', internalNote: '' };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ name: true });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const message = computeDuplicateMessage(formRef.current);
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSave(formRef.current);
    success(editing ? 'Holiday calendar updated successfully' : 'Holiday calendar added successfully');
  };

  const nameError = reqError(touched.name, requiredErrors.name);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<CalendarMonth sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={HC_ACCENT}
      title='Holiday Calendar'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='sm'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      <TextField
        label='Holiday Calendar'
        size='small'
        value={form.name ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        placeholder='e.g. UK Bank Holidays'
        inputProps={{ style: { fontWeight: 700 } }}
        error={Boolean(nameError)}
        helperText={nameError || ' '}
        required
      />

      <TextField
        label='Short Description'
        size='small'
        value={form.shortDescription ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, shortDescription: e.target.value }))}
        fullWidth
      />

      <Box>
        <TextField
          label='Description'
          size='small'
          value={form.description ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, description: e.target.value }))}
          multiline
          minRows={3}
          fullWidth
        />
      </Box>

      <Box>
        <TextField
          label='Internal Note'
          size='small'
          value={form.internalNote ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, internalNote: e.target.value }))}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>
    </ConfigFormDialog>
  );
};

export default HolidayCalendarFormDialog;
