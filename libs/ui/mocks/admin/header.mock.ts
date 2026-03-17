import { IHeader } from '@picks/interfaces';

/**
 * Mock data for Header component
 * Used in Storybook to test different UI variations
 */

// ============================================
// Single Item Mocks
// ============================================

export const mockHeaderActive: IHeader = {
  id: 1,
  ticketType: 'Incident',
  key: 'incident',
  name: 'Incident Management',
  description: 'Manage incidents and issues',
  isActive: true,
  app: 'admin',
  order: 1,
};

export const mockHeaderInactive: IHeader = {
  id: 2,
  ticketType: 'Change',
  key: 'change',
  name: 'Change Request',
  description: 'Request system changes',
  isActive: false,
  app: 'admin',
  order: 2,
};

// ============================================
// List Mocks - Different States
// ============================================

export const mockHeadersEmpty: IHeader[] = [];

export const mockHeadersSingle: IHeader[] = [mockHeaderActive];

export const mockHeadersMultiple: IHeader[] = [
  {
    id: 1,
    ticketType: 'Incident',
    key: 'incident',
    name: 'Incident Management',
    description: 'Manage incidents and issues',
    isActive: true,
    app: 'admin',
    order: 1,
  },
  {
    id: 2,
    ticketType: 'Change',
    key: 'change',
    name: 'Change Request',
    description: 'Request system changes',
    isActive: true,
    app: 'admin',
    order: 2,
  },
  {
    id: 3,
    ticketType: 'Service',
    key: 'service',
    name: 'Service Request',
    description: 'Request new services',
    isActive: true,
    app: 'admin',
    order: 3,
  },
  {
    id: 4,
    ticketType: 'Problem',
    key: 'problem',
    name: 'Problem Management',
    description: 'Track recurring issues',
    isActive: false,
    app: 'admin',
    order: 4,
  },
];

export const mockHeadersMixedStatus: IHeader[] = [
  { ...mockHeaderActive },
  { ...mockHeaderInactive },
  {
    id: 3,
    ticketType: 'Task',
    key: 'task',
    name: 'Task Management',
    description: null,
    isActive: true,
    app: 'admin',
    order: 3,
  },
];

// ============================================
// Tenant-specific Mocks
// ============================================

export const mockHeadersGeneralePartner: IHeader[] = [
  {
    id: 1,
    ticketType: 'Support',
    key: 'support',
    name: 'Support Ticket',
    description: 'General support requests',
    isActive: true,
    app: 'generale-partner',
    order: 1,
  },
  {
    id: 2,
    ticketType: 'Inquiry',
    key: 'inquiry',
    name: 'General Inquiry',
    description: 'Questions and inquiries',
    isActive: true,
    app: 'generale-partner',
    order: 2,
  },
];

// ============================================
// Loading/Error States
// ============================================

export const mockHeadersLoading = {
  isLoading: true,
  data: null,
  error: null,
};

export const mockHeadersError = {
  isLoading: false,
  data: null,
  error: 'Failed to fetch headers',
};

export const mockHeadersSuccess = {
  isLoading: false,
  data: mockHeadersMultiple,
  error: null,
};
