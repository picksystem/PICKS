import {
  IConfigTicketUpdateTemplate,
  IConfigResolutionTemplate,
  IConfigTimeEntryTemplate,
} from '@serviceops/interfaces';

export type BoolFormKey = 'internalNote' | 'notifyAssigneesOnly' | 'selfNote' | 'appendToResolution';

export interface TemplateSectionProps {
  title: string;
  subtitle: string;
  accent: string;
  gradientEnd: string;
  idPrefix: string;
  Icon: React.ElementType;
  defaultExpanded?: boolean;
  boolFields?: { key: BoolFormKey; label: string; hint: string }[];
  rows: IConfigTicketUpdateTemplate[];
  onSave: (next: IConfigTicketUpdateTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
}

export interface ResolutionSectionProps {
  rows: IConfigResolutionTemplate[];
  onSave: (next: IConfigResolutionTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
  applications: { id: string; name: string }[];
  applicationCategories: { id: string; applicationName: string; categoryName: string }[];
  applicationSubCategories: {
    id: string;
    applicationCategoryName: string;
    subCategoryName: string;
  }[];
}

export interface TimeEntrySectionProps {
  rows: IConfigTimeEntryTemplate[];
  onSave: (next: IConfigTimeEntryTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
  billingCodes: { id: string; code: string; description: string }[];
}