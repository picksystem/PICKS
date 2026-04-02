import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './ChangeManagement.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  user: {
    title: {},
  },
});
