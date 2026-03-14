import type { Meta, StoryObj } from '@storybook/react';
import Accordion from '../Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    title: 'Accordion Title',
    children: 'This is the accordion content. It can contain any content you want to display.',
  },
};

export const Expanded: Story = {
  args: {
    title: 'Expanded Accordion',
    children: 'This accordion is expanded by default.',
    defaultExpanded: true,
  },
};
