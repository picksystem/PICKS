import { LinearProgress as MUILinearProgress } from '@mui/material';
import { useStyles } from './styles';

export interface DSLinearProgressProps extends React.ComponentProps<typeof MUILinearProgress> {
  className?: string;
}

const LinearProgress: React.FC<DSLinearProgressProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUILinearProgress className={cx(classes.root, className)} {...props} />;
};

export default LinearProgress;
