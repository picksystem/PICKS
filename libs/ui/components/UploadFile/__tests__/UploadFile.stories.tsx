import type { Meta, StoryObj } from '@storybook/react';
import UploadFile from '../UploadFile';

const meta: Meta<typeof UploadFile> = {
  title: 'Components/UploadFile',
  component: UploadFile,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UploadFile>;

export const Default: Story = {
  args: {},
};
