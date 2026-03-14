import { ITicketType, TicketTypeEnum } from '@picks/interfaces';

/**
 * Ticket Type Mock Data
 * Uses shared interfaces from @picks/interfaces
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
};

export const mockServiceRequest: ITicketType = {
  id: 2,
  type: TicketTypeEnum.SERVICE_REQUEST,
  name: 'Service Request',
};

export const mockChangeRequest: ITicketType = {
  id: 3,
  type: TicketTypeEnum.CHANGE_REQUEST,
  name: 'Change Request',
};

export const mockProblemRequest: ITicketType = {
  id: 4,
  type: TicketTypeEnum.PROBLEM_REQUEST,
  name: 'Problem Request',
};

export const mockTask: ITicketType = {
  id: 5,
  type: TicketTypeEnum.TASK,
  name: 'Task',
};

export const mockTicketTemplate: ITicketType = {
  id: 6,
  type: TicketTypeEnum.TICKET_TEMPLATE,
  name: 'Ticket Template',
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
