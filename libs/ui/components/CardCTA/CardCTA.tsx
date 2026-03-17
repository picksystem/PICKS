import { Card, CardMedia, CardContent, CardActions, Button, Typography } from '@mui/material';
import { useStyles } from './styles';

export interface DSCardCTAProps {
  title: string;
  description?: string;
  buttonText: string;
  onButtonClick: () => void;
  image?: string;
  imageAlt?: string;
  className?: string;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  buttonVariant?: 'text' | 'outlined' | 'contained';
  buttonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const CardCTA: React.FC<DSCardCTAProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  image,
  imageAlt,
  className,
  variant = 'elevation',
  elevation = 1,
  buttonVariant = 'contained',
  buttonColor = 'primary',
  disabled = false,
  onCardClick,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <Card
      className={cx(classes.root, className)}
      variant={variant}
      elevation={elevation}
      onClick={onCardClick}
      {...rest}
    >
      {image && (
        <CardMedia
          component='img'
          className={classes.media}
          image={image}
          alt={imageAlt || title}
        />
      )}
      <CardContent className={classes.content}>
        <Typography className={classes.title}>{title}</Typography>
        {description && <Typography className={classes.description}>{description}</Typography>}
      </CardContent>
      <CardActions>
        <Button
          variant={buttonVariant}
          color={buttonColor}
          onClick={onButtonClick}
          fullWidth
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CardCTA;
