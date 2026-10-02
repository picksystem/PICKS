import { ClickAwayListener, Chip } from '@mui/material';
import { Typography, Box, TextField } from '@serviceops/component';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { SearchBarProps, SearchResult } from './util';

const SearchBar = ({
  value,
  onChange,
  onClickAway,
  showResults,
  searchResults,
  onSelectResult,
  className,
  wrapperClassName,
  dropdownClassName,
  noResultsClassName,
}: SearchBarProps) => {
  const renderDropdown = () => {
    if (!showResults || value.length < 2) return null;

    if (searchResults.length === 0) {
      return (
        <Box className={dropdownClassName}>
          <Typography className={noResultsClassName}>No results found</Typography>
        </Box>
      );
    }

    return (
      <Box className={dropdownClassName}>
        {searchResults.map((result: SearchResult) => {
          if (result.type === 'ticket') {
            return (
              <Box
                key={`ticket-${result.id}`}
                onClick={() => onSelectResult(result)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}
                    >
                      {result.number}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '160px',
                      }}
                    >
                      {result.shortDescription || ''}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label='Ticket'
                  size='small'
                  variant='outlined'
                  sx={{ fontSize: '0.65rem', height: '20px', flexShrink: 0, color: 'primary.main' }}
                />
              </Box>
            );
          }

          // KB Article result
          return (
            <Box
              key={`kb-${result.id}`}
              onClick={() => onSelectResult(result)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ArticleIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                    {result.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '160px',
                    }}
                  >
                    {result.description || '(no description)'}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label='KB'
                size='small'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '20px', flexShrink: 0, color: 'success.main' }}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <Box className={wrapperClassName}>
        <TextField
          placeholder='Search tickets & knowledge base'
          icon={<SearchIcon />}
          iconAlignment='right'
          value={value}
          onChange={onChange}
          className={className}
        />
        {renderDropdown()}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
