import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';

export interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const DatePickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: DatePickerFieldProps) => {
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (value) {
      const parsed = dayjs(value);
      setDateValue(parsed.isValid() ? parsed : null);
    } else {
      setDateValue(null);
    }
  }, [value]);

  const handleDateChange = (newValue: Dayjs | null) => {
    setDateValue(newValue);
    if (newValue) {
      onChange(newValue.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dateValue}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            label,
            required,
            error,
            helperText,
            size: 'small',
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
