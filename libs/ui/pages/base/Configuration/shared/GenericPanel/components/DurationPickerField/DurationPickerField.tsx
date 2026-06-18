import { useEffect, useRef, useState } from 'react';
import { SxProps, Theme } from '@mui/material';
import { TextField } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface DurationPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const MAX_HOURS = 99;
const MAX_MINUTES = 59;

const formatHHMM = (totalMinutes: number): string => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const parseToMinutes = (raw: string): number | null => {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  if (!v.includes(':')) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return null;
    const h = Math.min(Math.floor(n), MAX_HOURS);
    return h * 60;
  }
  const match = v.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;
  const h = Math.min(parseInt(match[1], 10) || 0, MAX_HOURS);
  const mRaw = parseInt(match[2], 10) || 0;
  const m = Math.min(mRaw, MAX_MINUTES);
  return h * 60 + m;
};

const digitsToHHMM = (digits: string): string => {
  if (!digits) return '';
  if (digits.length === 1) {
    const h = Math.min(parseInt(digits, 10) || 0, MAX_HOURS);
    return `${String(h).padStart(2, '0')}:00`;
  }
  if (digits.length === 2) {
    const h = Math.min(parseInt(digits, 10) || 0, MAX_HOURS);
    return `${String(h).padStart(2, '0')}:00`;
  }
  if (digits.length === 3) {
    const h = Math.min(parseInt(digits[0], 10) || 0, MAX_HOURS);
    const m = Math.min(parseInt(digits.slice(1, 3), 10) || 0, MAX_MINUTES);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  // 4+ digits: take the last 4 typed, treat as HH:MM.
  const last4 = digits.slice(-4);
  const h = Math.min(parseInt(last4.slice(0, 2), 10) || 0, MAX_HOURS);
  const m = Math.min(parseInt(last4.slice(2, 4), 10) || 0, MAX_MINUTES);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const DurationPickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
  sx,
}: DurationPickerFieldProps) => {
  const [draft, setDraft] = useState('');
  // Remember the last `value` we synced from so we can tell the difference
  // between (a) the parent re-initialising the field from `editingRow` and
  // (b) the parent echoing back the value we just propagated via onChange.
  // We only reformat the draft in case (a) so the user's typing isn't
  // disrupted by their own keystrokes coming back through the prop.
  const lastSyncedValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastSyncedValueRef.current === value) return;
    lastSyncedValueRef.current = value;
    const minutes = parseToMinutes(value);
    setDraft(minutes === null ? '' : formatHHMM(minutes));
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setDraft(digits);
    if (!digits) {
      onChange('');
      return;
    }
    // Propagate a best-effort formatted HH:MM value to the parent on every
    // keystroke so Save picks up the current input even if the user clicks
    // Submit before reaching 4 digits.
    const formatted = digitsToHHMM(digits);
    lastSyncedValueRef.current = formatted;
    onChange(formatted);
  };

  const handleBlur = () => {
    if (!draft) {
      onChange('');
      return;
    }
    const formatted = digitsToHHMM(draft);
    setDraft(formatted);
    lastSyncedValueRef.current = formatted;
    onChange(formatted);
  };

  return (
    <TextField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      size='small'
      fullWidth
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder='HH:MM'
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
        '& .MuiOutlinedInput-root fieldset': { borderColor: '#2d5ebb' },
        '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#2d5ebb' },
        '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#2d5ebb' },
        ...sx,
      }}
      inputProps={{ inputMode: 'numeric', maxLength: 4 }}
      slotProps={{
        input: {
          endAdornment: (
            <AccessTimeIcon sx={{ fontSize: '1rem', color: 'action.active', mr: 0.5 }} />
          ),
        },
      }}
    />
  );
};

export default DurationPickerField;
