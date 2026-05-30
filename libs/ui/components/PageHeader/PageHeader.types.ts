import { SxProps, Theme } from '@mui/material';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label?: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  descriptionSx?: SxProps<Theme>;
  className?: string;
  titleClassName?: string;
}
