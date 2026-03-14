import {
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  IncidentStatus,
  IncidentChannel,
  ServiceRequestStatus,
  calculatePriority,
} from '@picks/interfaces';

// ── Ticket-type config ────────────────────────────────────────────────────────

export interface TicketTypeConfig {
  title: string;
  prefix: string;
  subtitle: string;
  heroGradient: string;
  heroShadow: string;
  /** Whether the form should show incident-specific fields */
  showAdditionalContacts: boolean;
  showIsMajor: boolean;
  showChannel: boolean;
}

export const TICKET_CONFIG: Record<string, TicketTypeConfig> = {
  incident: {
    title: 'Create Incident',
    prefix: 'INC',
    subtitle: 'Fill in the details below to log a new incident',
    heroGradient: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 50%, #c62828 100%)',
    heroShadow: 'rgba(183,28,28,0.35)',
    showAdditionalContacts: true,
    showIsMajor: true,
    showChannel: true,
  },
  service_request: {
    title: 'Create Service Request',
    prefix: 'SRQ',
    subtitle: 'Fill in the details below to log a new service request',
    heroGradient: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #1565c0 100%)',
    heroShadow: 'rgba(21,101,192,0.35)',
    showAdditionalContacts: false,
    showIsMajor: false,
    showChannel: false,
  },
  advisory_request: {
    title: 'Create Advisory Request',
    prefix: 'ADV',
    subtitle: 'Fill in the details below to log a new advisory request',
    heroGradient: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #006064 100%)',
    heroShadow: 'rgba(0,131,143,0.35)',
    showAdditionalContacts: false,
    showIsMajor: false,
    showChannel: false,
  },
};

export const getTicketConfig = (ticketType: string): TicketTypeConfig =>
  TICKET_CONFIG[ticketType] ?? TICKET_CONFIG['incident'];

// ── Dropdown options ──────────────────────────────────────────────────────────

export const impactOptions = [
  { value: IncidentImpact.HIGH, label: '1 - High' },
  { value: IncidentImpact.MEDIUM, label: '2 - Medium' },
  { value: IncidentImpact.LOW, label: '3 - Low' },
];

export const urgencyOptions = [
  { value: IncidentUrgency.HIGH, label: '1 - High' },
  { value: IncidentUrgency.MEDIUM, label: '2 - Medium' },
  { value: IncidentUrgency.LOW, label: '3 - Low' },
];

export const priorityOptions = [
  { value: IncidentPriority.CRITICAL, label: '1 - Critical' },
  { value: IncidentPriority.HIGH, label: '2 - High' },
  { value: IncidentPriority.MEDIUM, label: '3 - Medium' },
  { value: IncidentPriority.LOW, label: '4 - Low' },
  { value: IncidentPriority.PLANNING, label: '5 - Planning' },
];

export const statusOptions = [
  { value: IncidentStatus.NEW, label: 'New' },
  { value: IncidentStatus.IN_PROGRESS, label: 'In Progress' },
  { value: IncidentStatus.ON_HOLD, label: 'On Hold' },
  { value: IncidentStatus.ASSIGNED, label: 'Assigned' },
  { value: IncidentStatus.RESOLVED, label: 'Resolved' },
  { value: IncidentStatus.CLOSED, label: 'Closed' },
  { value: IncidentStatus.CANCELLED, label: 'Cancelled' },
];

export const serviceRequestStatusOptions = [
  { value: ServiceRequestStatus.NEW, label: 'New' },
  { value: ServiceRequestStatus.IN_PROGRESS, label: 'In Progress' },
  { value: ServiceRequestStatus.ON_HOLD, label: 'On Hold' },
  { value: ServiceRequestStatus.ASSIGNED, label: 'Assigned' },
  { value: ServiceRequestStatus.RESOLVED, label: 'Resolved' },
  { value: ServiceRequestStatus.CLOSED, label: 'Closed' },
  { value: ServiceRequestStatus.CANCELLED, label: 'Cancelled' },
];

export const channelOptions = [
  { value: IncidentChannel.PHONE, label: 'Phone' },
  { value: IncidentChannel.EMAIL, label: 'Email' },
  { value: IncidentChannel.PORTAL, label: 'Portal' },
  { value: IncidentChannel.CHAT, label: 'Chat' },
  { value: IncidentChannel.WALK_IN, label: 'Walk-in' },
];

/** Generate a random ticket number using the type-specific prefix */
export const generateTicketNumber = (prefix: string): string =>
  `${prefix}${Math.floor(1000000 + Math.random() * 9000000)}`;

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
  channel: IncidentChannel.PHONE,
  status: IncidentStatus.NEW,
  assignmentGroup: '',
  primaryResource: '',
  secondaryResources: '',
  createdBy: '',
  notes: '',
  relatedRecords: '',
  attachments: '',
};
