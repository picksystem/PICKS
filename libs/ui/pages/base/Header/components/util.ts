import { IAuthUser } from '@serviceops/interfaces';

export interface UserMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onProfile: () => void;
  onUserPage: () => void;
  onConsultantPage: () => void;
  onAdminPage: () => void;
  onLogout: () => void;
  currentRole?: 'admin' | 'consultant' | 'user';
}

export interface LogoMarkProps {
  compact?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickAway: () => void;
  showResults: boolean;
  incidents: any[];
  onSelectIncident: (incident: any) => void;
  className?: string;
  wrapperClassName?: string;
  dropdownClassName?: string;
  noResultsClassName?: string;
}

export interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onViewAll: () => void;
  notifications: IAuthUser[];
}
