import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@picks/theme';
import { getBaseStyles } from './Favourites.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  user: {
    title: {},
  },
});
