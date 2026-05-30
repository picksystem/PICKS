import { Tab as MUITab } from '@mui/material';
import { useStyles } from './styles';
import { DSTabProps } from './Tab.types';

const Tab: React.FC<DSTabProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUITab className={cx(classes.root, className)} {...props} />;
};

export default Tab;
