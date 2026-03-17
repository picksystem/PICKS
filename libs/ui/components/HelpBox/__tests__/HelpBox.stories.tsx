import type { Meta, StoryObj } from '@storybook/react';
import HelpBox from '../HelpBox';

const meta: Meta<typeof HelpBox> = {
  title: 'Components/HelpBox',
  component: HelpBox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HelpBox>;

export const Default: Story = {
  args: {},
};
