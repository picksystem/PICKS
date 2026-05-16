export interface DSStepperStep {
  label: string;
  description?: string | React.ReactNode;
  optional?: boolean;
  icon?: React.ReactNode;
  completed?: boolean;
  error?: boolean;
}

export interface DSStepperProps {
  steps?: DSStepperStep[];
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  alternativeLabel?: boolean;
  nonLinear?: boolean;
  connector?: React.ReactElement;
  onStepClick?: (stepIndex: number) => void;
  variant?: 'standard' | 'dots';
}
