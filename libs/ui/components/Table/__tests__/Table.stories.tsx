import type { Meta, StoryObj } from '@storybook/react';
import Table from '../Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'age', label: 'Age' },
      { id: 'email', label: 'Email' },
    ],
    rows: [
      { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
    ],
  },
};
