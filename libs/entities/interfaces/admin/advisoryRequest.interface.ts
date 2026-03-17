/**
 * Admin Advisory Request Interfaces
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
// Advisory Request Status Enum
// ============================================
export enum AdvisoryRequestStatus {
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
export interface IAdvisoryRequest {
  id: number;
  number: string; // Alphanumeric ticket number (e.g., ADV0001234)
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
  status: AdvisoryRequestStatus;
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
export interface ICreateAdvisoryRequestInput {
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
  status?: AdvisoryRequestStatus;
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

export interface IUpdateAdvisoryRequestInput {
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
  status?: AdvisoryRequestStatus;
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
export interface IAdvisoryRequestResponse {
  message: string;
  data: IAdvisoryRequest;
}

export interface IAdvisoryRequestListResponse {
  message: string;
  data: IAdvisoryRequest[];
}

// ============================================
// Gateway Interface - Data access contract
// ============================================
export interface IAdvisoryRequestGateway {
  create(data: ICreateAdvisoryRequestInput & { number: string }): Promise<IAdvisoryRequest>;
  findAll(): Promise<IAdvisoryRequest[]>;
  findById(id: number): Promise<IAdvisoryRequest | null>;
  findByNumber(number: string): Promise<IAdvisoryRequest | null>;
  findByStatus(status: AdvisoryRequestStatus): Promise<IAdvisoryRequest[]>;
  update(id: number, data: IUpdateAdvisoryRequestInput): Promise<IAdvisoryRequest>;
  delete(id: number): Promise<IAdvisoryRequest>;
  getNextNumber(): Promise<string>;
  deleteExpiredDrafts(): Promise<number>;
}

// ============================================
// Use Case Interfaces - Business logic contracts
// ============================================
export interface ICreateAdvisoryRequestUseCase {
  execute(input: ICreateAdvisoryRequestInput): Promise<IAdvisoryRequest>;
}

export interface IGetAdvisoryRequestUseCase {
  execute(id: number): Promise<IAdvisoryRequest>;
}

export interface IGetAllAdvisoryRequestsUseCase {
  execute(): Promise<IAdvisoryRequest[]>;
}

export interface IUpdateAdvisoryRequestUseCase {
  execute(id: number, input: IUpdateAdvisoryRequestInput): Promise<IAdvisoryRequest>;
}

export interface IDeleteAdvisoryRequestUseCase {
  execute(id: number): Promise<IAdvisoryRequest>;
}
