import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    width: '100%',
    marginBottom: theme.spacing(2),
    // classes.root is applied to the MuiPickersTextField-root element
    '&.MuiPickersTextField-root': {
      borderRadius: 2,
      overflow: 'hidden',
    },
  },
});
