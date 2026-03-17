import { Avatar } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface UserAvatarProps {
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

function getInitials(user: UserAvatarProps['user']): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.name) {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return '?';
}

export const UserAvatar = ({ user, size = 40, sx, className }: UserAvatarProps) => (
  <Avatar
    src={user.profilePicture || undefined}
    sx={{ width: size, height: size, ...sx }}
    className={className}
  >
    {!user.profilePicture && getInitials(user)}
  </Avatar>
);
