import type { Meta, StoryObj } from '@storybook/react';
import FormControlLabel from '../FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';

const meta: Meta<typeof FormControlLabel> = {
  title: 'Components/FormControlLabel',
  component: FormControlLabel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormControlLabel>;

export const WithCheckbox: Story = {
  args: {
    label: 'Accept terms and conditions',
    control: <Checkbox />,
  },
};

export const WithSwitch: Story = {
  args: {
    label: 'Enable notifications',
    control: <Switch />,
  },
};

export const WithRadio: Story = {
  args: {
    label: 'Select this option',
    control: <Radio />,
  },
};
