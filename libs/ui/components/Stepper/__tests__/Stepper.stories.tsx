import type { Meta, StoryObj } from '@storybook/react';
import Stepper from '../Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {
    activeStep: 0,
    steps: [
      { label: 'Step 1', description: 'Description for step 1' },
      { label: 'Step 2', description: 'Description for step 2' },
      { label: 'Step 3', description: 'Description for step 3' },
    ],
  },
};

export const Vertical: Story = {
  args: {
    activeStep: 1,
    orientation: 'vertical',
    steps: [
      { label: 'Select campaign settings', description: 'Create a campaign' },
      { label: 'Create an ad group', description: 'Configure your ad group' },
      { label: 'Create an ad', description: 'Design your advertisement' },
    ],
  },
};

export const WithOptionalStep: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: 'Step 1', description: 'First step' },
      { label: 'Step 2 (Optional)', description: 'Optional step', optional: true },
      { label: 'Step 3', description: 'Final step' },
    ],
  },
};
