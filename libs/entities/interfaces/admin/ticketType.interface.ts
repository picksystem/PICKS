/**
 * Admin Ticket Type Interfaces
 * Shared between Frontend and Backend
 *
 * Ticket Types:
 * - Incident
 * - Service Request
 * - Change Request
 * - Problem Request
 * - Task
 * - Ticket Template
 */

// ============================================
// Enum - Available Ticket Types
// ============================================
export enum TicketTypeEnum {
  INCIDENT = 'incident',
  SERVICE_REQUEST = 'service_request',
  CHANGE_REQUEST = 'change_request',
  PROBLEM_REQUEST = 'problem_request',
  TASK = 'task',
  TICKET_TEMPLATE = 'ticket_template',
}

// ============================================
// Entity Interface - Core data structure
// ============================================
export interface ITicketType {
  id: number;
  type: string;
  name: string;
  displayName: string;
  description: string;
  prefix: string;
  isActive: boolean;
  numberLength: number;
}

// ============================================
// Input Interfaces - For creating/updating
// ============================================
export interface ICreateTicketTypeInput {
  type: string;
  name: string;
  displayName?: string;
  description?: string;
  prefix?: string;
  isActive?: boolean;
  numberLength?: number;
}

export interface IUpdateTicketTypeInput {
  type?: string;
  name?: string;
  displayName?: string;
  description?: string;
  prefix?: string;
  isActive?: boolean;
  numberLength?: number;
}

// ============================================
// Response Interfaces - API responses
// ============================================
export interface ITicketTypeResponse {
  message: string;
  data: ITicketType;
}

export interface ITicketTypeListResponse {
  message: string;
  data: ITicketType[];
}

// ============================================
// Gateway Interface - Data access contract
// Used by backend for Prisma/InMemory implementations
// ============================================
export interface ITicketTypeGateway {
  create(data: ICreateTicketTypeInput): Promise<ITicketType>;
  findAll(): Promise<ITicketType[]>;
  findById(id: number): Promise<ITicketType | null>;
  findByType(type: string): Promise<ITicketType | null>;
  update(id: number, data: IUpdateTicketTypeInput): Promise<ITicketType>;
  delete(id: number): Promise<ITicketType>;
}

// ============================================
// Use Case Interfaces - Business logic contracts
// ============================================
export interface ICreateTicketTypeUseCase {
  execute(input: ICreateTicketTypeInput): Promise<ITicketType>;
}

export interface IGetTicketTypeUseCase {
  execute(id: number): Promise<ITicketType>;
}

export interface IGetAllTicketTypesUseCase {
  execute(): Promise<ITicketType[]>;
}

export interface IUpdateTicketTypeUseCase {
  execute(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType>;
}

export interface IDeleteTicketTypeUseCase {
  execute(id: number): Promise<ITicketType>;
}
