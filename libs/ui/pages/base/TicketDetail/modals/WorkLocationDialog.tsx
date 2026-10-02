import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Modal,
  Typography,
  TextField,
  Chip,
} from '../../../../components';
import { alpha, darken, Autocomplete, ListItemText,  InputAdornment,
  CircularProgress, } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { useSharedUserWorkLocations } from '../../Configuration/hooks/useSharedUserWorkLocations';
import { useFieldError } from '@serviceops/hooks';
import { UpdateTicketFn, TicketEntity } from '../types/ticketDetail.types';

const LOCATION_ACCENT = '#7c3aed';

interface WorkLocationDialogProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

interface LocationData {
  name: string;
  city: string;
  state: string;
  country: string;
  postCode: string;
  timezone: string;
}

const WorkLocationDialog = ({
  open,
  onClose,
  incident,
  onUpdateTicket,
  onSuccess,
}: WorkLocationDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { workLocations, isLoading: locationsLoading } = useSharedUserWorkLocations();

  // Build location map for quick lookup
  const locationMap = useMemo(() => {
    const map = new Map<string, LocationData>();
    workLocations.forEach((loc) => {
      map.set(loc.workLocation.toLowerCase(), {
        name: loc.workLocation,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        postCode: loc.postCode,
        timezone: loc.timezone,
      });
    });
    return map;
  }, [workLocations]);

  // Current values from incident (for editing existing)
  const currentLocation = useMemo<LocationData>(() => {
    const locName = incident.callerLocation || '';
    if (locName && locationMap.has(locName.toLowerCase())) {
      return locationMap.get(locName.toLowerCase())!;
    }
    return {
      name: locName,
      city: '',
      state: '',
      country: '',
      postCode: '',
      timezone: '',
    };
  }, [incident.callerLocation, locationMap]);

  // Filtered options based on search
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return workLocations.map((l) => l.workLocation);
    return workLocations
      .filter(
        (l) =>
          l.workLocation.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q),
      )
      .map((l) => l.workLocation);
  }, [workLocations, searchQuery]);

  // Form state - initialized from current location
  const [selectedLocation, setSelectedLocation] = useState<string>(currentLocation.name);
  const [city, setCity] = useState(currentLocation.city);
  const [state, setState] = useState(currentLocation.state);
  const [country, setCountry] = useState(currentLocation.country);
  const [postCode, setPostCode] = useState(currentLocation.postCode);
  const [timezone, setTimezone] = useState(currentLocation.timezone);

  // Reset form when dialog opens with a new incident
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedLocation(currentLocation.name);
      setCity(currentLocation.city);
      setState(currentLocation.state);
      setCountry(currentLocation.country);
      setPostCode(currentLocation.postCode);
      setTimezone(currentLocation.timezone);
    }
  }, [open, currentLocation]);

  // Auto-fill fields when a work location is selected
  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    setSearchQuery(locationName);

    const found = locationMap.get(locationName.toLowerCase());
    if (found) {
      setCity(found.city);
      setState(found.state);
      setCountry(found.country);
      setPostCode(found.postCode);
      setTimezone(found.timezone);
    }
  };

  const handleClearLocation = () => {
    setSelectedLocation('');
    setSearchQuery('');
    setCity('');
    setState('');
    setCountry('');
    setPostCode('');
    setTimezone('');
  };

  const reqError = useFieldError();
  const fieldError = reqError(isSaving && !selectedLocation, 'Work location is required');

  const handleSave = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    try {
      await onUpdateTicket({
        id: incident.id,
        data: {
          callerLocation: selectedLocation,
        },
      }).unwrap();
      onSuccess();
    } catch {
      // error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  const title = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LocationOnIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>
          Work Location
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
          Select a work location to auto-fill address details
        </Typography>
      </Box>
    </Box>
  );

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Box
        className='actionButton'
        onClick={onClose}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 0.75,
          borderRadius: 1,
          border: '1px solid rgba(0,0,0,0.12)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 500,
          color: 'text.primary',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        Cancel
      </Box>
      <Box
        className='actionButton'
        onClick={handleSave}
        disabled={isSaving || !selectedLocation}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 0.75,
          borderRadius: 1,
          border: 'none',
          cursor: isSaving || !selectedLocation ? 'not-allowed' : 'pointer',
          fontSize: '0.82rem',
          fontWeight: 500,
          color: '#fff',
          bgcolor: isSaving || !selectedLocation ? 'rgba(124,58,237,0.4)' : LOCATION_ACCENT,
          opacity: isSaving || !selectedLocation ? 0.6 : 1,
          '&:hover': {
            bgcolor:
              isSaving || !selectedLocation
                ? 'rgba(124,58,237,0.4)'
                : darken(LOCATION_ACCENT, 0.12),
          },
        }}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Box>
    </Box>
  );

  const fieldBaseSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(LOCATION_ACCENT, 0.4),
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: LOCATION_ACCENT,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: LOCATION_ACCENT,
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${darken(LOCATION_ACCENT, 0.18)} 0%, ${LOCATION_ACCENT} 100%)`}
      headerTextColor='#fff'
      title={title}
      footer={footer}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Work Location Search */}
        <Box sx={fieldBaseSx}>
          <Autocomplete
            options={filteredOptions}
            value={selectedLocation || null}
            onInputChange={(_, newInput) => setSearchQuery(newInput)}
            onChange={(_, newValue) => {
              if (newValue) {
                handleLocationSelect(newValue);
              }
            }}
            loading={locationsLoading}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
            renderOption={(props, option) => {
              const loc = workLocations.find((w) => w.workLocation === option);
              return (
                <li {...props} key={option}>
                  <LocationOnIcon
                    sx={{ fontSize: 18, mr: 1, color: 'text.secondary', flexShrink: 0 }}
                  />
                  <ListItemText
                    primary={option}
                    secondary={
                      loc ? `${loc.city}${loc.country ? `, ${loc.country}` : ''}`.trim() : undefined
                    }
                  />
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Work Location *'
                placeholder='Search for a work location...'
                error={!!fieldError}
                helperText={fieldError || 'Start typing to search from configured work locations'}
                fullWidth
                size='small'
                slotProps={{
                  input: {
                    ...params.inputProps,
                    endAdornment: (
                      <>
                        {locationsLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                        {selectedLocation && !locationsLoading ? (
                          <InputAdornment position='end'>
                            <ClearIcon
                              onClick={handleClearLocation}
                              sx={{
                                fontSize: 18,
                                color: 'text.secondary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          </InputAdornment>
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            freeSolo
            handleHomeEndKeys
          />
        </Box>

        {/* Auto-filled fields */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* City */}
          <Box sx={fieldBaseSx}>
            <TextField
              label='City'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  endAdornment: city ? (
                    <InputAdornment position='end'>
                      <AutoFixNormalIcon
                        sx={{ fontSize: 16, color: LOCATION_ACCENT, opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>

          {/* State */}
          <Box sx={fieldBaseSx}>
            <TextField
              label='State / Province'
              value={state}
              onChange={(e) => setState(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  endAdornment: state ? (
                    <InputAdornment position='end'>
                      <AutoFixNormalIcon
                        sx={{ fontSize: 16, color: LOCATION_ACCENT, opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>

          {/* Country */}
          <Box sx={fieldBaseSx}>
            <TextField
              label='Country'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  endAdornment: country ? (
                    <InputAdornment position='end'>
                      <AutoFixNormalIcon
                        sx={{ fontSize: 16, color: LOCATION_ACCENT, opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>

          {/* Post Code */}
          <Box sx={fieldBaseSx}>
            <TextField
              label='Post Code'
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  endAdornment: postCode ? (
                    <InputAdornment position='end'>
                      <AutoFixNormalIcon
                        sx={{ fontSize: 16, color: LOCATION_ACCENT, opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>

          {/* Timezone */}
          <Box sx={{ ...fieldBaseSx, gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <TextField
              label='Timezone'
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  endAdornment: timezone ? (
                    <InputAdornment position='end'>
                      <AutoFixNormalIcon
                        sx={{ fontSize: 16, color: LOCATION_ACCENT, opacity: 0.7 }}
                      />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>
        </Box>

        {/* Selected location chips */}
        {selectedLocation && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size='small'
              icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
              label={selectedLocation}
              sx={{
                bgcolor: alpha(LOCATION_ACCENT, 0.1),
                color: LOCATION_ACCENT,
                fontWeight: 500,
              }}
            />
            {city && (
              <Chip
                size='small'
                label={`${city}${state ? `, ${state}` : ''}`}
                sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}
              />
            )}
            {country && <Chip size='small' label={country} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }} />}
            {timezone && (
              <Chip
                size='small'
                label={timezone}
                sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontFamily: 'monospace' }}
              />
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default WorkLocationDialog;
