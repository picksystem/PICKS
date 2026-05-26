import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  toolbar: {
    padding: 1,
  },

  buttonContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    padding: '8px',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },

  button: {
    textTransform: 'none',
  },

  buttonActive: {
    bgcolor: '#2d5ebb',
    color: '#fff',
  },

  buttonInactive: {
    color: '#2d5ebb',
  },
});
