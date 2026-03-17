import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(4),
    textAlign: 'center',
    borderRadius: theme.spacing(2),
  },
  errorIcon: {
    fontSize: 80,
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  errorDetailsBox: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1),
    textAlign: 'left',
    maxHeight: 300,
    overflow: 'auto',
  },
  errorText: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  buttonContainer: {
    marginTop: theme.spacing(4),
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
  },
});
