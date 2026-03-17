import * as yup from 'yup';
import {
  IncidentImpact,
  IncidentUrgency,
  IncidentChannel,
  IncidentStatus,
} from '../interfaces/admin/incident.interface';

/**
 * Shared validation schema for Incident
 * Used by Frontend (Formik) with native validationSchema support
 */
export const CreateIncidentSchema = yup.object({
  number: yup
    .string()
    .matches(/^INC\d{7}$/, 'Invalid ticket number format')
    .max(16),
  client: yup.string().max(50, 'Client must be 50 characters or less'),
  caller: yup
    .string()
    .required('Caller is required')
    .max(25, 'Caller must be 25 characters or less'),
  callerPhone: yup.string().max(25, 'Phone must be 25 characters or less'),
  callerEmail: yup
    .string()
    .max(25, 'Email must be 25 characters or less')
    .email('Invalid email format'),
  callerLocation: yup.string().max(25, 'Location must be 25 characters or less'),
  callerDepartment: yup.string().max(25, 'Department must be 25 characters or less'),
  additionalContacts: yup.string().max(255, 'Additional contacts must be 255 characters or less'),
  businessCategory: yup
    .string()
    .required('Business Category is required')
    .max(25, 'Business Category must be 25 characters or less'),
  serviceLine: yup
    .string()
    .required('Service Line is required')
    .max(25, 'Service Line must be 25 characters or less'),
  application: yup
    .string()
    .required('Application is required')
    .max(25, 'Application must be 25 characters or less'),
  applicationCategory: yup.string().max(50, 'Application Category must be 50 characters or less'),
  applicationSubCategory: yup
    .string()
    .max(50, 'Application Sub-category must be 50 characters or less'),
  shortDescription: yup
    .string()
    .required('Short description is required')
    .max(60, 'Short description must be 60 characters or less'),
  description: yup
    .string()
    .required('Description is required')
    .max(255, 'Description must be 255 characters or less'),
  impact: yup
    .string()
    .oneOf(Object.values(IncidentImpact), 'Impact is required')
    .required('Impact is required'),
  urgency: yup
    .string()
    .oneOf(Object.values(IncidentUrgency), 'Urgency is required')
    .required('Urgency is required'),
  priority: yup.string().max(25).default('4-Low'),
  channel: yup
    .string()
    .oneOf(Object.values(IncidentChannel), 'Channel is required')
    .required('Channel is required'),
  status: yup.string().oneOf(Object.values(IncidentStatus)).default(IncidentStatus.NEW),
  assignmentGroup: yup
    .string()
    .required('Assignment Group is required')
    .max(25, 'Assignment Group must be 25 characters or less'),
  primaryResource: yup.string().max(25, 'Primary Resource must be 25 characters or less'),
  secondaryResources: yup.string().max(25, 'Secondary Resources must be 25 characters or less'),
  createdBy: yup
    .string()
    .required('Created by is required')
    .max(25, 'Created by must be 25 characters or less'),
  isRecurring: yup.boolean().default(false),
  isMajor: yup.boolean().default(false),
  isReleaseManagement: yup.boolean().default(false),
  eta: yup.string(),
  notes: yup.string(),
  relatedRecords: yup.string(),
  attachments: yup.string(),
  followers: yup.string(),
  internalFollowers: yup.string(),
  draftExpiresAt: yup.string(),
});

/**
 * Schema for saving an Incident as draft (only caller and createdBy required)
 */
