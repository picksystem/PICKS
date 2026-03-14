/**
 * Job Interfaces
 * Shared between Frontend and Backend
 */

// ============================================
// Status & Priority Types
// ============================================

export type JobStatus = 'needs_attention' | 'in_progress' | 'completed' | 'failed' | 'pending';
export type JobPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================
// Entity Interface
// ============================================

export interface IJob {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress?: number;
}

// ============================================
// Input Interfaces
// ============================================

export interface ICreateJobInput {
  title: string;
  description: string;
  status?: JobStatus;
  priority: JobPriority;
  assignee: string;
  dueDate?: string;
}

export interface IUpdateJobInput {
  title?: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  assignee?: string;
  dueDate?: string;
  progress?: number;
}

// ============================================
// Response Interfaces
// ============================================

export interface IJobResponse {
  message: string;
  data: IJob;
}

export interface IJobListResponse {
  message: string;
  data: IJob[];
}

// ============================================
// Summary Interface (for dashboards)
// ============================================

export interface IJobStatusSummary {
  total: number;
  needsAttention: number;
  inProgress: number;
  completed: number;
  failed: number;
  pending: number;
}

// ============================================
// Gateway Interface
// ============================================

export interface IJobGateway {
  create(data: ICreateJobInput): Promise<IJob>;
  findAll(): Promise<IJob[]>;
  findById(id: string): Promise<IJob | null>;
  findByStatus(status: JobStatus): Promise<IJob[]>;
  findByAssignee(assignee: string): Promise<IJob[]>;
  update(id: string, data: IUpdateJobInput): Promise<IJob>;
  delete(id: string): Promise<IJob>;
  getSummary(): Promise<IJobStatusSummary>;
}

// ============================================
// Use Case Interfaces
// ============================================

export interface ICreateJobUseCase {
  execute(input: ICreateJobInput): Promise<IJob>;
}

export interface IGetJobUseCase {
  execute(id: string): Promise<IJob>;
}

export interface IGetAllJobsUseCase {
  execute(): Promise<IJob[]>;
}

export interface IGetJobsByStatusUseCase {
  execute(status: JobStatus): Promise<IJob[]>;
}

export interface IUpdateJobUseCase {
  execute(id: string, input: IUpdateJobInput): Promise<IJob>;
}

export interface IUpdateJobStatusUseCase {
  execute(id: string, status: JobStatus): Promise<IJob>;
}

export interface IDeleteJobUseCase {
  execute(id: string): Promise<IJob>;
}

export interface IGetJobSummaryUseCase {
  execute(): Promise<IJobStatusSummary>;
}

// ============================================
// UI Config (for consistent rendering)
// ============================================

export interface IJobStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const JOB_STATUS_CONFIG: Record<JobStatus, IJobStatusConfig> = {
  needs_attention: {
    label: 'Needs Attention',
    color: '#f44336',
    bgColor: '#ffebee',
    icon: 'warning',
  },
  in_progress: {
    label: 'In Progress',
    color: '#2196f3',
    bgColor: '#e3f2fd',
    icon: 'autorenew',
  },
  completed: {
    label: 'Completed',
    color: '#4caf50',
    bgColor: '#e8f5e9',
    icon: 'check_circle',
  },
  failed: {
    label: 'Failed',
    color: '#f44336',
    bgColor: '#ffebee',
    icon: 'error',
  },
  pending: {
    label: 'Pending',
    color: '#ff9800',
    bgColor: '#fff3e0',
    icon: 'schedule',
  },
};

export const JOB_PRIORITY_COLORS: Record<JobPriority, string> = {
  low: '#9e9e9e',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#d32f2f',
};
