import type { Meta, StoryObj } from '@storybook/react';
import Typography from '../Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Heading 1',
  },
};

export const Heading2: Story = {
  args: {
    variant: 'h2',
    children: 'Heading 2',
  },
};

export const Body: Story = {
  args: {
    variant: 'body1',
    children: 'This is body text. It can be used for paragraphs and general content.',
  },
};
