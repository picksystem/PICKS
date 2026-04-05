import {
  IncidentChannel,
  IncidentImpact,
  IncidentStatus,
  IncidentUrgency,
  IncidentPriority,
  calculatePriority,
} from '@serviceops/interfaces';

// Dropdown options
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

export const channelOptions = [
  { value: IncidentChannel.PHONE, label: 'Phone' },
  { value: IncidentChannel.EMAIL, label: 'Email' },
  { value: IncidentChannel.PORTAL, label: 'Portal' },
  { value: IncidentChannel.CHAT, label: 'Chat' },
  { value: IncidentChannel.WALK_IN, label: 'Walk-in' },
];

// Generate random ticket number
export const generateTicketNumber = () => `INC${Math.floor(1000000 + Math.random() * 9000000)}`;

// Re-export calculatePriority for convenience
export { calculatePriority };

// Initial form values - defaults per ticket spec:
// Impact: 2-Medium, Urgency: 3-Low => Priority: 4-Low
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
