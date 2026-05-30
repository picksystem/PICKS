export interface DSWizardStep {
  title: string;
  content: React.ReactNode;
  canSkip?: boolean;
}

export interface DSWizardProps {
  steps: DSWizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  currentStep?: number;
  className?: string;
  onStepChange?: (step: number) => void;
  disableBack?: boolean;
  disableNext?: boolean;
  nextButtonText?: string;
  backButtonText?: string;
  finishButtonText?: string;
  cancelButtonText?: string;
  showStepper?: boolean;
}
