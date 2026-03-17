import { Theme } from '@mui/material/styles';
import { createAppStyles } from '../../../../../theme';
import { getBaseStyles } from './CabRequest.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    title: {},
  },
});
