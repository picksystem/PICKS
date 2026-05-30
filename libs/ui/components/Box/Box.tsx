import { Box as MUIBox } from '@mui/material';
import { useStyles } from './styles';
import { DSBoxProps } from './Box.types';

const Box: React.FC<DSBoxProps> = ({ children, className, ...props }) => {
  const { cx, classes } = useStyles();
  return (
    <MUIBox className={cx(classes.root, className)} {...props}>
      {children}
    </MUIBox>
  );
};

export default Box;
