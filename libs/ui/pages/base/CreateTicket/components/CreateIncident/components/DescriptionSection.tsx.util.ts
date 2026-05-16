export interface DescriptionSectionProps {
  values: {
    shortDescription: string;
    description: string;
    isRecurring: boolean;
    isMajor: boolean;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
  onCheckboxChange: (field: string, value: boolean) => void;
  onDescriptionChange: (html: string) => void;
  onAddAttachment: (files: FileList) => void;
}
