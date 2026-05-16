export interface PrioritySectionProps {
  values: {
    impact: string;
    urgency: string;
    priority: string;
    status: string;
    assignmentGroup: string;
    primaryResource: string;
    secondaryResources: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  impactOptions: { value: string; label: string }[];
  urgencyOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
  onSelectChange: (field: string, value: string) => void;
}

export interface ResourceFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}
