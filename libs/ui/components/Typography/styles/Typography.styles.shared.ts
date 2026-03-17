import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    fontSize: '16px',
    lineHeight: 1.5,

    // Mobile (0-576px)
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      lineHeight: 1.4,
    },

    // Tablet (577-768px)
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '15px',
      lineHeight: 1.45,
    },

    // Large Tablet / Small Desktop (769-1024px)
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '16px',
      lineHeight: 1.5,
    },

    // Desktop (1025-1350px)
    [theme.breakpoints.between('lg', 'xl')]: {
      fontSize: '17px',
      lineHeight: 1.55,
    },

    // Large Desktop (1351px+)
    [theme.breakpoints.up('xl')]: {
      fontSize: '18px',
      lineHeight: 1.6,
    },
  },
});
