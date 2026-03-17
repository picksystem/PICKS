// Partner configuration utilities
export interface PartnerConfig {
  name: string;
  theme: string;
  features: string[];
  apiUrl?: string;
  logoUrl?: string;
}

export const PARTNER_CONFIGS: Record<string, PartnerConfig> = {
  administration: {
    name: 'Administration',
    theme: 'administration',
    features: ['admin', 'user', 'reports', 'system', 'dashboard'],
    apiUrl: '/api',
  },
  'generale-partner': {
    name: 'Generale Partner',
    theme: 'generale-partner',
    features: ['admin', 'user', 'reports'],
    apiUrl: '/api',
  },
};

export const getPartnerConfig = (partner: string): PartnerConfig | undefined => {
  return PARTNER_CONFIGS[partner];
};

export const isPartner = (partner: string): boolean => {
  return partner in PARTNER_CONFIGS;
};

export const isAdministration = (partner: string): boolean => {
  return partner === 'administration';
};

export const isGeneralePartner = (partner: string): boolean => {
  return partner === 'generale-partner';
};
