import type { Meta, StoryObj } from '@storybook/react';
import NumberFormat from '../NumberFormat';

const meta: Meta<typeof NumberFormat> = {
  title: 'Components/NumberFormat',
  component: NumberFormat,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NumberFormat>;

export const Default: Story = {
  args: {},
};
