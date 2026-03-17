import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { JobStatusCard } from '../JobStatusCard';
import {
  mockJobNeedsAttention,
  mockJobInProgress,
  mockJobCompleted,
  mockJobFailed,
  mockJobPending,
  mockJobsAllStatuses,
} from '../../../mocks/admin';

/**
 * JobStatusCard Storybook Stories
 *
 * Demonstrates all UI variations:
 * - Different job statuses (needs attention, in progress, completed, failed, pending)
 * - Different priorities (low, medium, high, critical)
 * - With/without progress
 * - With/without due date
 *
 * Benefits:
 * - Easy to see how component looks for ALL states
 * - No backend needed - uses mock data
 * - Test theming per tenant
 */

const meta: Meta<typeof JobStatusCard> = {
  title: 'Components/JobStatusCard',
  component: JobStatusCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['needs_attention', 'in_progress', 'completed', 'failed', 'pending'],
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
    },
    progress: {
      control: { type: 'range', min: 0, max: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof JobStatusCard>;

// ============================================
// Individual Status Stories
// ============================================

export const NeedsAttention: Story = {
  args: mockJobNeedsAttention,
};

export const InProgress: Story = {
  args: mockJobInProgress,
};

export const Completed: Story = {
  args: mockJobCompleted,
};

export const Failed: Story = {
  args: mockJobFailed,
};

export const Pending: Story = {
  args: mockJobPending,
};

// ============================================
// Priority Variations
// ============================================

export const PriorityLow: Story = {
  args: {
    ...mockJobPending,
    priority: 'low',
    title: 'Low Priority Task',
  },
};

export const PriorityMedium: Story = {
  args: {
    ...mockJobInProgress,
    priority: 'medium',
    title: 'Medium Priority Task',
  },
};

export const PriorityHigh: Story = {
  args: {
    ...mockJobNeedsAttention,
    priority: 'high',
    title: 'High Priority Task',
  },
};

export const PriorityCritical: Story = {
  args: {
    ...mockJobNeedsAttention,
    priority: 'critical',
    title: 'CRITICAL: Immediate Action Required',
  },
};

// ============================================
// Progress Variations (In Progress only)
// ============================================

export const Progress25Percent: Story = {
  args: {
    ...mockJobInProgress,
    progress: 25,
    title: 'Just Started (25%)',
  },
};

export const Progress50Percent: Story = {
  args: {
    ...mockJobInProgress,
    progress: 50,
    title: 'Halfway There (50%)',
  },
};

export const Progress75Percent: Story = {
  args: {
    ...mockJobInProgress,
    progress: 75,
    title: 'Almost Done (75%)',
  },
};

export const Progress90Percent: Story = {
  args: {
    ...mockJobInProgress,
    progress: 90,
    title: 'Final Stretch (90%)',
  },
};

// ============================================
// All Statuses - Gallery View
// ============================================

export const AllStatuses: Story = {
  render: () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        All Job Status Variations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This gallery shows how the JobStatusCard looks for each status type.
        Easy to verify UI for all states without needing real data.
      </Typography>

      {mockJobsAllStatuses.map((job) => (
        <JobStatusCard
          key={job.id}
          {...job}
          onAction={(id, action) => console.log(`Action: ${action} on job ${id}`)}
        />
      ))}
    </Box>
  ),
};

// ============================================
// Interactive - With Action Handler
// ============================================

export const Interactive: Story = {
  args: {
    ...mockJobInProgress,
    onAction: (id, action) => {
      alert(`Action: ${action}\nJob ID: ${id}`);
    },
  },
};

// ============================================
// Edge Cases
// ============================================

export const LongTitle: Story = {
  args: {
    ...mockJobInProgress,
    title: 'This is a very long job title that might overflow and needs to be handled gracefully by the component',
  },
};

export const LongDescription: Story = {
  args: {
    ...mockJobInProgress,
    description:
      'This is a very long description that contains a lot of text. It should wrap properly and not break the layout. The component should handle this gracefully without any visual issues. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
};

export const NoDescription: Story = {
  args: {
    ...mockJobPending,
    description: '',
  },
};

export const NoDueDate: Story = {
  args: {
    ...mockJobInProgress,
    dueDate: undefined,
  },
};
