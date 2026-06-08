import React, { memo } from 'react';
import { Box, TextField } from '@serviceops/component';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { createAppStyles } from '@serviceops/theme';
import { DSSearchFieldProps } from './SearchField.types';

const useStyles = createAppStyles((theme) => {
  void theme;
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      flexShrink: 0,
      width: '160px',
      '& .MuiOutlinedInput-root': {
        height: '30px',
        fontSize: '0.8rem',
        backgroundColor: (theme as unknown as { palette: { common: { white: string } } }).palette
          .common.white,
        borderRadius: '6px',
      },
      '& .MuiInputBase-input': {
        padding: '4px 6px',
        fontSize: '0.8rem',
      },
      '& .MuiInputBase-input::placeholder': {
        opacity: 0.7,
      },
      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        fontSize: '1.1rem',
        color: (theme as unknown as { palette: { text: { secondary: string } } }).palette.text
          .secondary,
      },
    },
  };
}, {});

/**
 * Shared search field used by the GenericPanel accordions (e.g. the
 * "Default Approved Estimates (hours)" accordion).
 *
 * Behavior of the right-hand adornment:
 *   - Field is empty          -> search icon
 *   - User is typing          -> loading spinner
 *   - Results are in          -> small "X" cancel icon (clears the field)
 */
const SearchFieldComponent: React.FC<DSSearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  size = 'small',
  isLoading = false,
  className,
  sx,
}) => {
  const { cx, classes } = useStyles();
  const hasValue = value.length > 0;

  return (
    <Box className={classes.container} sx={sx}>
      <TextField
        size={size}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cx(classes.input, className)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                {isLoading ? (
                  <CircularProgress
                    size={14}
                    thickness={5}
                    sx={{ color: 'text.secondary', mr: 0.25 }}
                    aria-label='Searching'
                  />
                ) : hasValue ? (
                  <IconButton
                    size='small'
                    edge='end'
                    aria-label='Clear search'
                    onClick={() => onChange('')}
                    sx={{ p: 0.25, color: 'text.secondary' }}
                  >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                ) : (
                  <SearchIcon fontSize='small' sx={{ color: 'text.secondary' }} />
                )}
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
};

export const SearchField = memo(SearchFieldComponent);
SearchField.displayName = 'SearchField';

export default SearchField;
