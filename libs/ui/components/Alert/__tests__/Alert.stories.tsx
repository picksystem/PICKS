import type { Meta, StoryObj } from '@storybook/react';
import Alert from '../Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    severity: 'info',
    message: 'This is an info alert',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    message: 'Operation completed successfully!',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    message: 'Please be cautious with this action',
  },
};

export const Error: Story = {
  args: {
    severity: 'error',
    message: 'An error occurred during the operation',
  },
};
