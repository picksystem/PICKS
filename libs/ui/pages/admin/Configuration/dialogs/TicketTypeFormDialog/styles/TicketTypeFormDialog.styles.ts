import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@picks/theme';
import { getBaseStyles } from './TicketTypeFormDialog.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
