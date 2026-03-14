/**
 * User NotFound Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface IUserNotFound {
  id: string;
  name: string;
  age: number;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateUserNotFoundInput {
  name: string;
  age: number;
}

export interface IUpdateUserNotFoundInput {
  name?: string;
  age?: number;
}

// ============================================
// Response Interfaces
// ============================================
export interface IUserNotFoundResponse {
  message: string;
  data: IUserNotFound;
}

export interface IUserNotFoundListResponse {
  message: string;
  data: IUserNotFound[];
}

// ============================================
// Gateway Interface
// ============================================
export interface IUserNotFoundGateway {
  create(data: ICreateUserNotFoundInput): Promise<IUserNotFound>;
  findAll(): Promise<IUserNotFound[]>;
  findById(id: string): Promise<IUserNotFound | null>;
  update(id: string, data: IUpdateUserNotFoundInput): Promise<IUserNotFound>;
  delete(id: string): Promise<IUserNotFound>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateUserNotFoundUseCase {
  execute(input: ICreateUserNotFoundInput): Promise<IUserNotFound>;
}

export interface IGetUserNotFoundUseCase {
  execute(id: string): Promise<IUserNotFound>;
}

export interface IGetAllUserNotFoundsUseCase {
  execute(): Promise<IUserNotFound[]>;
}

export interface IUpdateUserNotFoundUseCase {
  execute(id: string, input: IUpdateUserNotFoundInput): Promise<IUserNotFound>;
}

export interface IDeleteUserNotFoundUseCase {
  execute(id: string): Promise<IUserNotFound>;
}
