import { ITicketType, TicketTypeEnum } from '@serviceops/interfaces';

/**
 * Ticket Type Mock Data
 * Uses shared interfaces from @serviceops/interfaces
 * Same types used by Frontend and Backend
 */

export { TicketTypeEnum };

// ============================================
// Single Ticket Type Mocks
// ============================================

export const mockIncident: ITicketType = {
  id: 1,
  type: TicketTypeEnum.INCIDENT,
  name: 'Incident',
  displayName: 'Incident',
  description: 'An unplanned interruption or reduction in quality of an IT service',
  prefix: 'INC',
  isActive: true,
  numberLength: 7,
  displayOrder: 1,
};

export const mockServiceRequest: ITicketType = {
  id: 2,
  type: TicketTypeEnum.SERVICE_REQUEST,
  name: 'Service Request',
  displayName: 'Service Request',
  description: 'A formal request for a new service or change to an existing service',
  prefix: 'SR',
  isActive: true,
  numberLength: 7,
  displayOrder: 2,
};

export const mockChangeRequest: ITicketType = {
  id: 3,
  type: TicketTypeEnum.CHANGE_REQUEST,
  name: 'Change Request',
  displayName: 'Change Request',
  description: 'A request to modify an IT service or component',
  prefix: 'CR',
  isActive: true,
  numberLength: 7,
  displayOrder: 3,
};

export const mockProblemRequest: ITicketType = {
  id: 4,
  type: TicketTypeEnum.PROBLEM_REQUEST,
  name: 'Problem Request',
  displayName: 'Problem Request',
  description: 'The underlying cause of one or more incidents',
  prefix: 'PR',
  isActive: true,
  numberLength: 7,
  displayOrder: 4,
};

export const mockTask: ITicketType = {
  id: 5,
  type: TicketTypeEnum.TASK,
  name: 'Task',
  displayName: 'Task',
  description: 'A unit of work assigned to a team or individual',
  prefix: 'TASK',
  isActive: true,
  numberLength: 7,
  displayOrder: 5,
};

export const mockTicketTemplate: ITicketType = {
  id: 6,
  type: TicketTypeEnum.TICKET_TEMPLATE,
  name: 'Ticket Template',
  displayName: 'Ticket Template',
  description: 'A reusable template for creating tickets',
  prefix: 'TT',
  isActive: true,
  numberLength: 7,
  displayOrder: 6,
};

// ============================================
// List Mocks
// ============================================

export const mockTicketTypesEmpty: ITicketType[] = [];

export const mockTicketTypesAll: ITicketType[] = [
  mockIncident,
  mockServiceRequest,
  mockChangeRequest,
  mockProblemRequest,
  mockTask,
  mockTicketTemplate,
];
