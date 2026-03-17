import type { Meta, StoryObj } from '@storybook/react';
import Card from '../Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'This is the card content. Cards can contain various types of information.',
  },
};
