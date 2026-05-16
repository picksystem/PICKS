import { Tabs as MUITabs } from '@mui/material';
import { useStyles } from './styles';
import { DSTabsProps } from './util';

const Tabs: React.FC<DSTabsProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUITabs className={cx(classes.root, className)} {...props} />;
};

export default Tabs;
