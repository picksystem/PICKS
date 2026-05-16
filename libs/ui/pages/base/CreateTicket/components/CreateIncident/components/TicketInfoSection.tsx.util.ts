export interface ClientFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
  classes: any;
}

export interface UserFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur: React.FocusEventHandler;
  error: boolean;
  errorText?: string | React.ReactNode;
  label: string;
}

export interface ContactFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export interface TicketInfoContentProps {
  ticketNumber: string;
  client: string;
  onClientChange: (value: string) => void;
  callerOptions: { value: string; label: string }[];
  classes: any;
}

export interface TicketInfoSectionProps {
  ticketNumber: string;
  callerOptions: { value: string; label: string }[];
  caller: string;
  callerTouched: boolean | undefined;
  callerError: string | undefined;
  callerFirstName: string;
  callerLastName: string;
  client: string;
  additionalContacts: string;
  manualCallerOpen: boolean;
  callerEmail: string;
  callerEmailTouched: boolean | undefined;
  callerEmailError: string | undefined;
  callerPhone: string;
  callerDepartment: string;
  callerLocation: string;
  callerReportingManager: string;
  isUpdatingCaller: boolean;
  onClientChange: (v: string) => void;
  onCallerChange: (v: string) => void;
  onCallerBlur: React.FocusEventHandler;
  onAdditionalContactsChange: (v: string) => void;
  onManualCallerToggle: () => void;
  onFieldChange: React.ChangeEventHandler<HTMLInputElement>;
  onFieldBlur: React.FocusEventHandler;
  onManualCallerUpdate: () => void;
}
