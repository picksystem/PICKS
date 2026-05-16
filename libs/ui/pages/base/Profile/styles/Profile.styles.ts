import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './Profile.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
