import type { Meta, StoryObj } from '@storybook/react';
import Modal from '../Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Modal Title',
    children: 'This is the modal content. You can add any content here.',
  },
};
