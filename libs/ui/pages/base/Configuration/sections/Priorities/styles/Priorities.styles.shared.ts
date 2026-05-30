import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';
import { getBaseStyles as getSharedBaseStyles } from '@serviceops/configbase';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  ...getSharedBaseStyles(theme),
});
