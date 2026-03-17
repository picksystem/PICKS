import { Link } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { useStyles } from './styles';

export interface DSPhoneLinkProps {
  phoneNumber: string;
  children?: React.ReactNode;
  displayNumber?: string;
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'start' | 'end';
  color?:
    | 'inherit'
    | 'initial'
    | 'primary'
    | 'secondary'
    | 'textPrimary'
    | 'textSecondary'
    | 'error';
  variant?:
    | 'inherit'
    | 'body1'
    | 'body2'
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2';
  underline?: 'none' | 'hover' | 'always';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const PhoneLink: React.FC<DSPhoneLinkProps> = ({
  phoneNumber,
  children,
  displayNumber,
  className,
  showIcon = true,
  iconPosition = 'start',
  color = 'primary',
  variant = 'inherit',
  underline = 'hover',
  onClick,
  ...rest
}) => {
  const { cx, classes } = useStyles();
  const formattedNumber = phoneNumber.replace(/\D/g, '');

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
  };

  return (
    <Link
      href={`tel:${formattedNumber}`}
      className={cx(classes.root, className)}
      color={color}
      variant={variant}
      underline={underline}
      onClick={handleClick}
      {...rest}
    >
      {showIcon && iconPosition === 'start' && (
        <PhoneIcon fontSize='small' className={classes.icon} />
      )}
      {children || displayNumber || phoneNumber}
      {showIcon && iconPosition === 'end' && (
        <PhoneIcon fontSize='small' className={classes.icon} />
      )}
    </Link>
  );
};

export default PhoneLink;
