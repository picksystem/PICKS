import * as yup from 'yup';
import {
  IncidentImpact,
  IncidentUrgency,
  PriorityChangeReasonCode,
  ResolutionCode,
  IncidentStatus,
} from '../interfaces/admin/incident.interface';

/**
 * Validation schema for Priority Change
 */
export const PriorityChangeSchema = yup.object({
  newImpact: yup
    .string()
    .oneOf(Object.values(IncidentImpact), 'Invalid impact value')
    .required('New impact is required'),
  newUrgency: yup
    .string()
    .oneOf(Object.values(IncidentUrgency), 'Invalid urgency value')
    .required('New urgency is required'),
  reasonCode: yup
    .string()
    .oneOf(Object.values(PriorityChangeReasonCode), 'Invalid reason code')
    .required('Priority change reason is required'),
  note: yup
    .string()
    .required('Priority change note is required')
    .max(500, 'Note must be 500 characters or less'),
  attachment: yup.string(),
});

/**
 * Validation schema for Comment
 */
export const CommentSchema = yup.object({
  subject: yup
    .string()
    .required('Subject is required')
    .max(100, 'Subject must be 100 characters or less'),
  message: yup
    .string()
    .required('Message is required')
    .max(2000, 'Message must be 2000 characters or less'),
  isInternal: yup.boolean().default(false),
  isSelfNote: yup.boolean().default(false),
  notifyAssigneesOnly: yup.boolean().default(false),
  status: yup.string().oneOf(Object.values(IncidentStatus)),
  attachments: yup.string(),
});

/**
 * Validation schema for Time Entry
 */
export const TimeEntrySchema = yup.object({
  date: yup.string().required('Date is required'),
  hours: yup
    .number()
    .min(0, 'Hours must be 0 or more')
    .max(24, 'Hours must be 24 or less')
    .required('Hours is required'),
  minutes: yup
    .number()
    .min(0, 'Minutes must be 0 or more')
    .max(59, 'Minutes must be 59 or less')
    .required('Minutes is required'),
  billingCode: yup.string().max(50, 'Billing code must be 50 characters or less'),
  activityTask: yup.string().max(100, 'Activity/Task must be 100 characters or less'),
  externalComment: yup.string().max(1000, 'External comment must be 1000 characters or less'),
  internalComment: yup.string().max(1000, 'Internal comment must be 1000 characters or less'),
  isNonBillable: yup.boolean().default(false),
  attachments: yup.string(),
});

/**
 * Validation schema for Resolution
 */
export const ResolutionSchema = yup.object({
  application: yup.string().max(50),
  category: yup.string().max(50),
  subCategory: yup.string().max(50),
  customerConfirmation: yup.boolean().default(false),
  isRecurring: yup.boolean().default(false),
  rootCauseIdentified: yup.boolean().default(false),
  rootCause: yup.string().max(1000, 'Root cause must be 1000 characters or less'),
  resolutionCode: yup
    .string()
    .oneOf(Object.values(ResolutionCode), 'Invalid resolution code')
    .required('Resolution code is required'),
  resolution: yup
    .string()
    .required('Resolution text is required')
    .max(2000, 'Resolution must be 2000 characters or less'),
  internalNote: yup.string().max(1000, 'Internal note must be 1000 characters or less'),
  attachments: yup.string(),
});

/**
 * Validation schema for Assign Incident
 */
export const AssignSchema = yup.object({
  application: yup.string().max(50),
  assignmentGroup: yup.string().max(50),
  primaryResource: yup
    .string()
    .required('Primary resource is required')
    .max(50, 'Primary resource must be 50 characters or less'),
  secondaryResources: yup.string().max(255),
});

/**
 * TypeScript types derived from schemas
 */
export type PriorityChangeDto = yup.InferType<typeof PriorityChangeSchema>;
export type CommentDto = yup.InferType<typeof CommentSchema>;
export type TimeEntryDto = yup.InferType<typeof TimeEntrySchema>;
export type ResolutionDto = yup.InferType<typeof ResolutionSchema>;
export type AssignDto = yup.InferType<typeof AssignSchema>;
