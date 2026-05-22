// Location search using Photon (free) or Geoapify (with API key)
// Language search using REST Countries API (free)

import {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
  IConfigWorkLocationAssociation,
} from '@serviceops/interfaces';

export interface WorkingTimesPanelProps {
  locations: IConfigWorkLocation[];
  workingTimes: IConfigWorkLocationWorkingTime[];
  defaultLocationId: string | null;
  onSave: (times: IConfigWorkLocationWorkingTime[]) => void;
}

export interface ShiftsPanelProps {
  locations: IConfigWorkLocation[];
  shifts: IConfigWorkLocationShift[];
  defaultLocationId: string | null;
  onSave: (shifts: IConfigWorkLocationShift[]) => void;
}

export interface AssocProfilesPanelProps {
  locations: IConfigWorkLocation[];
  associatedProfiles: IConfigWorkLocationAssociatedProfile[];
  defaultLocationId: string | null;
  onSave: (profiles: IConfigWorkLocationAssociatedProfile[]) => void;
}

export interface WorkLocationAssociationsPanelProps {
  locations: IConfigWorkLocation[];
  associations: IConfigWorkLocationAssociation[];
  defaultLocationId: string | null;
  onSave: (associations: IConfigWorkLocationAssociation[]) => void;
}

export interface NominatimResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  name: string;
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

export interface LanguageOption {
  value: string;
  label: string;
  nativeName?: string;
}

// Timezone info extracted from lat/lon
export interface TimezoneInfo {
  timezone: string;
  label: string;
  offset: string;
}

// Map lat/lon to IANA timezone using region-based lookup
// Returns the most appropriate timezone for the given coordinates
export async function getTimezoneForLocation(
  lat: string,
  lon: string,
  signal?: AbortSignal,
): Promise<{ timezone: string; label: string; offset: string } | null> {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) return null;

  // Region detection based on coordinates
  // Timezone region lookup table
  const regionTimezones: Array<{
    region: string;
    latRange: [number, number];
    lonRange: [number, number];
    timezone: string;
    label: string;
    offset: string;
  }> = [
    // Asia
    {
      region: 'India',
      latRange: [6, 36],
      lonRange: [68, 97],
      timezone: 'Asia/Kolkata',
      label: 'India (UTC+5:30)',
      offset: '+05:30',
    },
    {
      region: 'China',
      latRange: [18, 54],
      lonRange: [73, 135],
      timezone: 'Asia/Shanghai',
      label: 'Beijing (UTC+8)',
      offset: '+08:00',
    },
    {
      region: 'Japan',
      latRange: [24, 46],
      lonRange: [123, 146],
      timezone: 'Asia/Tokyo',
      label: 'Tokyo (UTC+9)',
      offset: '+09:00',
    },
    {
      region: 'SE Asia',
      latRange: [-10, 28],
      lonRange: [95, 145],
      timezone: 'Asia/Bangkok',
      label: 'Bangkok (UTC+7)',
      offset: '+07:00',
    },
    {
      region: 'Middle East',
      latRange: [12, 42],
      lonRange: [26, 63],
      timezone: 'Asia/Dubai',
      label: 'Dubai (UTC+4)',
      offset: '+04:00',
    },
    {
      region: 'Russia West',
      latRange: [40, 82],
      lonRange: [20, 60],
      timezone: 'Europe/Moscow',
      label: 'Moscow (UTC+3)',
      offset: '+03:00',
    },
    {
      region: 'Russia East',
      latRange: [40, 82],
      lonRange: [60, 180],
      timezone: 'Asia/Shanghai',
      label: 'Moscow (UTC+7)',
      offset: '+07:00',
    },

    // Europe
    {
      region: 'UK',
      latRange: [49, 61],
      lonRange: [-8, 2],
      timezone: 'Europe/London',
      label: 'London (UTC+0)',
      offset: '+00:00',
    },
    {
      region: 'Europe Central',
      latRange: [35, 55],
      lonRange: [-10, 30],
      timezone: 'Europe/Paris',
      label: 'Paris (UTC+1)',
      offset: '+01:00',
    },
    {
      region: 'Europe East',
      latRange: [45, 70],
      lonRange: [15, 30],
      timezone: 'Europe/Berlin',
      label: 'Berlin (UTC+1)',
      offset: '+01:00',
    },

    // Americas
    {
      region: 'US West',
      latRange: [24, 50],
      lonRange: [-125, -100],
      timezone: 'America/Los_Angeles',
      label: 'Los Angeles (UTC-8)',
      offset: '-08:00',
    },
    {
      region: 'US Central',
      latRange: [24, 50],
      lonRange: [-100, -85],
      timezone: 'America/Chicago',
      label: 'Chicago (UTC-6)',
      offset: '-06:00',
    },
    {
      region: 'US East',
      latRange: [24, 50],
      lonRange: [-85, -65],
      timezone: 'America/New_York',
      label: 'New York (UTC-5)',
      offset: '-05:00',
    },
    {
      region: 'Canada Central',
      latRange: [49, 60],
      lonRange: [-120, -85],
      timezone: 'America/Edmonton',
      label: 'Edmonton (UTC-7)',
      offset: '-07:00',
    },
    {
      region: 'Canada East',
      latRange: [43, 60],
      lonRange: [-85, -52],
      timezone: 'America/Toronto',
      label: 'Toronto (UTC-5)',
      offset: '-05:00',
    },
    {
      region: 'South America West',
      latRange: [-55, 12],
      lonRange: [-82, -35],
      timezone: 'America/Sao_Paulo',
      label: 'Brasilia (UTC-3)',
      offset: '-03:00',
    },

    // Africa
    {
      region: 'South Africa',
      latRange: [-35, -1],
      lonRange: [10, 40],
      timezone: 'Africa/Johannesburg',
      label: 'Johannesburg (UTC+2)',
      offset: '+02:00',
    },
    {
      region: 'North Africa',
      latRange: [15, 37],
      lonRange: [-18, 40],
      timezone: 'Africa/Cairo',
      label: 'Cairo (UTC+2)',
      offset: '+02:00',
    },

    // Oceania
    {
      region: 'Australia East',
      latRange: [-45, -10],
      lonRange: [145, 155],
      timezone: 'Australia/Sydney',
      label: 'Sydney (UTC+10)',
      offset: '+10:00',
    },
    {
      region: 'Australia West',
      latRange: [-45, -10],
      lonRange: [110, 130],
      timezone: 'Australia/Perth',
      label: 'Perth (UTC+8)',
      offset: '+08:00',
    },
    {
      region: 'New Zealand',
      latRange: [-47, -34],
      lonRange: [165, 180],
      timezone: 'Pacific/Auckland',
      label: 'Auckland (UTC+12)',
      offset: '+12:00',
    },

    // Default fallback based on longitude
    {
      region: 'Pacific',
      latRange: [-90, 90],
      lonRange: [165, 180],
      timezone: 'Pacific/Auckland',
      label: 'Auckland (UTC+12)',
      offset: '+12:00',
    },
    {
      region: 'Default West',
      latRange: [-90, 90],
      lonRange: [-180, -100],
      timezone: 'America/Los_Angeles',
      label: 'Pacific Time (UTC-8)',
      offset: '-08:00',
    },
    {
      region: 'Default East',
      latRange: [-90, 90],
      lonRange: [60, 180],
      timezone: 'Asia/Shanghai',
      label: 'Beijing (UTC+8)',
      offset: '+08:00',
    },
    {
      region: 'Default Mid',
      latRange: [-90, 90],
      lonRange: [-10, 60],
      timezone: 'Europe/London',
      label: 'London (UTC+0)',
      offset: '+00:00',
    },
  ];

  // Find matching timezone
  for (const entry of regionTimezones) {
    const [latMin, latMax] = entry.latRange;
    const [lonMin, lonMax] = entry.lonRange;

    if (latNum >= latMin && latNum <= latMax && lonNum >= lonMin && lonNum <= lonMax) {
      return {
        timezone: entry.timezone,
        label: entry.label,
        offset: entry.offset,
      };
    }
  }

  // Fallback based on longitude only
  const offsetHours = Math.round(lonNum / 15);
  const sign = offsetHours >= 0 ? '+' : '';
  const fallbackTz = `Etc/GMT${offsetHours <= 0 ? '+' : '-'}${Math.abs(offsetHours)}`;

  return {
    timezone: fallbackTz,
    label: `UTC${sign}${offsetHours}`,
    offset: `${sign}${Math.abs(offsetHours)}:00`,
  };
}

