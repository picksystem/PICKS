import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useStyles } from './styles';

export interface DSListItem {
  id: string | number;
  primary: string | React.ReactNode;
  secondary?: string | React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export interface DSListItemsProps {
  items: DSListItem[];
  dense?: boolean;
  disablePadding?: boolean;
  className?: string;
  variant?: 'standard' | 'outlined';
  maxHeight?: number | string;
  onItemClick?: (item: DSListItem) => void;
  selectable?: boolean;
}

const ListItems: React.FC<DSListItemsProps> = ({
  items,
  dense = false,
  disablePadding = false,
  className,
  variant = 'standard',
  maxHeight,
  onItemClick,
  selectable = false,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const handleItemClick = (item: DSListItem) => {
    item.onClick?.();
    onItemClick?.(item);
  };

  return (
    <List
      dense={dense}
      disablePadding={disablePadding}
      className={cx(classes.root, classes[variant], className)}
      sx={{ maxHeight, overflow: maxHeight ? 'auto' : undefined }}
      {...rest}
    >
      {items.map((item) => (
        <ListItem key={item.id} disablePadding className={classes.listItem}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            selected={selectable && item.selected}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.primary} secondary={item.secondary} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ListItems;
