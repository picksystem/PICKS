/**
 * SignUp Interfaces
 * Shared between Frontend and Backend
 */

import { IAuthUser } from './auth.interface';

export interface ISignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workLocation: string;
  department: string;
  reasonForAccess: string;
  employeeId: string;
  businessUnit: string;
  managerName: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin' | 'consultant';
}

export interface ISignUpResponse {
  message: string;
  data: {
    user: IAuthUser;
    roleRequestPending?: boolean;
  };
}
