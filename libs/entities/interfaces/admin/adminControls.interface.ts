/**
 * Admin Controls Interfaces
 * Shared between Frontend and Backend
 */

export interface IAdminControls {
  id: number;
  adminTwoLevel: boolean;
  adminManagerOnly: boolean;
  adminAdditionalApproval: boolean;
  adminApprover: string | null;
  signInStyle: string;
  signUpStyle: string;
  forgotPasswordStyle: string;
  theme: string;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateAdminControlsInput {
  adminTwoLevel?: boolean;
  adminManagerOnly?: boolean;
  adminAdditionalApproval?: boolean;
  adminApprover?: string | null;
  signInStyle?: string;
  signUpStyle?: string;
  forgotPasswordStyle?: string;
  theme?: string;
  updatedBy?: number;
}

export interface IAdminControlsResponse {
  data: IAdminControls;
  message: string;
}
