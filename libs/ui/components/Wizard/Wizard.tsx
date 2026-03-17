import React, { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import { useStyles } from './styles';

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

const Wizard: React.FC<DSWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  currentStep: controlledStep,
  className,
  onStepChange,
  disableBack = false,
  disableNext = false,
  nextButtonText = 'Next',
  backButtonText = 'Back',
  finishButtonText = 'Finish',
  cancelButtonText = 'Cancel',
  showStepper = true,
}) => {
  const { cx, classes } = useStyles();
  const [activeStep, setActiveStep] = useState(controlledStep || 0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete();
    } else {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    onStepChange?.(prevStep);
  };

  const handleSkip = () => {
    if (steps[activeStep].canSkip) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const currentStepIndex = controlledStep !== undefined ? controlledStep : activeStep;

  return (
    <Box className={cx(classes.root, className)}>
      {showStepper && (
        <Stepper activeStep={currentStepIndex}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Box className={classes.content}>{steps[currentStepIndex]?.content}</Box>

      <Box className={classes.actions}>
        {onCancel && <Button onClick={onCancel}>{cancelButtonText}</Button>}
        <Box className={classes.buttonGroup}>
          <Button onClick={handleBack} disabled={currentStepIndex === 0 || disableBack}>
            {backButtonText}
          </Button>
          {steps[currentStepIndex]?.canSkip && <Button onClick={handleSkip}>Skip</Button>}
          <Button variant='contained' onClick={handleNext} disabled={disableNext}>
            {currentStepIndex === steps.length - 1 ? finishButtonText : nextButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Wizard;
