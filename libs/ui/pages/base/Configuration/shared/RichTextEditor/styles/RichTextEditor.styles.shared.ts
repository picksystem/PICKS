import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  editor: {
    minHeight: 80,
    padding: '6px 10px',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    outline: 'none',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    color: 'text.primary',
    direction: 'ltr',
    unicodeBidi: 'plaintext',
    textAlign: 'left',
    '&:empty::before': {
      content: 'attr(data-placeholder)',
      color: 'text.disabled',
      pointerEvents: 'none',
    },
    '& ul, & ol': {
      paddingLeft: '1.5em',
      margin: '4px 0',
    },
    '& span': {
      whiteSpace: 'pre-wrap',
    },
  },
});
