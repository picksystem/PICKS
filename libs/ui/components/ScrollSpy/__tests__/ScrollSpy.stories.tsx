import type { Meta, StoryObj } from '@storybook/react';
import ScrollSpy from '../ScrollSpy';

const meta: Meta<typeof ScrollSpy> = {
  title: 'Components/ScrollSpy',
  component: ScrollSpy,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollSpy>;

export const Default: Story = {
  args: {
    sections: [
      { id: 'section1', label: 'Introduction' },
      { id: 'section2', label: 'Features' },
      { id: 'section3', label: 'Pricing' },
      { id: 'section4', label: 'Contact' },
    ],
  },
};
