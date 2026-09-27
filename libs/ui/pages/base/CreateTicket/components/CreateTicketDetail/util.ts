import {
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  IncidentStatus,
  IncidentChannel,
  calculatePriority,
} from '@serviceops/interfaces';

// ── Dropdown options ──────────────────────────────────────────────────────────
// impact/urgency/priority/status options are sourced dynamically per ticket type
// via the useTicketConfig hook. Channel has no config-driven equivalent, so it
// stays static here.

export const channelOptions = [
  { value: IncidentChannel.PHONE, label: 'Phone' },
  { value: IncidentChannel.EMAIL, label: 'Email' },
  { value: IncidentChannel.PORTAL, label: 'Portal' },
  { value: IncidentChannel.CHAT, label: 'Chat' },
  { value: IncidentChannel.WALK_IN, label: 'Walk-in' },
];

/** Generate a random ticket number using the type-specific prefix and digit length */
export const generateTicketNumber = (prefix: string, numberLength: number): string => {
  const digits = numberLength > 0 ? numberLength : 7;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return `${prefix}${Math.floor(min + Math.random() * (max - min + 1))}`;
};

// Re-export calculatePriority
export { calculatePriority };

// ── Initial form values ───────────────────────────────────────────────────────

export const initialValues = {
  client: '',
  caller: '',
  callerFirstName: '',
  callerLastName: '',
  callerPhone: '',
  callerEmail: '',
  callerLocation: '',
  callerDepartment: '',
  callerReportingManager: '',
  additionalContacts: '',
  isRecurring: false,
  isMajor: false,
  businessCategory: '',
  serviceLine: '',
  application: '',
  applicationCategory: '',
  applicationSubCategory: '',
  shortDescription: '',
  description: '',
  impact: IncidentImpact.MEDIUM,
  urgency: IncidentUrgency.LOW,
  priority: IncidentPriority.LOW,
  channel: IncidentChannel.PORTAL,
  status: IncidentStatus.NEW,
  assignmentGroup: '',
  primaryResource: '',
  secondaryResources: '',
  createdBy: '',
  notes: '',
  relatedRecords: '',
  attachments: '',
};

// ── Field Props Interfaces ───────────────────────────────────────────────────────

export interface ClientFieldProps {
  value: string;
  callerOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: string | React.ReactNode;
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

export interface CategoryFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}

export interface ResourceFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: string | React.ReactNode;
  label: string;
  required?: boolean;
}
