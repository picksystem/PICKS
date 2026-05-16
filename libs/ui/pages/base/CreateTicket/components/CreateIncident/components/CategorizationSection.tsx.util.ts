export interface CategorizationSectionProps {
  values: {
    businessCategory: string;
    serviceLine: string;
    application: string;
    applicationCategory: string;
    applicationSubCategory: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
}

export interface CategoryFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}
