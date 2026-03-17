import type { Meta, StoryObj } from '@storybook/react';
import GridItem from '../GridItem';

const meta: Meta<typeof GridItem> = {
  title: 'Components/GridItem',
  component: GridItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GridItem>;

export const Default: Story = {
  args: {
    xs: 12,
    sm: 6,
    md: 4,
    children: 'Grid item content',
  },
};
