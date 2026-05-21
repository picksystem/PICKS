import { SvgIconComponent } from '@mui/icons-material';

export interface ReasonCodeTableConfig {
  /** Unique identifier for this reason code type */
  id: string;
  /** Whether this accordion should be expanded by default */
  expandedByDefault?: boolean;
  /** Display title for the section */
  title: string;
  /** Subtitle/description for the section */
  subtitle: string;
  /** Accent color for the section (hex) */
  accent: string;
  /** MUI Icon component for the section */
  icon: SvgIconComponent;
  /** Dialog title for add/edit */
  dialogTitle: string;
  /** Dialog subtitle */
  dialogSubtitle: string;
  /** Form field label */
  formLabel: string;
  /** Form field placeholder */
  formPlaceholder: string;
  /** Entity name for delete confirmation */
  entityName: string;
  /** The data key in the API response */
  dataKey:
    | 'priorityChangeReasonCodes'
    | 'roleChangeReasonCodes'
    | 'resolutionCodes'
    | 'cancellationReasonCodes'
    | 'reopenReasonCodes'
    | 'conversionReasonCodes';
  /** Prefix for generating new IDs */
  idPrefix: string;
  /** Name column header label */
  nameColumnLabel: string;
  /** Description column header label */
  descriptionColumnLabel: string;
}

export interface ReasonCodeConfig extends ReasonCodeTableConfig {
  icon: SvgIconComponent;
}

export interface ReasonCodeItem {
  id: string;
  name: string;
  description: string;
}

export interface ReasonCodeTableProps {
  config: ReasonCodeTableConfig;
  rows: ReasonCodeItem[];
  onSave: (data: ReasonCodeItem[]) => void;
}
