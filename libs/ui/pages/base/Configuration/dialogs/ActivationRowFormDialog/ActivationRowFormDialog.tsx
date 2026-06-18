import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
} from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNotification } from '@serviceops/hooks';
import { ActivationRowFormDialogProps } from './util';
import { ConfigFormDialog } from '../ConfigDialogs/ConfigDialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { validateActivationRowDuplicate } from '../../sections/SLAs/components/shared/textUtils';

const ActivationRowFormDialog = ({
  open,
  title,
  editingRow,
  ticketTypes,
  usedTicketTypeIds,
  idPrefix,
  rows,
  onClose,
  onSubmit,
}: ActivationRowFormDialogProps) => {
  const { success } = useNotification();
  const [ticketTypeId, setTicketTypeId] = useState(0);
  const [ticketTypeName, setTicketTypeName] = useState('');
  const [activation, setActivation] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Mirror of the rich-text fields so handleSubmit can read the latest typed
  // value (RichTextEditor only fires onChange on blur).
  const formRef = useRef({ shortDescription: '', internalNote: '' });

  useEffect(() => {
    if (editingRow) {
      setTicketTypeId(editingRow.ticketTypeId);
      setTicketTypeName(editingRow.ticketTypeName);
      setActivation(editingRow.activation);
      setShortDescription(editingRow.shortDescription ?? '');
      setInternalNote(editingRow.internalNote ?? '');
      formRef.current = {
        shortDescription: editingRow.shortDescription ?? '',
        internalNote: editingRow.internalNote ?? '',
      };
    } else {
      setTicketTypeId(0);
      setTicketTypeName('');
      setActivation(true);
      setShortDescription('');
      setInternalNote('');
      formRef.current = { shortDescription: '', internalNote: '' };
    }
    setDuplicateAlert(null);
  }, [editingRow, open]);

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit.
  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    const message = validateActivationRowDuplicate(
      {
        ticketTypeId,
        shortDescription: formRef.current.shortDescription,
      },
      rows,
      editingRow?.id ?? null,
    );
    setDuplicateAlert(message);
  }, [ticketTypeId, shortDescription, open, rows, editingRow]);

  const availableTicketTypes = ticketTypes.filter(
    (tt) => !usedTicketTypeIds.includes(tt.id) || tt.id === editingRow?.ticketTypeId,
  );

  const handleTicketTypeChange = (id: number) => {
    const tt = ticketTypes.find((t) => t.id === id);
    setTicketTypeId(id);
    setTicketTypeName(tt?.name ?? tt?.displayName ?? '');
  };

  const handleSubmit = () => {
    if (!ticketTypeId) return;
    const message = validateActivationRowDuplicate(
      {
        ticketTypeId,
        shortDescription: formRef.current.shortDescription,
      },
      rows,
      editingRow?.id ?? null,
    );
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSubmit({
      id: editingRow?.id ?? `${idPrefix}_${Date.now()}`,
      ticketTypeId,
      ticketTypeName,
      activation,
      shortDescription: formRef.current.shortDescription,
      internalNote: formRef.current.internalNote,
    });
    success(`${title} saved successfully`);
  };

  const isEditing = editingRow !== null;

  const handleShortDescriptionChange = useCallback(
    (value: {
      segments: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[];
    }) => {
      const serialized = serializeRichText(value.segments);
      setShortDescription(serialized);
      formRef.current = { ...formRef.current, shortDescription: serialized };
    },
    [],
  );

  const handleInternalNoteChange = useCallback(
    (value: {
      segments: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[];
    }) => {
      const serialized = serializeRichText(value.segments);
      setInternalNote(serialized);
      formRef.current = { ...formRef.current, internalNote: serialized };
    },
    [],
  );

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditing}
      icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#b45309'
      title={title}
      subtitle='Configure ticket type activation for this feature'
      submitDisabled={!ticketTypeId || Boolean(duplicateAlert)}
      submitLabel={isEditing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Ticket Type and Short Description must be unique. The Alert is
          the only signal; no per-field red borders for duplicates. */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {isEditing ? (
        <TextField label='Ticket Type' value={ticketTypeName} disabled size='small' fullWidth />
      ) : (
        <FormControl size='small' fullWidth required>
          <InputLabel>Ticket Type</InputLabel>
          <Select
            label='Ticket Type'
            value={ticketTypeId || ''}
            onChange={(e) => handleTicketTypeChange(Number(e.target.value))}
          >
            {availableTicketTypes.map((tt) => (
              <MenuItem key={tt.id} value={tt.id}>
                {tt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={activation}
            onChange={(e) => setActivation(e.target.checked)}
            color='primary'
          />
        }
        label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activation</Typography>}
      />

      <Box>
        <RichTextEditor
          value={parseRichText(shortDescription)}
          onChange={handleShortDescriptionChange}
          showFooterActions={false}
          title='Short Description'
        />
      </Box>

      <Box>
        <RichTextEditor
          value={parseRichText(internalNote)}
          onChange={handleInternalNoteChange}
          showFooterActions={false}
          title='Internal note'
        />
      </Box>
    </ConfigFormDialog>
  );
};

export default ActivationRowFormDialog;
