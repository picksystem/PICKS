import { SelectChangeEvent } from '@mui/material';

export interface WorkDetailsStepProps {
  values: {
    workLocation: string;
    department: string;
    employeeId: string;
    businessUnit: string;
    managerName: string;
    reasonForAccess: string;
    role: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onRoleChange: (event: SelectChangeEvent<string>) => void;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  classes: Record<string, string>;
}

export interface SecurityStepProps {
  values: { password: string; confirmPassword: string };
  errors: Partial<Record<string, string>>;
  step2Touched: { password: boolean; confirmPassword: boolean };
  step2Submitted: boolean;
  onPasswordChange: React.ChangeEventHandler;
  onPasswordBlur: (e: React.FocusEvent) => void;
  onConfirmChange: React.ChangeEventHandler;
  onConfirmBlur: (e: React.FocusEvent) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  showConfirmPassword: boolean;
  onToggleConfirmPassword: () => void;
  classes: Record<string, string>;
}

export interface StepProgressProps {
  step: number;
  classes: Record<string, string>;
}

export interface PersonalStepProps {
  values: { firstName: string; lastName: string; email: string; phone: string };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler;
  onBlur: React.FocusEventHandler;
  classes: Record<string, string>;
}

export interface LeftPanelProps {
  classes: Record<string, string>;
  onNavigateSignIn: () => void;
}
