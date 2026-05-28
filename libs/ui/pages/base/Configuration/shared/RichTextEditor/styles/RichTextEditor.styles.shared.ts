import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  editor: {
    minHeight: 140,
    padding: '10px 14px',
    fontSize: '0.9rem',
    lineHeight: 1.6,
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
