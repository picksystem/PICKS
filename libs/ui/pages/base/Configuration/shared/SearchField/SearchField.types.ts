import { SxProps, Theme } from '@mui/material/styles';

export interface DSSearchFieldProps {
  /** Controlled input value */
  value: string;
  /** Fired on every keystroke */
  onChange: (value: string) => void;
  /** Placeholder text shown when the field is empty */
  placeholder?: string;
  /** Disables the entire field */
  disabled?: boolean;
  /** Visual size of the input. Defaults to 'small'. */
  size?: 'small' | 'medium';
  /**
   * Whether the search is currently in flight (e.g. waiting for the debounce
   * to settle). Shows a small loading spinner inside the field.
   */
  isLoading?: boolean;
  /** className forwarded to the inner TextField */
  className?: string;
  /** sx forwarded to the outer Box wrapper */
  sx?: SxProps<Theme>;
}
