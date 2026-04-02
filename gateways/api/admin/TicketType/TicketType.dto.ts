/**
 * TicketType DTO - Re-exports shared validation schemas
 * Validation logic is centralized in @serviceops/interfaces (using Yup)
 */
export {
  CreateTicketTypeSchema,
  UpdateTicketTypeSchema,
  TicketTypeIdSchema,
  type CreateTicketTypeDto,
  type UpdateTicketTypeDto,
  type TicketTypeResponseDto,
} from '@serviceops/interfaces';
