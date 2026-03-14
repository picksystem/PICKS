import type { Meta, StoryObj } from '@storybook/react';
import PartnerLogo from '../PartnerLogo';

const meta: Meta<typeof PartnerLogo> = {
  title: 'Components/PartnerLogo',
  component: PartnerLogo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PartnerLogo>;

export const Default: Story = {
  args: {
    src: 'https://via.placeholder.com/150x50',
    alt: 'Partner Logo',
  },
};
