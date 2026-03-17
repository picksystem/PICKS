/**
 * Admin Dashboard Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface IDashboard {
  id: string;
  name: string;
  age: number;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateDashboardInput {
  name: string;
  age: number;
}

export interface IUpdateDashboardInput {
  name?: string;
  age?: number;
}

// ============================================
// Response Interfaces
// ============================================
export interface IDashboardResponse {
  message: string;
  data: IDashboard;
}

export interface IDashboardListResponse {
  message: string;
  data: IDashboard[];
}

// ============================================
// Gateway Interface
// ============================================
export interface IDashboardGateway {
  create(data: ICreateDashboardInput): Promise<IDashboard>;
  findAll(): Promise<IDashboard[]>;
  findById(id: string): Promise<IDashboard | null>;
  update(id: string, data: IUpdateDashboardInput): Promise<IDashboard>;
  delete(id: string): Promise<IDashboard>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateDashboardUseCase {
  execute(input: ICreateDashboardInput): Promise<IDashboard>;
}

export interface IGetDashboardUseCase {
  execute(id: string): Promise<IDashboard>;
}

export interface IGetAllDashboardsUseCase {
  execute(): Promise<IDashboard[]>;
}

export interface IUpdateDashboardUseCase {
  execute(id: string, input: IUpdateDashboardInput): Promise<IDashboard>;
}

export interface IDeleteDashboardUseCase {
  execute(id: string): Promise<IDashboard>;
}
