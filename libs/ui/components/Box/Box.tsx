import { Box as MUIBox } from '@mui/material';
import { useStyles } from './styles';

export interface DSBoxProps extends React.ComponentProps<typeof MUIBox> {
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

const Box: React.FC<DSBoxProps> = ({ children, className, ...props }) => {
  const { cx, classes } = useStyles();
  return (
    <MUIBox className={cx(classes.root, className)} {...props}>
      {children}
    </MUIBox>
  );
};

export default Box;
