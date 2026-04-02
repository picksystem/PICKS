import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './SignIn.styles.shared';
import { createAppStyles } from '@serviceops/theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
