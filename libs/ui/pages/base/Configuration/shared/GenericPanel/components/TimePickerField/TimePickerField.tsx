import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useState, useEffect } from 'react';

dayjs.extend(customParseFormat);

export interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const TimePickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: TimePickerFieldProps) => {
  const [timeValue, setTimeValue] = useState<Dayjs | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const parsed = dayjs(value, 'HH:mm', true);
      setTimeValue(parsed.isValid() ? parsed : null);
    } else {
      setTimeValue(null);
    }
  }, [value]);

  const handleTimeChange = (newValue: Dayjs | null) => {
    setTimeValue(newValue);
    if (newValue) {
      onChange(newValue.format('HH:mm'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        value={timeValue}
        onChange={handleTimeChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            label,
            required,
            error,
            helperText,
            size: 'small',
            fullWidth: true,
            onClick: () => setOpen(true),
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default TimePickerField;
