import { useEffect, useState } from 'react';
import { SxProps, TextField, Theme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface DurationPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
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

  useEffect(() => {
    const minutes = parseToMinutes(value);
    setDraft(minutes === null ? '' : formatHHMM(minutes));
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setDraft('');
      onChange('');
      return;
    }

    if (digits.length <= 4) {
      setDraft(digits);
      if (digits.length === 4) {
        const h = Math.min(parseInt(digits.slice(0, 2), 10) || 0, MAX_HOURS);
        const m = Math.min(parseInt(digits.slice(2, 4), 10) || 0, MAX_MINUTES);
        onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
      return;
    }

    const last4 = digits.slice(-4);
    const h = Math.min(parseInt(last4.slice(0, 2), 10) || 0, MAX_HOURS);
    const m = Math.min(parseInt(last4.slice(2, 4), 10) || 0, MAX_MINUTES);
    const next = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setDraft(next);
    onChange(next);
  };

  const handleBlur = () => {
    if (!draft) {
      onChange('');
      return;
    }
    if (!draft.includes(':')) {
      const h = Math.min(parseInt(draft, 10) || 0, MAX_HOURS);
      const next = `${String(h).padStart(2, '0')}:00`;
      setDraft(next);
      onChange(next);
      return;
    }
    const match = draft.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!match) return;
    const h = Math.min(parseInt(match[1], 10) || 0, MAX_HOURS);
    const m = Math.min(parseInt(match[2], 10) || 0, MAX_MINUTES);
    const next = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setDraft(next);
    onChange(next);
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
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, ...sx }}
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
