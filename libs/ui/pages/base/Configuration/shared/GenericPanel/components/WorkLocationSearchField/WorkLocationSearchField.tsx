import { Box, Typography, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useRef, useEffect } from 'react';

export interface NominatimResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    suburb?: string;
    neighbourhood?: string;
    postcode?: string;
  };
}

const ACCENT_WL = '#be185d';

async function fetchFromPhoton(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  const params = new URLSearchParams({ q: query, limit: '8', lang: 'en' });

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);

  const data = await res.json();
  return (data.features ?? []).map((f: any) => {
    const p = f.properties ?? {};
    const [lon, lat] = f.geometry?.coordinates ?? [0, 0];

    return {
      place_id: String(p.osm_id ?? Math.random()),
      display_name: `${p.name || ''}${p.city && p.city !== p.name ? `, ${p.city}` : ''}`,
      lat: String(lat),
      lon: String(lon),
      type: p.osm_value ?? p.type ?? '',
      address: {
        city: p.city || p.town || p.village || p.name || undefined,
        suburb: p.suburb || undefined,
        neighbourhood: undefined,
        state: p.state || undefined,
        country: p.country || undefined,
        postcode: p.postcode || undefined,
      },
    };
  });
}

function getTimezoneFromCoords(lat: number, lon: number): string {
  const commonTimezones: Record<string, string[]> = {
    'America/New_York': [
      'New York',
      'Washington',
      'Boston',
      'Philadelphia',
      'Miami',
      'Atlanta',
      'Charlotte',
      'Baltimore',
      'Orlando',
      'Tampa',
    ],
    'America/Los_Angeles': [
      'Los Angeles',
      'San Francisco',
      'Seattle',
      'San Diego',
      'Portland',
      'Las Vegas',
      'Phoenix',
      'Denver',
    ],
    'America/Chicago': [
      'Chicago',
      'Houston',
      'Dallas',
      'Austin',
      'San Antonio',
      'Minneapolis',
      'Detroit',
      'St. Louis',
      'Milwaukee',
    ],
    'America/Toronto': [
      'Toronto',
      'Ottawa',
      'Montreal',
      'Vancouver',
      'Calgary',
      'Edmonton',
      'Winnipeg',
      'Halifax',
    ],
    'Europe/London': [
      'London',
      'Manchester',
      'Birmingham',
      'Leeds',
      'Glasgow',
      'Liverpool',
      'Edinburgh',
      'Bristol',
    ],
    'Europe/Paris': [
      'Paris',
      'Lyon',
      'Marseille',
      'Toulouse',
      'Nice',
      'Nantes',
      'Strasbourg',
      'Bordeaux',
    ],
    'Europe/Berlin': [
      'Berlin',
      'Munich',
      'Hamburg',
      'Frankfurt',
      'Cologne',
      'Stuttgart',
      'Düsseldorf',
      'Leipzig',
    ],
    'Europe/Madrid': [
      'Madrid',
      'Barcelona',
      'Valencia',
      'Seville',
      'Zaragoza',
      'Malaga',
      'Bilbao',
      'Murcia',
    ],
    'Europe/Rome': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologna', 'Genoa', 'Palermo'],
    'Asia/Tokyo': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto'],
    'Asia/Shanghai': [
      'Shanghai',
      'Beijing',
      'Guangzhou',
      'Shenzhen',
      'Hong Kong',
      'Chengdu',
      'Hangzhou',
      'Wuhan',
    ],
    'Asia/Singapore': ['Singapore'],
    'Asia/Dubai': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman'],
    'Asia/Kolkata': [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Chennai',
      'Hyderabad',
      'Kolkata',
      'Pune',
      'Ahmedabad',
    ],
    'Australia/Sydney': [
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Perth',
      'Adelaide',
      'Canberra',
      'Gold Coast',
    ],
    'Pacific/Auckland': [
      'Auckland',
      'Wellington',
      'Christchurch',
      'Hamilton',
      'Tauranga',
      'Napier',
    ],
    'Africa/Johannesburg': [
      'Johannesburg',
      'Cape Town',
      'Durban',
      'Pretoria',
      'Port Elizabeth',
      'Bloemfontein',
    ],
    'Africa/Lagos': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Benin City', 'Port Harcourt'],
    'America/Mexico_City': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León'],
    'America/Sao_Paulo': [
      'São Paulo',
      'Rio de Janeiro',
      'Brasília',
      'Salvador',
      'Fortaleza',
      'Belo Horizonte',
    ],
    'America/Buenos_Aires': [
      'Buenos Aires',
      'Córdoba',
      'Rosario',
      'Mendoza',
      'La Plata',
      'Tucumán',
    ],
    'Asia/Seoul': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon'],
    'Asia/Bangkok': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Hat Yai'],
    'Asia/Jakarta': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar'],
    'Asia/Manila': ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga'],
    'Asia/Kuala_Lumpur': [
      'Kuala Lumpur',
      'Penang',
      'Johor Bahru',
      'Malacca',
      'Kota Kinabalu',
      'Kuching',
    ],
  };

  const city = (arguments[2] as string) || '';
  const country = (arguments[3] as string) || '';

  for (const [tz, cities] of Object.entries(commonTimezones)) {
    if (
      cities.some(
        (c) =>
          city.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(city.toLowerCase()),
      )
    ) {
      return tz;
    }
  }

  const latNum = parseFloat(String(lat));
  if (isNaN(latNum)) return 'UTC';

  if (latNum >= -90 && latNum <= 90 && lon >= -180 && lon <= 180) {
    if (lon >= -10 && lon <= 40 && latNum >= 35 && latNum <= 70) return 'Europe/London';
    if (lon >= -10 && lon <= 40 && latNum >= 25 && latNum <= 60) return 'Europe/Paris';
    if (lon >= -180 && lon <= 180) {
      if (latNum >= 24 && latNum <= 50 && lon >= -130 && lon <= -65) return 'America/New_York';
      if (latNum >= 25 && latNum <= 49 && lon >= -125 && lon <= -100) return 'America/Los_Angeles';
      if (latNum >= 20 && latNum <= 50 && lon >= 100 && lon <= 145) return 'Asia/Tokyo';
      if (latNum >= -10 && latNum <= 30 && lon >= 60 && lon <= 100) return 'Asia/Kolkata';
    }
  }

  return 'UTC';
}

