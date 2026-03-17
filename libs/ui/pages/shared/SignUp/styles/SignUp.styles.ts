import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './SignUp.styles.shared';
import { createAppStyles } from '@picks/theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
