import { useState, useEffect } from 'react';
import { TextField, ClickAwayListener } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface DurationPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const DurationPickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: DurationPickerFieldProps) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const parts = String(value).split(':');
      setHours(parts[0] || '');
      setMinutes(parts[1] || '');
    } else {
      setHours('');
      setMinutes('');
    }
  }, [value]);

  const handleHoursChange = (h: string) => {
    const hNum = h.replace(/\D/g, '');
    setHours(hNum);
    if (hNum && minutes) {
      onChange(`${hNum}:${minutes}`);
    } else if (hNum && !minutes) {
      onChange(`${hNum}:00`);
    } else if (!hNum && !minutes) {
      onChange('');
    }
  };

  const handleMinutesChange = (m: string) => {
    const mNum = m.replace(/\D/g, '');
    const clamped = mNum.length > 2 ? mNum.slice(0, 2) : mNum;
    setMinutes(clamped);
    if (hours && clamped) {
      const h = parseInt(hours) || 0;
      const validM = Math.min(parseInt(clamped) || 0, 59);
      setMinutes(String(validM).padStart(2, '0'));
      onChange(`${h}:${String(validM).padStart(2, '0')}`);
    } else if (!hours && clamped) {
      setHours('');
    }
  };

  const handleBlur = () => {
    if (hours) {
      const h = parseInt(hours) || 0;
      setHours(String(h));
      if (minutes) {
        const validM = Math.min(parseInt(minutes) || 0, 59);
        setMinutes(String(validM).padStart(2, '0'));
        onChange(`${h}:${String(validM).padStart(2, '0')}`);
      } else {
        onChange(`${h}:00`);
      }
    }
  };

  return (
    <ClickAwayListener onClickAway={handleBlur}>
      <TextField
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        size='small'
        fullWidth
        value={hours || minutes ? `${hours}:${minutes.padStart(2, '0')}`.replace(/:$/, ':00') : ''}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d:]/g, '');
          const match = raw.match(/^(\d*):?(\d*)/);
          if (match) {
            const [, h, m] = match;
            setHours(h);
            setMinutes(m.slice(0, 2));
            if (h || m) {
              const validH = parseInt(h) || 0;
              const validM = m ? Math.min(parseInt(m) || 0, 59) : 0;
              onChange(`${validH}:${String(validM).padStart(2, '0')}`);
            } else {
              onChange('');
            }
          }
        }}
        onBlur={handleBlur}
        placeholder='HH:MM'
        slotProps={{
          input: {
            endAdornment: (
              <AccessTimeIcon sx={{ fontSize: '1rem', color: 'action.active', mr: 0.5 }} />
            ),
          },
        }}
      />
    </ClickAwayListener>
  );
};

export default DurationPickerField;
