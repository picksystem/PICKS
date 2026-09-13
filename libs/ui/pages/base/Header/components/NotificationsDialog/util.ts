export interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
  onViewAll: () => void;
  notifications: any[];
}