// Common timezone list for fallback/search
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (UTC-10)', offset: '-10:00' },
  { value: 'America/Anchorage', label: 'Alaska (UTC-9)', offset: '-09:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)', offset: '-08:00' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)', offset: '-07:00' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)', offset: '-06:00' },
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)', offset: '-05:00' },
  { value: 'America/Sao_Paulo', label: 'Brasilia (UTC-3)', offset: '-03:00' },
  { value: 'Atlantic/Azores', label: 'Azores (UTC-1)', offset: '-01:00' },
  { value: 'Europe/London', label: 'London (UTC+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)', offset: '+01:00' },
  { value: 'Africa/Cairo', label: 'Cairo (UTC+2)', offset: '+02:00' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3)', offset: '+03:00' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)', offset: '+04:00' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)', offset: '+05:30' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (UTC+6)', offset: '+06:00' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)', offset: '+07:00' },
  { value: 'Asia/Shanghai', label: 'Beijing (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12)', offset: '+12:00' },
];

export async function searchTimezones(
  query: string,
  signal?: AbortSignal,
): Promise<TimezoneOption[]> {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return COMMON_TIMEZONES.slice(0, 10);
  }

  return COMMON_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(trimmed) ||
      tz.value.toLowerCase().includes(trimmed) ||
      tz.offset.includes(trimmed),
  ).slice(0, 10);
}

