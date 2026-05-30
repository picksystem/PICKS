export interface DSPaginationProps {
  count: number;
  page?: number;
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  color?: 'primary' | 'secondary' | 'standard';
  variant?: 'text' | 'outlined';
  shape?: 'circular' | 'rounded';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  className?: string;
  siblingCount?: number;
  boundaryCount?: number;
}
