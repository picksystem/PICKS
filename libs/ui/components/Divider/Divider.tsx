import { Divider as MUIDivider } from '@mui/material';
import { useStyles } from './styles';
import { DSDividerProps } from './util';

const Divider: React.FC<DSDividerProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIDivider className={cx(classes.root, className)} {...props} />;
};

export default Divider;
