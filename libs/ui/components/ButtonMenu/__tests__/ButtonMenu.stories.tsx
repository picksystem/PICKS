import type { Meta, StoryObj } from '@storybook/react';
import ButtonMenu from '../ButtonMenu';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';

const meta: Meta<typeof ButtonMenu> = {
  title: 'Components/ButtonMenu',
  component: ButtonMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ButtonMenu>;

export const Default: Story = {
  args: {
    buttonLabel: 'Actions',
    items: [
      { label: 'Edit', icon: <EditIcon />, onClick: () => console.log('Edit clicked') },
      { label: 'Share', icon: <ShareIcon />, onClick: () => console.log('Share clicked') },
      { label: 'Delete', icon: <DeleteIcon />, onClick: () => console.log('Delete clicked') },
    ],
  },
};
