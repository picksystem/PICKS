import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, TextField, Typography } from '@serviceops/component';
import { CalendarMonth } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigHolidayCalendar } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

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
  const [touched, setTouched] = useState<{
    name?: boolean;
    shortDescription?: boolean;
    description?: boolean;
    internalNote?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    shortDescription?: string;
    description?: string;
    internalNote?: string;
  }>({});

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
    if (!String(f.shortDescription ?? '').trim()) errs.shortDescription = 'required';
    if (!String(f.description ?? '').trim()) errs.description = 'required';
    if (!String(f.internalNote ?? '').trim()) errs.internalNote = 'required';
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<IConfigHolidayCalendar>): string | null => {
    const myId = editing?.id;
    const others = existingCalendars.filter((c) => c.id !== myId);
    const nameVal = String(f.name ?? '')
      .trim()
      .toLowerCase();
    if (
      nameVal &&
      others.some(
        (c) =>
          String(c.name ?? '')
            .trim()
            .toLowerCase() === nameVal,
      )
    ) {
      return `Holiday Calendar "${String(f.name ?? '')}" already exists. Please use a different name.`;
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
    setTouched({ name: true, shortDescription: true, description: true, internalNote: true });
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
    success(
      editing ? 'Holiday calendar updated successfully' : 'Holiday calendar added successfully',
    );
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const shortDescriptionError = reqError(touched.shortDescription, requiredErrors.shortDescription);
  const descriptionError = reqError(touched.description, requiredErrors.description);
  const internalNoteError = reqError(touched.internalNote, requiredErrors.internalNote);

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
        helperText={nameError}
        required
      />

      <Box>
        <RichTextEditor
          value={parseRichText(form.shortDescription ?? '')}
          onChange={(value) => {
            updateForm((f) => ({
              ...f,
              shortDescription: serializeRichText(value.segments),
            }));
            setTouched((t) => ({ ...t, shortDescription: true }));
          }}
          showFooterActions={false}
          title='Short Description'
          required
          error={Boolean(shortDescriptionError)}
        />
        {shortDescriptionError && (
          <Typography
            variant='caption'
            sx={{
              color: '#d32f2f',
              fontSize: '0.7rem',
              mt: 0.25,
              display: 'block',
              fontWeight: 600,
            }}
          >
            {shortDescriptionError}
          </Typography>
        )}
      </Box>

      <Box>
        <RichTextEditor
          value={parseRichText(form.description ?? '')}
          onChange={(value) => {
            updateForm((f) => ({
              ...f,
              description: serializeRichText(value.segments),
            }));
            setTouched((t) => ({ ...t, description: true }));
          }}
          showFooterActions={false}
          title='Description'
          required
          error={Boolean(descriptionError)}
        />
        {descriptionError && (
          <Typography
            variant='caption'
            sx={{
              color: '#d32f2f',
              fontSize: '0.7rem',
              mt: 0.25,
              display: 'block',
              fontWeight: 600,
            }}
          >
            {descriptionError}
          </Typography>
        )}
      </Box>

      <Box>
        <RichTextEditor
          value={parseRichText(form.internalNote ?? '')}
          onChange={(value) => {
            updateForm((f) => ({
              ...f,
              internalNote: serializeRichText(value.segments),
            }));
            setTouched((t) => ({ ...t, internalNote: true }));
          }}
          showFooterActions={false}
          title='Internal note'
          required
          error={Boolean(internalNoteError)}
        />
        {internalNoteError && (
          <Typography
            variant='caption'
            sx={{
              color: '#d32f2f',
              fontSize: '0.7rem',
              mt: 0.25,
              display: 'block',
              fontWeight: 600,
            }}
          >
            {internalNoteError}
          </Typography>
        )}
      </Box>
    </ConfigFormDialog>
  );
};

export default HolidayCalendarFormDialog;
