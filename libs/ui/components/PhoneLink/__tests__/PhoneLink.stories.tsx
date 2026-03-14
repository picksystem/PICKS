import type { Meta, StoryObj } from '@storybook/react';
import PhoneLink from '../PhoneLink';

const meta: Meta<typeof PhoneLink> = {
  title: 'Components/PhoneLink',
  component: PhoneLink,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhoneLink>;

export const Default: Story = {
  args: {
    phoneNumber: '+1 (555) 123-4567',
  },
};
