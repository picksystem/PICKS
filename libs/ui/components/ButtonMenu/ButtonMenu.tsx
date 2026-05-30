import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useStyles } from './styles';
import { DSButtonMenuProps } from './ButtonMenu.types';

const ButtonMenu: React.FC<DSButtonMenuProps> = ({
  buttonLabel,
  items,
  buttonVariant = 'contained',
  buttonColor = 'primary',
  buttonSize = 'medium',
  className,
  disabled = false,
  onOpen,
  onClose,
  anchorOrigin = { vertical: 'top', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'left' },
  ...rest
}) => {
  const { cx, classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    onOpen?.();
  };

  const handleClose = () => {
    setAnchorEl(null);
    onClose?.();
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        color={buttonColor}
        size={buttonSize}
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className={cx(classes.menu, className)}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        {...rest}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleItemClick(item.onClick)}
            disabled={item.disabled}
            className={classes.menuItem}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ButtonMenu;
