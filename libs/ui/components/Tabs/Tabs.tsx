import { Tabs as MUITabs } from '@mui/material';
import { useStyles } from './styles';

export interface DSTabsProps extends React.ComponentProps<typeof MUITabs> {
  className?: string;
}

const Tabs: React.FC<DSTabsProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUITabs className={cx(classes.root, className)} {...props} />;
};

export default Tabs;
