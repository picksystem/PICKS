import { ReactNode } from 'react';

export interface ActionButtonConfig {
  icon: ReactNode;
  label: string;
  onClick?: (e?: any) => void;
  disabled?: boolean;
}

export type ModalType =
  | 'priorityChange'
  | 'assign'
  | 'attachment'
  | 'comment'
  | 'timeEntry'
  | 'resolve'
  | null;

export interface TimeSummaryData {
  approvedMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  varianceMinutes: number;
}

export type EditModeAction =
  | 'save'
  | 'saveAndClose'
  | 'saveAndResolve'
  | 'saveAndEnterTime'
  | 'saveAndAddComment'
  | 'saveAndFollow'
  | 'addAttachment'
  | 'goToActivity';
