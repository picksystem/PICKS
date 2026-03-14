import { Theme } from '@mui/material/styles';
import { createAppStyles } from '../../../../../theme';
import { getBaseStyles } from './CreateTicket.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
