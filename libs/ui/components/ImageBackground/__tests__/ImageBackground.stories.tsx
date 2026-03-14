import type { Meta, StoryObj } from '@storybook/react';
import ImageBackground from '../ImageBackground';

const meta: Meta<typeof ImageBackground> = {
  title: 'Components/ImageBackground',
  component: ImageBackground,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImageBackground>;

export const Default: Story = {
  args: {
    src: 'https://via.placeholder.com/1200x600',
    children: 'Content over background image',
  },
};
