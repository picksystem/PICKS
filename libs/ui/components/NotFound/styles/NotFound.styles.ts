import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './NotFound.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    root: {},
    code: {},
    message: {},
  },
  user: {
    root: {},
    code: {},
    message: {},
  },
  consultant: {
    root: {},
    code: {},
    message: {},
  },
});
