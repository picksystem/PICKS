import type { Meta, StoryObj } from '@storybook/react';
import Button from '../Button';
import SaveIcon from '@mui/icons-material/Save';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    label: 'Click Me',
    variant: 'contained',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'contained',
    color: 'secondary',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Save',
    variant: 'contained',
    icon: <SaveIcon />,
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    loading: true,
  },
};
