import { Typography, ClickAwayListener, useMediaQuery, useTheme } from '@mui/material';
import {
  Box,
  Tooltip,
  Button,
  Chip,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  SearchIcon,
  SettingsIcon,
  CloseIcon,
  SaveIcon,
  SaveAsIcon,
  AccessTimeIcon,
  AccountCircleIcon,
  PersonIcon,
  BusinessCenterIcon,
  HelpOutlineIcon,
  LogoutIcon,
} from '../../../../components';
import { IIncident } from '@serviceops/interfaces';

const buttonSx = {
  color: 'text.primary',
  borderColor: 'divider',
  textTransform: 'none' as const,
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '2px 8px',
  minWidth: 'auto',
  whiteSpace: 'nowrap' as const,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'primary.main',
    backgroundColor: 'action.hover',
  },
};

const searchIconSx = { fontSize: '0.875rem', color: 'text.secondary', ml: 0.5 };
const btnIconSmSx = { fontSize: '0.875rem !important' };
const mobileIconSx = { color: 'text.secondary' };

const resultNumberSx = { fontWeight: 600, fontSize: '0.875rem' };
const resultDescSx = {
  fontSize: '0.875rem',
  color: 'text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 180,
};
const resultChipSx = { fontSize: '0.875rem', height: 20 };
const noResultsSx = {
  p: 1.5,
  textAlign: 'center',
  color: 'text.secondary',
  fontSize: '0.875rem',
};

interface TopToolbarProps {
  classes: Record<string, string>;
  toolbarSearch: string;
  showToolbarResults: boolean;
  filteredToolbarIncidents: IIncident[];
  settingsAnchorEl: null | HTMLElement;
  isAdmin: boolean;
  AdminPath: Record<string, string>;
  onToolbarSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectToolbarIncident: (inc: IIncident) => void;
  onCloseToolbarResults: () => void;
  onSettingsOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onSettingsClose: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  onAddTime: () => void;
  onCloseWindow: () => void;
  onLogout: () => void;
}

const TopToolbar = ({
  classes,
  toolbarSearch,
  showToolbarResults,
  filteredToolbarIncidents,
  settingsAnchorEl,
  isAdmin,
  AdminPath,
  onToolbarSearchChange,
  onSelectToolbarIncident,
  onCloseToolbarResults,
  onSettingsOpen,
  onSettingsClose,
  onSave,
  onSaveAndClose,
  onAddTime,
  onCloseWindow,
  onLogout,
}: TopToolbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box className={classes.topToolbar}>
      <ClickAwayListener onClickAway={onCloseToolbarResults}>
        <Box className={classes.toolbarSearchWrapper}>
          <TextField
            size='small'
            placeholder='Ticket Number'
            value={toolbarSearch}
            onChange={onToolbarSearchChange}
            className={classes.toolbarSearchField}
            InputProps={{
              endAdornment: <SearchIcon sx={searchIconSx} />,
            }}
          />
          {showToolbarResults && toolbarSearch.length >= 2 && (
            <Box className={classes.toolbarSearchDropdown}>
              {filteredToolbarIncidents.length > 0 ? (
                filteredToolbarIncidents.map((inc) => (
                  <Box
                    key={inc.id}
                    className={classes.toolbarSearchResultItem}
                    onClick={() => onSelectToolbarIncident(inc)}
                  >
                    <Box>
                      <Typography sx={resultNumberSx}>{inc.number}</Typography>
                      <Typography sx={resultDescSx}>{inc.shortDescription || ''}</Typography>
                    </Box>
                    <Chip
                      label={(inc.status || '').replace(/_/g, ' ')}
                      size='small'
                      variant='outlined'
                      sx={resultChipSx}
                    />
                  </Box>
                ))
              ) : (
                <Typography sx={noResultsSx}>No incidents found</Typography>
              )}
            </Box>
          )}
        </Box>
      </ClickAwayListener>
      <Box className={classes.toolbarActions}>
        {isMobile ? (
          <>
            <Tooltip title='Save'>
              <IconButton size='small' onClick={onSave}>
                <SaveIcon fontSize='small' sx={mobileIconSx} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Save & Close'>
              <IconButton size='small' onClick={onSaveAndClose}>
                <SaveAsIcon fontSize='small' sx={mobileIconSx} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Add Time'>
              <IconButton size='small' onClick={onAddTime}>
                <AccessTimeIcon fontSize='small' sx={mobileIconSx} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant='outlined'
              size='small'
              sx={buttonSx}
              startIcon={<SaveIcon sx={btnIconSmSx} />}
              onClick={onSave}
            >
              Save
            </Button>
            <Button
              variant='outlined'
              size='small'
              sx={buttonSx}
              startIcon={<SaveAsIcon sx={btnIconSmSx} />}
              onClick={onSaveAndClose}
            >
              Save & Close
            </Button>
            <Button
              variant='outlined'
              size='small'
              sx={buttonSx}
              startIcon={<AccessTimeIcon sx={btnIconSmSx} />}
              onClick={onAddTime}
            >
              Add Time
            </Button>
          </>
        )}
        <Tooltip title='Settings'>
          <IconButton size='small' onClick={onSettingsOpen}>
            <SettingsIcon fontSize='small' sx={mobileIconSx} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={onSettingsClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              onSettingsClose();
              window.open(`${window.location.origin}${AdminPath.PROFILE}`, '_blank');
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Your Profile</ListItemText>
          </MenuItem>
          <Divider />
          {isAdmin && (
            <>
              <MenuItem
                onClick={() => {
                  onSettingsClose();
                  window.open(`${window.location.origin}/app/user/dashboard`, '_blank');
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>User Page</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onSettingsClose();
                  window.open(`${window.location.origin}/app/consultant/dashboard`, '_blank');
                }}
              >
                <ListItemIcon>
                  <BusinessCenterIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>Consultant Page</ListItemText>
              </MenuItem>
            </>
          )}
          <Divider />
          <MenuItem onClick={onSettingsClose}>
            <ListItemIcon>
              <HelpOutlineIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Help & Support</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onSettingsClose();
              onLogout();
              window.close();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
        <Tooltip title='Close window'>
          <IconButton size='small' onClick={onCloseWindow}>
            <CloseIcon fontSize='small' sx={mobileIconSx} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TopToolbar;
