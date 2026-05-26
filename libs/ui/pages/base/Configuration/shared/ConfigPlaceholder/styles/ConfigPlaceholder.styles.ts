import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './ConfigPlaceholder.styles.shared';
import { createAppStyles } from '@serviceops/theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
