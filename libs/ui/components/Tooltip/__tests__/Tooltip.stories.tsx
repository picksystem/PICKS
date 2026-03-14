import type { Meta, StoryObj } from '@storybook/react';
import Tooltip from '../Tooltip';
import Button from '@mui/material/Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    title: 'This is a helpful tooltip',
    children: <Button>Hover over me</Button>,
  },
};
