import { LinearProgress as MUILinearProgress } from '@mui/material';
import { useStyles } from './styles';
import { DSLinearProgressProps } from './LinearProgress.types';

const LinearProgress: React.FC<DSLinearProgressProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUILinearProgress className={cx(classes.root, className)} {...props} />;
};

export default LinearProgress;
