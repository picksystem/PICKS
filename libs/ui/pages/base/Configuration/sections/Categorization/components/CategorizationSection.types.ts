import {
  IConfigBusinessCategory,
  IConfigServiceLine,
  IConfigApplication,
  IConfigApplicationQueue,
} from '@serviceops/interfaces';

export interface CategorizationSectionProps {
  businessCategories?: IConfigBusinessCategory[];
  serviceLines?: IConfigServiceLine[];
  applications?: IConfigApplication[];
  queues?: IConfigApplicationQueue[];
  onDataChange?: (key: string, value: unknown) => void;
}

export type CategorizationActiveView =
  | 'businessCategory'
  | 'serviceLine'
  | 'application'
  | 'applicationQueue'
  | 'applicationCategory'
  | 'applicationSubCategory'
  | 'applicationNumberSequence';
