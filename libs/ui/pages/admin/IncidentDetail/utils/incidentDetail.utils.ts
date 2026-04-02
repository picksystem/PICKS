import { IncidentImpact, IncidentUrgency, calculatePriority, ITimeEntry } from '@serviceops/interfaces';
import { TimeSummaryData } from '../types/incidentDetail.types';

export const getPriorityColor = (priority: string) => {
  const p = priority.toLowerCase();
  if (p.includes('critical')) return 'error';
  if (p.includes('high')) return 'error';
  if (p.includes('medium')) return 'warning';
  if (p.includes('low')) return 'success';
  return 'default' as const;
};

export const getStatusColor = (status: string) => {
  if (status === 'draft') return 'secondary';
  if (status === 'new') return 'info';
  if (status === 'in_progress' || status === 'assigned') return 'warning';
  if (status === 'on_hold') return 'primary';
  if (status === 'resolved' || status === 'closed') return 'success';
  if (status === 'cancelled') return 'error';
  return 'default' as const;
};

export const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const calculateSLA = (createdAt: Date) => {
  const created = new Date(createdAt);
  const due = new Date(created);
  due.setDate(due.getDate() + 3);
  const now = new Date();
  const totalMs = 3 * 24 * 60 * 60 * 1000;
  const remainingMs = due.getTime() - now.getTime();
  const slaPercent = Math.max(0, Math.min(100, Math.round((remainingMs / totalMs) * 100)));
  return { dueDate: due.toLocaleDateString(), dueDateObj: due, slaPercent };
};

export const calculateVarianceDays = (
  eta: Date | null,
  dueDateObj: Date,
): { days: number; label: string; color: string } => {
  if (!eta) return { days: 0, label: '—', color: '#94a3b8' };
  const diffMs = new Date(eta).getTime() - dueDateObj.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return { days: 0, label: 'On Time', color: '#6366f1' };
  if (days > 0) return { days, label: `+${days}d Delayed`, color: '#ef4444' };
  return { days, label: `${Math.abs(days)}d Ahead`, color: '#10b981' };
};

export const calculateRemainingTime = (eta: Date | null): string => {
  if (!eta) return '—';
  const now = new Date();
  const diffMs = new Date(eta).getTime() - now.getTime();
  if (diffMs <= 0) return 'Overdue';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export const formatTimer = (totalSeconds: number) => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const computePriority = (impact: IncidentImpact, urgency: IncidentUrgency) => {
  return calculatePriority(impact, urgency);
};

export const formatTimeSummary = (totalMinutes: number): string => {
  if (totalMinutes === 0) return '0min';
  const isNegative = totalMinutes < 0;
  const abs = Math.abs(totalMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  const prefix = isNegative ? '-' : '';
  if (hours > 0 && minutes > 0) return `${prefix}${hours}hr ${minutes}min`;
  if (hours > 0) return `${prefix}${hours}hr`;
  return `${prefix}${minutes}min`;
};

export const calculateTimeSummary = (timeEntries: ITimeEntry[]): TimeSummaryData => {
  let billableMinutes = 0;
  let nonBillableMinutes = 0;

  for (const entry of timeEntries) {
    const entryMinutes = (entry.hours || 0) * 60 + (entry.minutes || 0);
    if (entry.isNonBillable) {
      nonBillableMinutes += entryMinutes;
    } else {
      billableMinutes += entryMinutes;
    }
  }

  const approvedMinutes = billableMinutes + nonBillableMinutes;
  const varianceMinutes = approvedMinutes - billableMinutes;

  return { approvedMinutes, billableMinutes, nonBillableMinutes, varianceMinutes };
};
