import type { Meta, StoryObj } from '@storybook/react';
import CardCTA from '../CardCTA';

const meta: Meta<typeof CardCTA> = {
  title: 'Components/CardCTA',
  component: CardCTA,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardCTA>;

export const Default: Story = {
  args: {},
};
