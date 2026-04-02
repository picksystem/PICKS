import {
  IJob,
  IJobStatusSummary,
  JobStatus,
  JOB_STATUS_CONFIG,
  JOB_PRIORITY_COLORS,
} from '@serviceops/interfaces';

/**
 * Job Status Mock Data
 * Demonstrates different UI variations for job status states
 *
 * Uses shared interfaces from @serviceops/interfaces
 * Same types used by Frontend and Backend
 */

// Re-export config for convenience
export { JOB_STATUS_CONFIG as jobStatusConfig, JOB_PRIORITY_COLORS as priorityColors };
export type { JobStatus };

// ============================================
// Single Job Mocks - By Status
// ============================================

export const mockJobNeedsAttention: IJob = {
  id: 'job-001',
  title: 'Server Migration Issue',
  description: 'Critical issue during server migration that needs immediate attention',
  status: 'needs_attention',
  priority: 'critical',
  assignee: 'John Doe',
  createdAt: '2026-01-20T10:00:00Z',
  updatedAt: '2026-01-26T08:30:00Z',
  dueDate: '2026-01-27T18:00:00Z',
};

export const mockJobInProgress: IJob = {
  id: 'job-002',
  title: 'Database Optimization',
  description: 'Optimizing database queries for better performance',
  status: 'in_progress',
  priority: 'medium',
  assignee: 'Jane Smith',
  createdAt: '2026-01-22T14:00:00Z',
  updatedAt: '2026-01-26T12:00:00Z',
  progress: 65,
};

export const mockJobCompleted: IJob = {
  id: 'job-003',
  title: 'Security Patch Deployment',
  description: 'Successfully deployed security patches to all servers',
  status: 'completed',
  priority: 'high',
  assignee: 'Mike Johnson',
  createdAt: '2026-01-18T09:00:00Z',
  updatedAt: '2026-01-25T16:30:00Z',
  progress: 100,
};

export const mockJobFailed: IJob = {
  id: 'job-004',
  title: 'Backup Restoration',
  description: 'Failed to restore backup due to corrupted files',
  status: 'failed',
  priority: 'high',
  assignee: 'Sarah Wilson',
  createdAt: '2026-01-24T11:00:00Z',
  updatedAt: '2026-01-26T07:00:00Z',
};

export const mockJobPending: IJob = {
  id: 'job-005',
  title: 'Network Configuration',
  description: 'Waiting for approval to proceed with network changes',
  status: 'pending',
  priority: 'low',
  assignee: 'Tom Brown',
  createdAt: '2026-01-25T13:00:00Z',
  updatedAt: '2026-01-25T13:00:00Z',
  dueDate: '2026-02-01T18:00:00Z',
};

// ============================================
// List Mocks - Different Scenarios
// ============================================

export const mockJobsEmpty: IJob[] = [];

export const mockJobsAllStatuses: IJob[] = [
  mockJobNeedsAttention,
  mockJobInProgress,
  mockJobCompleted,
  mockJobFailed,
  mockJobPending,
];

export const mockJobsOnlyActive: IJob[] = [
  mockJobNeedsAttention,
  mockJobInProgress,
  mockJobPending,
];

export const mockJobsOnlyCompleted: IJob[] = [
  mockJobCompleted,
  {
    ...mockJobCompleted,
    id: 'job-006',
    title: 'API Integration Complete',
    description: 'Third-party API integration completed successfully',
  },
];

export const mockJobsNeedingAttention: IJob[] = [
  mockJobNeedsAttention,
  mockJobFailed,
  {
    id: 'job-007',
    title: 'Storage Space Critical',
    description: 'Server storage at 95% capacity',
    status: 'needs_attention',
    priority: 'critical',
    assignee: 'Admin Team',
    createdAt: '2026-01-26T06:00:00Z',
    updatedAt: '2026-01-26T06:00:00Z',
  },
];

// ============================================
// Dashboard Summary Mocks
// ============================================

export const mockJobStatusSummary: IJobStatusSummary = {
  total: 25,
  needsAttention: 3,
  inProgress: 8,
  completed: 10,
  failed: 2,
  pending: 2,
};

export const mockJobStatusSummaryAllClear: IJobStatusSummary = {
  total: 15,
  needsAttention: 0,
  inProgress: 5,
  completed: 10,
  failed: 0,
  pending: 0,
};

export const mockJobStatusSummaryCritical: IJobStatusSummary = {
  total: 20,
  needsAttention: 8,
  inProgress: 5,
  completed: 3,
  failed: 4,
  pending: 0,
};
