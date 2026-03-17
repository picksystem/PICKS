import { Pagination as MUIPagination } from '@mui/material';
import { useStyles } from './styles';

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

const Pagination: React.FC<DSPaginationProps> = ({
  count,
  page = 1,
  onChange,
  color = 'primary',
  variant = 'outlined',
  shape = 'rounded',
  size = 'medium',
  disabled = false,
  hideNextButton = false,
  hidePrevButton = false,
  showFirstButton = false,
  showLastButton = false,
  className,
  siblingCount = 1,
  boundaryCount = 1,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUIPagination
      count={count}
      page={page}
      onChange={onChange}
      color={color}
      variant={variant}
      shape={shape}
      size={size}
      disabled={disabled}
      hideNextButton={hideNextButton}
      hidePrevButton={hidePrevButton}
      showFirstButton={showFirstButton}
      showLastButton={showLastButton}
      siblingCount={siblingCount}
      boundaryCount={boundaryCount}
      className={cx(classes.root, className)}
      {...rest}
    />
  );
};

export default Pagination;
