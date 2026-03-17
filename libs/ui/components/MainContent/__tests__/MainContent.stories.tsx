import type { Meta, StoryObj } from '@storybook/react';
import MainContent from '../MainContent';
import { CollapseProvider } from '../../../hooks/useCollapse';

const meta: Meta<typeof MainContent> = {
  title: 'Components/MainContent',
  component: MainContent,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CollapseProvider>
        <Story />
      </CollapseProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MainContent>;

export const Default: Story = {
  args: {
    children: 'This is the main content area of the application.',
  },
};
