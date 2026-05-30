import { Stepper as MUIStepper, Step, StepLabel, StepContent } from '@mui/material';
import { useStyles } from './styles';
import { DSStepperProps } from './Stepper.types';

const Stepper: React.FC<DSStepperProps> = ({
  steps = [],
  activeStep,
  orientation = 'horizontal',
  className,
  alternativeLabel = false,
  nonLinear = false,
  connector,
  onStepClick,
  variant = 'standard',
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const handleStepClick = (stepIndex: number) => {
    if (nonLinear) {
      onStepClick?.(stepIndex);
    }
  };

  return (
    <MUIStepper
      activeStep={activeStep}
      orientation={orientation}
      className={cx(classes.root, classes[variant], className)}
      alternativeLabel={alternativeLabel}
      nonLinear={nonLinear}
      connector={connector}
      {...rest}
    >
      {steps.map((step, index) => (
        <Step
          key={index}
          completed={step.completed}
          onClick={() => handleStepClick(index)}
          sx={{ cursor: nonLinear ? 'pointer' : 'default' }}
        >
          <StepLabel
            optional={step.optional ? step.description : undefined}
            error={step.error}
            icon={step.icon}
          >
            {step.label}
          </StepLabel>
          {orientation === 'vertical' && step.description && (
            <StepContent>{step.description}</StepContent>
          )}
        </Step>
      ))}
    </MUIStepper>
  );
};

export default Stepper;