export const DraftIncidentSchema = yup.object({
  number: yup
    .string()
    .matches(/^INC\d{7}$/, 'Invalid ticket number format')
    .max(16),
  client: yup.string().max(50),
  caller: yup
    .string()
    .required('Caller is required')
    .max(25, 'Caller must be 25 characters or less'),
  callerPhone: yup.string().max(25),
  callerEmail: yup.string().max(25).email('Invalid email format'),
  callerLocation: yup.string().max(25),
  callerDepartment: yup.string().max(25),
  additionalContacts: yup.string().max(255),
  businessCategory: yup.string().max(25),
  serviceLine: yup.string().max(25),
  application: yup.string().max(25),
  applicationCategory: yup.string().max(50),
  applicationSubCategory: yup.string().max(50),
  shortDescription: yup.string().max(60),
  description: yup.string().max(255),
  impact: yup.string().oneOf(Object.values(IncidentImpact)),
  urgency: yup.string().oneOf(Object.values(IncidentUrgency)),
  priority: yup.string().max(25).default('4-Low'),
  channel: yup.string().oneOf(Object.values(IncidentChannel)),
  status: yup.string().oneOf(Object.values(IncidentStatus)).default(IncidentStatus.DRAFT),
  assignmentGroup: yup.string().max(25),
  primaryResource: yup.string().max(25),
  secondaryResources: yup.string().max(25),
  createdBy: yup.string().required('Created by is required').max(25),
  isRecurring: yup.boolean().default(false),
  isMajor: yup.boolean().default(false),
  isReleaseManagement: yup.boolean().default(false),
  eta: yup.string(),
  notes: yup.string(),
  relatedRecords: yup.string(),
  attachments: yup.string(),
  followers: yup.string(),
  internalFollowers: yup.string(),
  draftExpiresAt: yup.string(),
});

/**
 * Schema for updating an Incident entry (all fields optional)
 * Explicit schema to avoid oneOf fields rejecting undefined when derived via notRequired()
 */
export const UpdateIncidentSchema = yup.object({
  number: yup
    .string()
    .matches(/^INC\d{7}$/, 'Invalid ticket number format')
    .max(16),
  client: yup.string().max(200),
  caller: yup.string().max(100),
  callerPhone: yup.string().max(50),
  callerEmail: yup
    .string()
    .max(100)
    .email('Invalid email format')
    .when((val, schema) => (val ? schema : schema.optional())),
  callerLocation: yup.string().max(100),
  callerDepartment: yup.string().max(100),
  additionalContacts: yup.string(),
  businessCategory: yup.string().max(100),
  serviceLine: yup.string().max(100),
  application: yup.string().max(100),
  applicationCategory: yup.string().max(200),
  applicationSubCategory: yup.string().max(200),
  shortDescription: yup.string().max(500),
  description: yup.string(),
  impact: yup
    .string()
    .oneOf([...Object.values(IncidentImpact), undefined as unknown as string])
    .optional(),
  urgency: yup
    .string()
    .oneOf([...Object.values(IncidentUrgency), undefined as unknown as string])
    .optional(),
  priority: yup.string().max(50),
  channel: yup
    .string()
    .oneOf([...Object.values(IncidentChannel), undefined as unknown as string])
    .optional(),
  status: yup
    .string()
    .oneOf([...Object.values(IncidentStatus), undefined as unknown as string])
    .optional(),
  assignmentGroup: yup.string().max(200),
  primaryResource: yup.string().max(200),
  secondaryResources: yup.string().max(500),
  createdBy: yup.string().max(100),
  isRecurring: yup.boolean(),
  isMajor: yup.boolean(),
  isReleaseManagement: yup.boolean(),
  eta: yup.string(),
  notes: yup.string(),
  relatedRecords: yup.string(),
  attachments: yup.string(),
  followers: yup.string(),
  internalFollowers: yup.string(),
  draftExpiresAt: yup.string(),
});

/**
 * Schema for validating Incident ID parameter (integer)
 */
export const IncidentIdSchema = yup.object({
  id: yup.number().integer().positive('Invalid ID').required(),
});

/**
 * TypeScript types derived from schemas
 */
export type CreateIncidentDto = yup.InferType<typeof CreateIncidentSchema>;
export type UpdateIncidentDto = Partial<CreateIncidentDto>;
