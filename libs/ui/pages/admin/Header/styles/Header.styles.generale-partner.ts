import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './Header.styles.shared';
import { createAppStyles } from '../../../../../theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    title: {},
  },
});
