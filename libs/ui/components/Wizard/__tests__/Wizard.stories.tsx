import type { Meta, StoryObj } from '@storybook/react';
import Wizard from '../Wizard';

const meta: Meta<typeof Wizard> = {
  title: 'Components/Wizard',
  component: Wizard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Wizard>;

export const Default: Story = {
  args: {
    steps: [],
    onComplete: () => console.log('Wizard completed'),
    onCancel: () => console.log('Wizard cancelled'),
  },
};
