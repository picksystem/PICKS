import type { Meta, StoryObj } from '@storybook/react';
import Box from '../Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: 'This is a Box component with padding and background',
    sx: { p: 2, bgcolor: 'background.paper' },
  },
};
