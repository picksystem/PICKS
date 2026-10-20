import { Theme } from '@mui/material/styles';
import { createAppStyles } from '../../../../../theme';
import { getBaseStyles } from './Timesheet.styles.shared';

export const theme_warning = '#ff9800';
export const theme_success = '#008a00';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
