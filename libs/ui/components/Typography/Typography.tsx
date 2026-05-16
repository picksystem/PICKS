import { useStyles } from './styles';
import { HeadingProps } from './util';
import { Typography as MUITypography } from '@mui/material';

const Typography: React.FC<HeadingProps> = ({
  text,
  children,
  className,
  variant = 'body1',
  align = 'inherit',
  color = 'initial',
  noWrap = false,
  gutterBottom = false,
  paragraph = false,
  onClick,
  sx,
  fontWeight,
  fontSize,
  fontFamily,
  lineHeight,
  display,
  mb,
  textAlign,
  component,
  ...props
}) => {
  const { cx, classes } = useStyles();

  const combinedSx: Record<string, unknown> = {
    ...(fontWeight && { fontWeight }),
    ...(fontSize && { fontSize }),
    ...(fontFamily && { fontFamily }),
    ...(lineHeight && { lineHeight }),
    ...(display && { display }),
    ...(mb && { mb }),
    ...(textAlign && { textAlign }),
    ...sx,
  };

  return (
    <MUITypography
      variant={variant}
      align={align}
      color={color as any}
      noWrap={noWrap}
      gutterBottom={gutterBottom}
      paragraph={paragraph}
      onClick={onClick}
      className={cx(classes.root, className)}
      sx={combinedSx}
      {...(component && { component })}
      {...props}
    >
      {text || children}
    </MUITypography>
  );
};

export default Typography;
