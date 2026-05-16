import { Box as MUIBox } from '@mui/material';
import { useStyles } from './styles';

export interface DSBoxProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
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
