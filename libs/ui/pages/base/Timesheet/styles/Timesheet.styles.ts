import { Theme } from '@mui/material/styles';
import { createAppStyles } from '../../../../../theme';
import { getBaseStyles } from './Timesheet.styles.shared';

export const theme_warning = '#ff9800';
export const theme_success = '#008a00';
export const theme_error = '#ef4444';
export const theme_draft = '#6b7280';
export const TIMESHEET_STATUS_COLORS = {
  draft: theme_draft,
  pending: theme_warning,
  approved: theme_success,
  rejected: theme_error,
};

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
