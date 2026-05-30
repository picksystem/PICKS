import { ListItemText as MUIListItemText } from '@mui/material';
import { useStyles } from './styles';
import { DSListItemTextProps } from './ListItemText.types';

const ListItemText: React.FC<DSListItemTextProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItemText className={cx(classes.root, className)} {...props} />;
};

export default ListItemText;
