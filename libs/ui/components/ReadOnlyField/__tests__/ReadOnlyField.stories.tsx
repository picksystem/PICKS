import type { Meta, StoryObj } from '@storybook/react';
import ReadOnlyField from '../ReadOnlyField';

const meta: Meta<typeof ReadOnlyField> = {
  title: 'Components/ReadOnlyField',
  component: ReadOnlyField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReadOnlyField>;

export const Default: Story = {
  args: {},
};
