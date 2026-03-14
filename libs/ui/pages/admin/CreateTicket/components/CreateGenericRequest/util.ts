import {
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  calculatePriority,
} from '@picks/interfaces';

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
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function generateTicketNumber(prefix: 'SRQ' | 'ADV'): string {
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${num}`;
}

export const srInitialValues = {
  number: '',
  client: '',
  caller: '',
  callerFirstName: '',
  callerLastName: '',
  callerPhone: '',
  callerEmail: '',
  callerLocation: '',
  callerDepartment: '',
  isRecurring: false,
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
  status: 'new',
  assignmentGroup: '',
  primaryResource: '',
  secondaryResources: '',
  createdBy: '',
  notes: '',
  relatedRecords: '',
  attachments: '',
};

export { calculatePriority };
