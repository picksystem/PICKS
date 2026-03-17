import { TextField } from '@mui/material';
import { useStyles } from './styles';

export interface DSReadOnlyFieldProps {
  label?: string;
  value?: string | number | readonly string[];
  variant?: 'standard' | 'outlined' | 'filled';
  className?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  helperText?: string;
  placeholder?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
  copyButtonText?: string;
}

const ReadOnlyField: React.FC<DSReadOnlyFieldProps> = ({
  label,
  value,
  variant = 'outlined',
  className,
  size = 'medium',
  fullWidth = true,
  multiline = false,
  rows,
  maxRows,
  helperText,
  placeholder,
  showCopyButton = false,
  onCopy,
  copyButtonText = 'Copy',
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(String(value));
      onCopy?.();
    }
  };

  return (
    <TextField
      label={label}
      value={value || ''}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      helperText={helperText}
      placeholder={placeholder}
      InputProps={{
        readOnly: true,
        endAdornment: showCopyButton ? (
          <button
            type='button'
            onClick={handleCopy}
            className={classes.copyButton}
            title={copyButtonText}
          >
            📋
          </button>
        ) : undefined,
      }}
      className={cx(classes.root, className)}
      {...rest}
    />
  );
};

export default ReadOnlyField;
