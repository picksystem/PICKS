import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Button, Box, Typography } from '@mui/material';
import { useState } from 'react';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// Component that throws an error
const BuggyComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated error for demonstration purposes!');
  }
  return (
    <Box p={4}>
      <Typography variant='h5' gutterBottom>
        Everything is working fine!
      </Typography>
      <Typography color='text.secondary'>
        This component is rendering correctly without any errors.
      </Typography>
    </Box>
  );
};

// Interactive demo with button to trigger error
const ErrorBoundaryDemo = () => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  const triggerError = () => {
    setHasError(true);
  };

  const reset = () => {
    setHasError(false);
    setKey((prev) => prev + 1);
  };

  return (
    <Box p={4}>
      <Box mb={3}>
        <Button variant='contained' color='error' onClick={triggerError} sx={{ mr: 2 }}>
          Trigger Error
        </Button>
        <Button variant='outlined' onClick={reset}>
          Reset
        </Button>
      </Box>

      <ErrorBoundary key={key}>
        <BuggyComponent shouldThrow={hasError} />
      </ErrorBoundary>
    </Box>
  );
};

// Default error state
export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  ),
};

// Working component (no error)
export const NoError: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyComponent shouldThrow={false} />
    </ErrorBoundary>
  ),
};

// Custom fallback UI
export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          minHeight='400px'
          bgcolor='error.light'
          color='error.contrastText'
          p={4}
        >
          <Typography variant='h4'>Custom Error Fallback UI</Typography>
        </Box>
      }
    >
      <BuggyComponent />
    </ErrorBoundary>
  ),
};

// With error callback
export const WithErrorCallback: Story = {
  render: () => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
        console.log('Error info:', errorInfo);
        // In real app, you might send to error tracking service
      }}
    >
      <BuggyComponent />
    </ErrorBoundary>
  ),
};

// Interactive demo
export const InteractiveDemo: Story = {
  render: () => <ErrorBoundaryDemo />,
};

// Nested ErrorBoundaries
export const NestedBoundaries: Story = {
  render: () => (
    <Box p={4}>
      <Typography variant='h5' gutterBottom>
        Nested Error Boundaries
      </Typography>
      <Typography variant='body2' color='text.secondary' paragraph>
        Each section has its own error boundary. An error in one section won't crash the others.
      </Typography>

      <Box display='grid' gridTemplateColumns='repeat(2, 1fr)' gap={2}>
        <ErrorBoundary>
          <Box border={1} borderColor='grey.300' p={2} borderRadius={1}>
            <Typography variant='h6' gutterBottom>
              Section 1 (Error)
            </Typography>
            <BuggyComponent />
          </Box>
        </ErrorBoundary>

        <ErrorBoundary>
          <Box border={1} borderColor='grey.300' p={2} borderRadius={1}>
            <Typography variant='h6' gutterBottom>
              Section 2 (Working)
            </Typography>
            <BuggyComponent shouldThrow={false} />
          </Box>
        </ErrorBoundary>

        <ErrorBoundary>
          <Box border={1} borderColor='grey.300' p={2} borderRadius={1}>
            <Typography variant='h6' gutterBottom>
              Section 3 (Working)
            </Typography>
            <BuggyComponent shouldThrow={false} />
          </Box>
        </ErrorBoundary>

        <ErrorBoundary>
          <Box border={1} borderColor='grey.300' p={2} borderRadius={1}>
            <Typography variant='h6' gutterBottom>
              Section 4 (Error)
            </Typography>
            <BuggyComponent />
          </Box>
        </ErrorBoundary>
      </Box>
    </Box>
  ),
};

// Development mode (shows error details)
export const DevelopmentMode: Story = {
  render: () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    return (
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'In development mode, detailed error information is displayed including the error stack trace.',
      },
    },
  },
};
