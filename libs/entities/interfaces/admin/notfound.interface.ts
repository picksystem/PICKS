/**
 * Admin NotFound Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface INotFound {
  id: string;
  name: string;
  age: number;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateNotFoundInput {
  name: string;
  age: number;
}

export interface IUpdateNotFoundInput {
  name?: string;
  age?: number;
}

// ============================================
// Response Interfaces
// ============================================
export interface INotFoundResponse {
  message: string;
  data: INotFound;
}

export interface INotFoundListResponse {
  message: string;
  data: INotFound[];
}

// ============================================
// Gateway Interface
// ============================================
export interface INotFoundGateway {
  create(data: ICreateNotFoundInput): Promise<INotFound>;
  findAll(): Promise<INotFound[]>;
  findById(id: string): Promise<INotFound | null>;
  update(id: string, data: IUpdateNotFoundInput): Promise<INotFound>;
  delete(id: string): Promise<INotFound>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateNotFoundUseCase {
  execute(input: ICreateNotFoundInput): Promise<INotFound>;
}

export interface IGetNotFoundUseCase {
  execute(id: string): Promise<INotFound>;
}

export interface IGetAllNotFoundsUseCase {
  execute(): Promise<INotFound[]>;
}

export interface IUpdateNotFoundUseCase {
  execute(id: string, input: IUpdateNotFoundInput): Promise<INotFound>;
}

export interface IDeleteNotFoundUseCase {
  execute(id: string): Promise<INotFound>;
}
