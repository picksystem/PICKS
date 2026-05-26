import {
  IConfigServiceLine,
  IConfigApplication,
  IConfigApplicationQueue,
} from '@serviceops/interfaces';

export interface CategorizationSectionProps {
  title: string;
  subtitle: string;
  accent: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export interface TimesheetPanelProps {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}

export interface ExpensePanelProps {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}

export interface ServiceLineApprovalsPanelProps {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}

export interface ServiceLineTicketTypePanelProps {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigServiceLine) => void;
}

export interface AppApprovalsPanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface AppTicketTypePanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigApplication) => void;
}

export interface AppSupportLinesPanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface AppBillingCodesPanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface AppTimesheetPanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface AppStickyNotePanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface AppExpensePanelProps {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}

export interface QueueApprovalsPanelProps {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}

export interface QueueTicketTypePanelProps {
  queues: IConfigApplicationQueue[];
  initialQueueId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigApplicationQueue) => void;
}

export interface QueueTimesheetPanelProps {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}

export interface QueueExpensesPanelProps {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}
