/**
 * User Header Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface IUserHeader {
  id: string;
  name: string;
  key: string;
  path: string;
  app: string;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateUserHeaderInput {
  name: string;
  key: string;
  path: string;
  app: string;
}

export interface IUpdateUserHeaderInput {
  name?: string;
  key?: string;
  path?: string;
  app?: string;
}

// ============================================
// Response Interfaces
// ============================================
export interface IUserHeaderResponse {
  message: string;
  data: IUserHeader;
}

export interface IUserHeaderListResponse {
  message: string;
  data: IUserHeader[];
}

// ============================================
// Gateway Interface
// ============================================
export interface IUserHeaderGateway {
  create(data: ICreateUserHeaderInput): Promise<IUserHeader>;
  findAll(): Promise<IUserHeader[]>;
  findById(id: string): Promise<IUserHeader | null>;
  update(id: string, data: IUpdateUserHeaderInput): Promise<IUserHeader>;
  delete(id: string): Promise<IUserHeader>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateUserHeaderUseCase {
  execute(input: ICreateUserHeaderInput): Promise<IUserHeader>;
}

export interface IGetUserHeaderUseCase {
  execute(id: string): Promise<IUserHeader>;
}

export interface IGetAllUserHeadersUseCase {
  execute(): Promise<IUserHeader[]>;
}

export interface IUpdateUserHeaderUseCase {
  execute(id: string, input: IUpdateUserHeaderInput): Promise<IUserHeader>;
}

export interface IDeleteUserHeaderUseCase {
  execute(id: string): Promise<IUserHeader>;
}
