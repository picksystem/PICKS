import { SelectChangeEvent } from '@mui/material';

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

// Photon (Komoot) — free, no key, OpenStreetMap data, good global coverage
async function fetchFromPhoton(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  const params = new URLSearchParams({ q: query, limit: '8', lang: 'en' });

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);

  const data = await res.json();
  return (data.features ?? []).map((f: any) => {
    const p = f.properties ?? {};
    const [lon, lat] = f.geometry?.coordinates ?? [0, 0];

    const parts: string[] = [];
    if (p.name) parts.push(p.name);
    if (p.city && p.city !== p.name) parts.push(p.city);
    if (p.state) parts.push(p.state);
    if (p.country) parts.push(p.country);

    return {
      place_id: String(p.osm_id ?? Math.random()),
      display_name: parts.join(', '),
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

export interface WorkDetailsStepProps {
  values: {
    workLocation: string;
    department: string;
    employeeId: string;
    businessUnit: string;
    managerName: string;
    reasonForAccess: string;
    role: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onRoleChange: (event: SelectChangeEvent<string>) => void;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  classes: Record<string, string>;
}

export interface SecurityStepProps {
  values: { password: string; confirmPassword: string };
  errors: Partial<Record<string, string>>;
  step2Touched: { password: boolean; confirmPassword: boolean };
  step2Submitted: boolean;
  onPasswordChange: React.ChangeEventHandler;
  onPasswordBlur: (e: React.FocusEvent) => void;
  onConfirmChange: React.ChangeEventHandler;
  onConfirmBlur: (e: React.FocusEvent) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  showConfirmPassword: boolean;
  onToggleConfirmPassword: () => void;
  classes: Record<string, string>;
}

export interface StepProgressProps {
  step: number;
  classes: Record<string, string>;
}

export interface PersonalStepProps {
  values: { firstName: string; lastName: string; email: string; phone: string };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler;
  onBlur: React.FocusEventHandler;
  classes: Record<string, string>;
}

export interface LeftPanelProps {
  classes: Record<string, string>;
  onNavigateSignIn: () => void;
}
