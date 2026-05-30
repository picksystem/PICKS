export interface DSFormControlLabelProps {
  label: string | React.ReactNode;
  control: React.ReactElement;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  onChange?: (event: React.SyntheticEvent, checked: boolean) => void;
  value?: any;
  sx?: any;
}
