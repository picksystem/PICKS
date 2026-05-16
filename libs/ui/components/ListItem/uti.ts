import { ListItem as MUIListItem } from '@mui/material';

export interface DSListItemProps extends React.ComponentProps<typeof MUIListItem> {
  className?: string;
}
