import { Card as MUICard, CardHeader, CardContent, CardActions } from '@mui/material';
import { useStyles } from './styles';

export interface DSCardProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  sx?: any;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  raised?: boolean;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
}

const Card: React.FC<DSCardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  className,
  sx,
  onClick,
  raised = false,
  variant = 'elevation',
  elevation = 1,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUICard
      className={cx(classes.root, className)}
      sx={sx}
      onClick={onClick}
      raised={raised}
      variant={variant}
      elevation={elevation}
      {...rest}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
          className={classes.header}
        />
      )}

      <CardContent className={classes.content}>{children}</CardContent>

      {footer && <CardActions className={classes.footer}>{footer}</CardActions>}
    </MUICard>
  );
};

export default Card;
