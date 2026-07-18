import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';

export interface YearPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const YearPickerField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: YearPickerFieldProps) => {
  const [yearValue, setYearValue] = useState<Dayjs | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const parsed = dayjs(value);
      setYearValue(parsed.isValid() ? parsed : null);
    } else {
      setYearValue(null);
    }
  }, [value]);

  const handleYearChange = (newValue: Dayjs | null) => {
    setYearValue(newValue);
    if (newValue) {
      onChange(newValue.format('YYYY'));
    } else {
      onChange('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={['year']}
        openTo='year'
        value={yearValue}
        onChange={handleYearChange}
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

export default YearPickerField;
