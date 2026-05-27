import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    marginBottom: theme.spacing(2),
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: '1.5rem',
  },
  titleText: {
    marginBottom: theme.spacing(0.5),
  },
  descriptionText: {
    marginTop: theme.spacing(0.5),
  },
  placeholderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(2),
    border: '2px dashed',
    borderColor: theme.palette.divider,
    marginTop: theme.spacing(2),
  },
  placeholderIconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    opacity: 0.5,
  },
  placeholderIcon: {
    fontSize: '2rem',
  },
  placeholderTitle: {
    marginBottom: theme.spacing(1),
  },
  placeholderDescription: {
    maxWidth: 400,
  },
});
