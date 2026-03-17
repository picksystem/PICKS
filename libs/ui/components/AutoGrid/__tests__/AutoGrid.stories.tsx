import type { Meta, StoryObj } from '@storybook/react';
import AutoGrid from '../AutoGrid';
import Box from '@mui/material/Box';

const meta: Meta<typeof AutoGrid> = {
  title: 'Components/AutoGrid',
  component: AutoGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AutoGrid>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Box sx={{ p: 2, bgcolor: 'primary.light' }}>Item 1</Box>
        <Box sx={{ p: 2, bgcolor: 'secondary.light' }}>Item 2</Box>
        <Box sx={{ p: 2, bgcolor: 'primary.light' }}>Item 3</Box>
        <Box sx={{ p: 2, bgcolor: 'secondary.light' }}>Item 4</Box>
      </>
    ),
  },
};
