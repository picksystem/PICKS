import type { Meta, StoryObj } from '@storybook/react';
import ListItems from '../ListItems';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';

const meta: Meta<typeof ListItems> = {
  title: 'Components/ListItems',
  component: ListItems,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItems>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', primary: 'Home', secondary: 'Navigate to home page', icon: <HomeIcon /> },
      {
        id: '2',
        primary: 'Settings',
        secondary: 'Manage your preferences',
        icon: <SettingsIcon />,
      },
      { id: '3', primary: 'About', secondary: 'Learn more about us', icon: <InfoIcon /> },
    ],
  },
};