export interface WorkLocationSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: {
    city: string;
    state: string;
    country: string;
    timezone: string;
    lat: string;
    lon: string;
  }) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const WorkLocationSearchField = ({
  label,
  value,
  onChange,
  onLocationSelect,
  required,
  error,
  helperText,
}: WorkLocationSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (newInputValue.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      fetchFromPhoton(newInputValue, abortControllerRef.current.signal)
        .then((results) => {
          setOptions(results);
          setOpen(results.length > 0);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Location search error:', error);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  };

  const handleSelect = (location: NominatimResult) => {
    const cityName =
      location.address?.city || location.address?.town || location.address?.village || '';
    const stateName = location.address?.state || '';
    const countryName = location.address?.country || '';
    const timezone = getTimezoneFromCoords(parseFloat(location.lat), parseFloat(location.lon));

    setInputValue(location.display_name);
    setOpen(false);
    setOptions([]);
    onChange(location.display_name);

    if (onLocationSelect) {
      onLocationSelect({
        city: cityName,
        state: stateName,
        country: countryName,
        timezone,
        lat: location.lat,
        lon: location.lon,
      });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setOpen(false);
    onChange('');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={label}
        placeholder='Search for a city...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          handleInputChange(e.target.value);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        onFocus={() => {
          if (inputValue.length >= 2 && options.length > 0) {
            setOpen(true);
          }
        }}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        size='small'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {loading ? (
                    <CircularProgress size={16} />
                  ) : inputValue ? (
                    <ClearIcon
                      onClick={handleClear}
                      sx={{
                        fontSize: 18,
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': { color: 'text.primary' },
                      }}
                    />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          },
        }}
      />

      {open && options.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0.5,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {options.map((option) => (
              <ListItem key={option.place_id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: alpha(ACCENT_WL || '#1976d2', 0.08),
                    },
                  }}
                >
                  <LocationOnIcon
                    sx={{ fontSize: 18, mr: 1, color: 'text.secondary', flexShrink: 0 }}
                  />
                  <ListItemText
                    primary={option.display_name}
                    primaryTypographyProps={{
                      fontSize: '0.84rem',
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default WorkLocationSearchField;
