import React, { ReactNode } from 'react';
import { Box, Paper, Button } from '@serviceops/component';
import { useStyles } from './styles';

export interface ToolbarButton {
  key: string;
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

interface GenericToolbarProps {
  buttons?: ToolbarButton[];
  children?: ReactNode;
  className?: string;
}

export const GenericToolbar = ({ buttons, children, className }: GenericToolbarProps) => {
  const { classes } = useStyles();

  return (
    <Paper variant='outlined' className={`${classes.toolbar} ${className || ''}`}>
      {buttons && buttons.length > 0 ? (
        <Box className={classes.buttonContainer}>
          {buttons.map((btn) => (
            <Button
              key={btn.key}
              size='small'
              variant={btn.isActive ? 'contained' : 'outlined'}
              startIcon={btn.icon}
              onClick={btn.onClick}
              className={`${classes.button} ${btn.isActive ? classes.buttonActive : classes.buttonInactive}`}
            >
              {btn.label}
            </Button>
          ))}
        </Box>
      ) : (
        children
      )}
    </Paper>
  );
};
