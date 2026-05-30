import { Link } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { useStyles } from './styles';
import { DSPhoneLinkProps } from './PhoneLink.types';

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
