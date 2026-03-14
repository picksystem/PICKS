/**
 * User SideNav Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Entity Interface
// ============================================
export interface IUserSideNav {
  id: string;
  name: string;
  key: string;
  path: string;
  app: string;
}

// ============================================
// Input Interfaces
// ============================================
export interface ICreateUserSideNavInput {
  name: string;
  key: string;
  path: string;
  app: string;
}

export interface IUpdateUserSideNavInput {
  name?: string;
  key?: string;
  path?: string;
  app?: string;
}

// ============================================
// Response Interfaces
// ============================================
export interface IUserSideNavResponse {
  message: string;
  data: IUserSideNav;
}

export interface IUserSideNavListResponse {
  message: string;
  data: IUserSideNav[];
}

// ============================================
// Gateway Interface
// ============================================
export interface IUserSideNavGateway {
  create(data: ICreateUserSideNavInput): Promise<IUserSideNav>;
  findAll(): Promise<IUserSideNav[]>;
  findById(id: string): Promise<IUserSideNav | null>;
  update(id: string, data: IUpdateUserSideNavInput): Promise<IUserSideNav>;
  delete(id: string): Promise<IUserSideNav>;
}

// ============================================
// Use Case Interfaces
// ============================================
export interface ICreateUserSideNavUseCase {
  execute(input: ICreateUserSideNavInput): Promise<IUserSideNav>;
}

export interface IGetUserSideNavUseCase {
  execute(id: string): Promise<IUserSideNav>;
}

export interface IGetAllUserSideNavsUseCase {
  execute(): Promise<IUserSideNav[]>;
}

export interface IUpdateUserSideNavUseCase {
  execute(id: string, input: IUpdateUserSideNavInput): Promise<IUserSideNav>;
}

export interface IDeleteUserSideNavUseCase {
  execute(id: string): Promise<IUserSideNav>;
}
