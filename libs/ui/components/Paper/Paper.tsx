import { Paper as MUIPaper } from '@mui/material';
import { useStyles } from './styles';
import { DSPaperProps } from './util';

const Paper: React.FC<DSPaperProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIPaper className={cx(classes.root, className)} {...props} />;
};

export default Paper;
