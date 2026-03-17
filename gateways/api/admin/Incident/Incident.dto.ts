/**
 * Incident DTO - Re-exports shared validation schemas
 * Validation logic is centralized in @picks/interfaces (using Yup)
 */
export {
  CreateIncidentSchema,
  DraftIncidentSchema,
  UpdateIncidentSchema,
  IncidentIdSchema,
  type CreateIncidentDto,
  type UpdateIncidentDto,
} from '@picks/interfaces';
