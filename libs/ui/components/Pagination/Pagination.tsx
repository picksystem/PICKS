import { Pagination as MUIPagination } from '@mui/material';
import { useStyles } from './styles';
import { DSPaginationProps } from './Pagination.types';

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
