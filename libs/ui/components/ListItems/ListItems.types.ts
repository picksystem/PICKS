export interface DSListItem {
  id: string | number;
  primary: string | React.ReactNode;
  secondary?: string | React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export interface DSListItemsProps {
  items: DSListItem[];
  dense?: boolean;
  disablePadding?: boolean;
  className?: string;
  variant?: 'standard' | 'outlined';
  maxHeight?: number | string;
  onItemClick?: (item: DSListItem) => void;
  selectable?: boolean;
}
