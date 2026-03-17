/**
 * Admin Header Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface - Core data structure
// ============================================
export interface IHeader {
  id: number;
  ticketType: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  app: string;
  order: number;
}

// ============================================
// Input Interfaces - For creating/updating
// ============================================
export interface ICreateHeaderInput {
  ticketType: string;
  key: string;
  name: string;
  description?: string;
  isActive?: boolean;
  app: string;
  order: number;
}

export interface IUpdateHeaderInput {
  ticketType?: string;
  key?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  app?: string;
  order?: number;
}

// ============================================
// Response Interfaces - API responses
// ============================================
export interface IHeaderResponse {
  message: string;
  data: IHeader;
}

export interface IHeaderListResponse {
  message: string;
  data: IHeader[];
}

export interface IDeleteResponse {
  message: string;
}

// ============================================
// Gateway Interface - Data access contract
// Used by backend for Prisma/InMemory implementations
// ============================================
export interface IHeaderGateway {
  create(data: ICreateHeaderInput): Promise<IHeader>;
  findAll(): Promise<IHeader[]>;
  findById(id: number): Promise<IHeader | null>;
  findByKey(key: string): Promise<IHeader | null>;
  findActiveByApp(app: string): Promise<IHeader[]>;
  update(id: number, data: IUpdateHeaderInput): Promise<IHeader>;
  delete(id: number): Promise<IHeader>;
}

// ============================================
// Use Case Interfaces - Business logic contracts
// Can be implemented by backend or used for typing
// ============================================
export interface ICreateHeaderUseCase {
  execute(input: ICreateHeaderInput): Promise<IHeader>;
}

export interface IGetHeaderUseCase {
  execute(id: number): Promise<IHeader>;
}

export interface IGetAllHeadersUseCase {
  execute(): Promise<IHeader[]>;
}

export interface IUpdateHeaderUseCase {
  execute(id: number, input: IUpdateHeaderInput): Promise<IHeader>;
}

export interface IDeleteHeaderUseCase {
  execute(id: number): Promise<IHeader>;
}
