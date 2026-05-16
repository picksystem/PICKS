import type { SxProps, Theme } from '@mui/material/styles';

export interface UserAvatarProps {
  user: {
    profilePicture?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
  };
  size?: number;
  sx?: SxProps<Theme>;
  className?: string;
}
