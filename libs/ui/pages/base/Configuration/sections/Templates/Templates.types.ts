import { SvgIconComponent } from '@mui/icons-material';
import {
  IConfigTicketUpdateTemplate,
  IConfigResolutionTemplate,
  IConfigTimeEntryTemplate,
} from '@serviceops/interfaces';

export interface TemplateTableConfig {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  gradientEnd: string;
  icon: SvgIconComponent;
  idPrefix: string;
  boolFields?: {
    key: 'internalNote' | 'notifyAssigneesOnly' | 'selfNote' | 'appendToResolution';
    label: string;
    hint: string;
  }[];
  defaultExpanded?: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  subjectLine?: string;
  commentDescription?: string;
  internalNote?: boolean;
  notifyAssigneesOnly?: boolean;
  selfNote?: boolean;
  appendToResolution?: boolean;
}

export interface TemplateTableProps {
  config: TemplateTableConfig;
  rows: TemplateItem[];
  onSave: (data: TemplateItem[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
}

export type BoolFormKey =
  | 'internalNote'
  | 'notifyAssigneesOnly'
  | 'selfNote'
  | 'appendToResolution';

export type TemplateForm = Omit<TemplateItem, 'id'>;

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
