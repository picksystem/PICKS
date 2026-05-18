export interface DSAccordionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  expandIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  sx?: any;
  disableGutters?: boolean;
  elevation?: number;
}
