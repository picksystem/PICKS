import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, TextField } from '@serviceops/component';
import { CalendarToday } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigWorkingCalendar } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';

const WC_ACCENT = '#0369a1';

interface WorkingCalendarFormDialogProps {
  open: boolean;
  editing: IConfigWorkingCalendar | null;
  /** Other working-calendar rows for duplicate-name detection. */
  existingCalendars?: IConfigWorkingCalendar[];
  onClose: () => void;
  onSave: (data: Partial<IConfigWorkingCalendar>) => void;
  subtitle?: string;
}

const WorkingCalendarFormDialog = ({
  open,
  editing,
  existingCalendars = [],
  onClose,
  onSave,
  subtitle,
}: WorkingCalendarFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigWorkingCalendar>>({});
  const formRef = useRef<Partial<IConfigWorkingCalendar>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ name?: boolean }>({});
  const [requiredErrors, setRequiredErrors] = useState<{ name?: string }>({});

  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigWorkingCalendar>
        | ((f: Partial<IConfigWorkingCalendar>) => Partial<IConfigWorkingCalendar>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  const validateRequired = (f: Partial<IConfigWorkingCalendar>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<IConfigWorkingCalendar>): string | null => {
    const myId = editing?.id;
    const others = existingCalendars.filter((c) => c.id !== myId);
    const nameVal = String(f.name ?? '')
      .trim()
      .toLowerCase();
    if (nameVal && others.some((c) => String(c.name ?? '').trim().toLowerCase() === nameVal)) {
      return 'Working Calendar already exists. Please use a different value.';
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
    const initial: Partial<IConfigWorkingCalendar> = editing
      ? {
          name: editing.name,
          holidayCalendar: editing.holidayCalendar ?? '',
          workingDayTemplate: editing.workingDayTemplate ?? '',
          shortDescription: editing.shortDescription ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          name: '',
          holidayCalendar: '',
          workingDayTemplate: '',
          shortDescription: '',
          internalNote: '',
        };
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
    success(editing ? 'Working calendar updated successfully' : 'Working calendar added successfully');
  };

  const nameError = reqError(touched.name, requiredErrors.name);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<CalendarToday sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={WC_ACCENT}
      title='Working Calendar'
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
        label='Working Calendar'
        size='small'
        value={form.name ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        placeholder='e.g. UK Standard Calendar'
        inputProps={{ style: { fontWeight: 700 } }}
        error={Boolean(nameError)}
        helperText={nameError || ' '}
        required
      />

      <TextField
        label='Holiday Calendar'
        size='small'
        value={form.holidayCalendar ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, holidayCalendar: e.target.value }))}
        placeholder='e.g. UK Bank Holidays'
        fullWidth
      />

      <TextField
        label='Working Day Template'
        size='small'
        value={form.workingDayTemplate ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, workingDayTemplate: e.target.value }))}
        placeholder='e.g. Standard 9-5'
        fullWidth
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

export default WorkingCalendarFormDialog;
