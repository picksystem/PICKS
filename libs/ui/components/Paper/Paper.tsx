import { Paper as MUIPaper } from '@mui/material';
import { useStyles } from './styles';

export interface DSPaperProps extends React.ComponentProps<typeof MUIPaper> {
  className?: string;
}

const Paper: React.FC<DSPaperProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIPaper className={cx(classes.root, className)} {...props} />;
};

export default Paper;
