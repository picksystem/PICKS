import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useStyles } from './styles';
import { DSDatePickerProps } from './DatePicker.types';
import { useState, useEffect } from 'react';

const DatePickerWrapper: React.FC<DSDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  label,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  sx,
  onBlur,
  onFocus,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const [dayjsValue, setDayjsValue] = useState<Dayjs | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const d = typeof value === 'string' ? dayjs(value) : dayjs(value);
      setDayjsValue(d.isValid() ? d : null);
    } else {
      setDayjsValue(null);
    }
  }, [value]);

  const handleChange = (newValue: Dayjs | null) => {
    setDayjsValue(newValue);
    if (newValue) {
      onChange?.(newValue.format('YYYY-MM-DD'));
    } else {
      onChange?.('');
    }
  };

  let minDayjs: Dayjs | undefined;
  if (minDate) {
    const d = dayjs(minDate);
    if (d.isValid()) minDayjs = d;
  }
  let maxDayjs: Dayjs | undefined;
  if (maxDate) {
    const d = dayjs(maxDate);
    if (d.isValid()) maxDayjs = d;
  }

  const muiTextFieldProps = {
    label,
    required,
    error,
    helperText,
    size,
    fullWidth,
    disabled,
    variant,
    placeholder,
    InputLabelProps: { shrink: true },
    sx: { mb: 0 },
    ...rest,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dayjsValue}
        onChange={handleChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        minDate={minDayjs}
        maxDate={maxDayjs}
        disabled={disabled}
        slotProps={{
          textField: {
            ...muiTextFieldProps,
            className: cx(classes.root, className),
            sx: {
              width: '100%',
              // MUI X v8 uses its own PickersOutlinedInput (not standard MUI OutlinedInput)
              '& .MuiPickersOutlinedInput-root': {
                borderRadius: '8px',
                '& .MuiPickersOutlinedInput-notchedOutline': {
                  borderRadius: '8px',
                },
              },
              // Fallback for any other input variant
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
              ...sx,
            },
            onBlur,
            onFocus,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerWrapper;
