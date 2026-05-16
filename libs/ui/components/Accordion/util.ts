export interface DSAccordionProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  expandIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  sx?: Record<string, unknown>;
  disableGutters?: boolean;
  elevation?: number;
}
