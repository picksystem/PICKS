import type { Meta, StoryObj } from '@storybook/react';
import TextField from '../TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    helperText: 'We will never share your email',
    placeholder: 'Enter your email',
  },
};

export const Error: Story = {
  args: {
    label: 'Password',
    error: true,
    errorText: 'Password is required',
  },
};
