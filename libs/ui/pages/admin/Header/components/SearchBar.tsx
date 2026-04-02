import { Typography, ClickAwayListener, Chip } from '@mui/material';
import { Box, TextField } from '@serviceops/component';
import { IIncident } from '@serviceops/interfaces';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickAway: () => void;
  showResults: boolean;
  incidents: IIncident[];
  onSelectIncident: (incident: IIncident) => void;
  className?: string;
  wrapperClassName?: string;
  dropdownClassName?: string;
  noResultsClassName?: string;
}

const SearchBar = ({
  value,
  onChange,
  onClickAway,
  showResults,
  incidents,
  onSelectIncident,
  className,
  wrapperClassName,
  dropdownClassName,
  noResultsClassName,
}: SearchBarProps) => {
  const renderDropdown = () => {
    if (!showResults || value.length < 2) return null;
    return (
      <Box className={dropdownClassName}>
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <Box
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
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
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                  {incident.number}
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
                  {incident.shortDescription || ''}
                </Typography>
              </Box>
              <Chip
                label={(incident.status || '').replace(/_/g, ' ')}
                size='small'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '20px', flexShrink: 0 }}
              />
            </Box>
          ))
        ) : (
          <Typography className={noResultsClassName}>No tickets found</Typography>
        )}
      </Box>
    );
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <Box className={wrapperClassName}>
        <TextField
          placeholder='Ticket Number'
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
