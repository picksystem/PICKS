import { ListItemText as MUIListItemText } from '@mui/material';
import { useStyles } from './styles';

export interface DSListItemTextProps extends React.ComponentProps<typeof MUIListItemText> {
  className?: string;
}

const ListItemText: React.FC<DSListItemTextProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItemText className={cx(classes.root, className)} {...props} />;
};

export default ListItemText;