// Photon (Komoot) — free, no key, OpenStreetMap data, good global coverage
async function fetchFromPhoton(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  const params = new URLSearchParams({ q: query, limit: '8', lang: 'en' });

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);

  const data = await res.json();
  return (data.features ?? []).map((f: any) => {
    const p = f.properties ?? {};
    const [lon, lat] = f.geometry?.coordinates ?? [0, 0];

    // Get the best name for the location
    const locationName =
      p.name || p.city || p.town || p.village || p.suburb || p.county || p.state || p.country || '';

    const parts: string[] = [];
    if (p.name) parts.push(p.name);
    if (p.city && p.city !== p.name) parts.push(p.city);
    if (p.state) parts.push(p.state);
    if (p.country) parts.push(p.country);

    return {
      place_id: String(p.osm_id ?? Math.random()),
      display_name: parts.join(', '),
      name: locationName,
      lat: String(lat),
      lon: String(lon),
      type: p.osm_value ?? p.type ?? '',
      address: {
        city: p.city || undefined,
        suburb: p.osm_value === 'suburb' ? p.name : p.suburb || undefined,
        neighbourhood: p.osm_value === 'neighbourhood' ? p.name : undefined,
        state: p.state || undefined,
        country: p.country || undefined,
        postcode: p.postcode || undefined,
      },
    };
  });
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<NominatimResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    return await fetchFromPhoton(trimmed, signal);
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

// REST Countries API — free, no key, returns all countries with languages
async function fetchLanguagesFromRestCountries(
  query: string,
  signal?: AbortSignal,
): Promise<LanguageOption[]> {
  // Search countries by name, filter to those whose languages contain the query
  const params = new URLSearchParams({ fields: 'languages,name' });
  const res = await fetch(`https://restcountries.com/v3.1/all?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`REST Countries ${res.status}`);

  const data = await res.json();
  const q = query.toLowerCase();
  const seen = new Map<string, LanguageOption>();

  for (const country of data as any[]) {
    const langs: Record<string, { common: string }> = country.languages ?? {};
    for (const [code, langObj] of Object.entries(langs)) {
      const langName = typeof langObj === 'string' ? langObj : (langObj?.common ?? '');
      if (langName && langName.toLowerCase().includes(q)) {
        if (!seen.has(code)) {
          seen.set(code, {
            value: code,
            label: `${langName} (${code})`,
            nativeName: langName,
          });
        }
      }
    }
  }

  return Array.from(seen.values()).slice(0, 20);
}

// Fallback static list of common languages
const FALLBACK_LANGUAGES: LanguageOption[] = [
  { value: 'en', label: 'English (en)', nativeName: 'English' },
  { value: 'ar', label: 'Arabic (ar)', nativeName: 'العربية' },
  { value: 'bn', label: 'Bengali (bn)', nativeName: 'বাংলা' },
  { value: 'zh', label: 'Chinese (zh)', nativeName: '中文' },
  { value: 'fr', label: 'French (fr)', nativeName: 'Français' },
  { value: 'de', label: 'German (de)', nativeName: 'Deutsch' },
  { value: 'gu', label: 'Gujarati (gu)', nativeName: 'ગુજરાતી' },
  { value: 'hi', label: 'Hindi (hi)', nativeName: 'हिन्दी' },
  { value: 'id', label: 'Indonesian (id)', nativeName: 'Bahasa Indonesia' },
  { value: 'ja', label: 'Japanese (ja)', nativeName: '日本語' },
  { value: 'ko', label: 'Korean (ko)', nativeName: '한국어' },
  { value: 'ms', label: 'Malay (ms)', nativeName: 'Bahasa Melayu' },
  { value: 'mr', label: 'Marathi (mr)', nativeName: 'मराठी' },
  { value: 'pt', label: 'Portuguese (pt)', nativeName: 'Português' },
  { value: 'ru', label: 'Russian (ru)', nativeName: 'Русский' },
  { value: 'es', label: 'Spanish (es)', nativeName: 'Español' },
  { value: 'ta', label: 'Tamil (ta)', nativeName: 'தமிழ்' },
  { value: 'te', label: 'Telugu (te)', nativeName: 'తెలుగు' },
  { value: 'th', label: 'Thai (th)', nativeName: 'ไทย' },
  { value: 'tr', label: 'Turkish (tr)', nativeName: 'Türkçe' },
  { value: 'uk', label: 'Ukrainian (uk)', nativeName: 'Українська' },
  { value: 'vi', label: 'Vietnamese (vi)', nativeName: 'Tiếng Việt' },
];

export async function searchLanguages(
  query: string,
  signal?: AbortSignal,
): Promise<LanguageOption[]> {
  const trimmed = query.trim();

  if (trimmed.length < 1) {
    return FALLBACK_LANGUAGES.slice(0, 10);
  }

  try {
    // Fetch from REST Countries API
    const results = await fetchLanguagesFromRestCountries(trimmed, signal);
    if (results.length > 0) return results;
  } catch (error) {
    console.error('Language search error:', error);
  }

  // Fallback: filter static list
  const q = trimmed.toLowerCase();
  return FALLBACK_LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(q) ||
      l.value.includes(q) ||
      (l.nativeName && l.nativeName.toLowerCase().includes(q)),
  ).slice(0, 10);
}
