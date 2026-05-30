import { MenuItem as MUIMenuItem } from '@mui/material';

export interface DSMenuItemProps extends React.ComponentProps<typeof MUIMenuItem> {
  className?: string;
}
