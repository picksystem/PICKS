/**
 * User Dashboard Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface IUserDashboard {
  id: string;
  name: string;
  key: string;
  path: string;
  app: string;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateUserDashboardInput {
  name: string;
  key: string;
  path: string;
  app: string;
}

export interface IUpdateUserDashboardInput {
  name?: string;
  key?: string;
  path?: string;
  app?: string;
}

// ============================================
// Response Interfaces
// ============================================
export interface IUserDashboardResponse {
  message: string;
  data: IUserDashboard;
}

export interface IUserDashboardListResponse {
  message: string;
  data: IUserDashboard[];
}

// ============================================
// Gateway Interface
// ============================================
export interface IUserDashboardGateway {
  create(data: ICreateUserDashboardInput): Promise<IUserDashboard>;
  findAll(): Promise<IUserDashboard[]>;
  findById(id: string): Promise<IUserDashboard | null>;
  update(id: string, data: IUpdateUserDashboardInput): Promise<IUserDashboard>;
  delete(id: string): Promise<IUserDashboard>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateUserDashboardUseCase {
  execute(input: ICreateUserDashboardInput): Promise<IUserDashboard>;
}

export interface IGetUserDashboardUseCase {
  execute(id: string): Promise<IUserDashboard>;
}

export interface IGetAllUserDashboardsUseCase {
  execute(): Promise<IUserDashboard[]>;
}

export interface IUpdateUserDashboardUseCase {
  execute(id: string, input: IUpdateUserDashboardInput): Promise<IUserDashboard>;
}

export interface IDeleteUserDashboardUseCase {
  execute(id: string): Promise<IUserDashboard>;
}
