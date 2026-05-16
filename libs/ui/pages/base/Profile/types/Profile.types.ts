export interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  department: string;
  workLocation: string;
  employeeId: string;
  businessUnit: string;
  managerName: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
}

export type LogRow = { sno: number; loginTime: string; ipAddress: string; userAgent: string };
