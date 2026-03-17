import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './SignIn.styles.shared';
import { createAppStyles } from '@picks/theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
