/**
 * Admin Service Request Interfaces
 * Shared between Frontend and Backend
 */

import {
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  calculatePriority,
} from './incident.interface';

// Re-export shared enums for convenience
export { IncidentImpact, IncidentUrgency, IncidentPriority, calculatePriority };

// ============================================
// Service Request Status Enum
// ============================================
export enum ServiceRequestStatus {
  DRAFT = 'draft',
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  ASSIGNED = 'assigned',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

// ============================================
// Entity Interface - Core data structure
// ============================================
export interface IServiceRequest {
  id: number;
  number: string; // Alphanumeric ticket number (e.g., SRQ0001234)
  client: string | null;
  caller: string;
  callerPhone: string | null;
  callerEmail: string | null;
  callerLocation: string | null;
  callerDepartment: string | null;
  businessCategory: string | null;
  serviceLine: string | null;
  application: string | null;
  applicationCategory: string | null;
  applicationSubCategory: string | null;
  shortDescription: string | null;
  description: string | null;
  impact: IncidentImpact | null;
  urgency: IncidentUrgency | null;
  priority: string | null;
  status: ServiceRequestStatus;
  assignmentGroup: string | null;
  primaryResource: string | null;
  secondaryResources: string | null;
  createdAt: Date;
  createdBy: string;
  isRecurring: boolean;
  isReleaseManagement: boolean;
  eta: Date | null;
  notes: string | null;
  relatedRecords: string | null; // JSON string for related records
  attachments: string | null; // JSON string for attachments
  followers: string | null; // JSON string array of user emails
  internalFollowers: string | null; // JSON string array of user emails
  draftExpiresAt: Date | null;
  // Contact & Billing
  clientPrimaryContact: string | null;
  billingCode: string | null;
  approvedEstimatesHours: number | null;
  estimatesDetails: string | null;
  // Reporting
  analysisSummary: string | null;
  ticketSource: string | null;
  // Audit timestamps (system-set)
  resolvedAt: Date | null;
  resolvedBy: string | null;
  closedAt: Date | null;
  closedBy: string | null;
  reopenedAt: Date | null;
  reopenedBy: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  updatedAt: Date;
}

// ============================================
// Input Interfaces - For creating/updating
// ============================================
export interface ICreateServiceRequestInput {
  number?: string; // Optional - if provided, use this; otherwise generate
  client?: string;
  caller: string;
  callerPhone?: string;
  callerEmail?: string;
  callerLocation?: string;
  callerDepartment?: string;
  businessCategory?: string;
  serviceLine?: string;
  application?: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  shortDescription?: string;
  description?: string;
  impact?: IncidentImpact;
  urgency?: IncidentUrgency;
  priority?: string;
  status?: ServiceRequestStatus;
  assignmentGroup?: string;
  primaryResource?: string;
  secondaryResources?: string;
  createdBy: string;
  isRecurring?: boolean;
  isReleaseManagement?: boolean;
  eta?: string;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  followers?: string;
  internalFollowers?: string;
  draftExpiresAt?: string;
  // Contact & Billing
  clientPrimaryContact?: string;
  billingCode?: string;
  approvedEstimatesHours?: number;
  estimatesDetails?: string;
  // Reporting
  analysisSummary?: string;
  ticketSource?: string;
}

export interface IUpdateServiceRequestInput {
  client?: string;
  caller?: string;
  callerPhone?: string;
  callerEmail?: string;
  callerLocation?: string;
  callerDepartment?: string;
  businessCategory?: string;
  serviceLine?: string;
  application?: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  shortDescription?: string;
  description?: string;
  impact?: IncidentImpact;
  urgency?: IncidentUrgency;
  priority?: string;
  status?: ServiceRequestStatus;
  assignmentGroup?: string;
  primaryResource?: string;
  secondaryResources?: string;
  isRecurring?: boolean;
  isReleaseManagement?: boolean;
  eta?: string;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  followers?: string;
  internalFollowers?: string;
  // Contact & Billing
  clientPrimaryContact?: string;
  billingCode?: string;
  approvedEstimatesHours?: number;
  estimatesDetails?: string;
  // Reporting
  analysisSummary?: string;
  ticketSource?: string;
}

// ============================================
// Response Interfaces - API responses
// ============================================
export interface IServiceRequestResponse {
  message: string;
  data: IServiceRequest;
}

export interface IServiceRequestListResponse {
  message: string;
  data: IServiceRequest[];
}

// ============================================
// Gateway Interface - Data access contract
// ============================================
export interface IServiceRequestGateway {
  create(data: ICreateServiceRequestInput & { number: string }): Promise<IServiceRequest>;
  findAll(): Promise<IServiceRequest[]>;
  findById(id: number): Promise<IServiceRequest | null>;
  findByNumber(number: string): Promise<IServiceRequest | null>;
  findByStatus(status: ServiceRequestStatus): Promise<IServiceRequest[]>;
  update(id: number, data: IUpdateServiceRequestInput): Promise<IServiceRequest>;
  delete(id: number): Promise<IServiceRequest>;
  getNextNumber(): Promise<string>;
  deleteExpiredDrafts(): Promise<number>;
}

// ============================================
// Use Case Interfaces - Business logic contracts
// ============================================
export interface ICreateServiceRequestUseCase {
  execute(input: ICreateServiceRequestInput): Promise<IServiceRequest>;
}

export interface IGetServiceRequestUseCase {
  execute(id: number): Promise<IServiceRequest>;
}

export interface IGetAllServiceRequestsUseCase {
  execute(): Promise<IServiceRequest[]>;
}

export interface IUpdateServiceRequestUseCase {
  execute(id: number, input: IUpdateServiceRequestInput): Promise<IServiceRequest>;
}

export interface IDeleteServiceRequestUseCase {
  execute(id: number): Promise<IServiceRequest>;
}
