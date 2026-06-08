import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';

export interface DateTimePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const DateTimePickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: DateTimePickerFieldProps) => {
  const [dateTimeValue, setDateTimeValue] = useState<Dayjs | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const parsed = dayjs(value);
      setDateTimeValue(parsed.isValid() ? parsed : null);
    } else {
      setDateTimeValue(null);
    }
  }, [value]);

  const handleDateTimeChange = (newValue: Dayjs | null) => {
    setDateTimeValue(newValue);
    if (newValue) {
      onChange(newValue.format('YYYY-MM-DD HH:mm'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        value={dateTimeValue}
        onChange={handleDateTimeChange}
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

export default DateTimePickerField;