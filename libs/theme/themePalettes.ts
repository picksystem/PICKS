import { palette } from './palette';

type DeepPartial<T> = { [K in keyof T]?: Partial<T[K]> };
export type ThemePaletteOverride = DeepPartial<typeof palette>;

// Shared sidebar text values for any dark-background sidebar
const darkSidebarText = {
  text: '#ffffff',
  textTransparent: 'rgba(255,255,255,0.70)',
  border: 'rgba(255,255,255,0.12)',
  shadow: 'rgba(0,0,0,0.35)',
  shadowHover: 'rgba(0,0,0,0.45)',
};

const THEME_OVERRIDES: Record<string, ThemePaletteOverride> = {
  System: {
    sidebar: {
      background: '#ffffff',
      text: '#222222',
      textTransparent: 'rgba(34,34,34,0.55)',
      subItemText: '#1e429f',
      hoverBg: '#f1f4f9',
      buttonBg: '#1e429f',
      buttonHoverBg: '#2563eb',
      border: '#e2e8f0',
      shadow: 'rgba(0,0,0,0.12)',
      shadowHover: 'rgba(0,0,0,0.20)',
    },
  },

  'Black and White': {
    primary: {
      main: '#374151',
      light: '#f3f4f6',
      dark: '#111827',
      contrastText: '#ffffff',
      border: '#9ca3af',
      blueAlpha03: 'rgba(55,65,81,0.03)',
      blueAlpha04: 'rgba(55,65,81,0.04)',
    },
    accent: { main: '#374151', light: '#f3f4f6', dark: '#111827' },
    info: { main: '#374151', light: '#f3f4f6', dark: '#111827' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#111827',
      subItemText: '#d1d5db',
      hoverBg: '#1f2937',
      buttonBg: '#374151',
      buttonHoverBg: '#4b5563',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #111827 0%, #374151 55%, #4b5563 100%)',
      headerBlueDark: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      headerNavy: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
      sectionBlue: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
    },
    text: { link: '#374151', hover: '#111827' },
    icon: { hover: '#374151' },
  },

  Blimey: {
    primary: {
      main: '#d97706',
      light: '#fef3c7',
      dark: '#b45309',
      contrastText: '#ffffff',
      border: '#fcd34d',
      blueAlpha03: 'rgba(217,119,6,0.03)',
      blueAlpha04: 'rgba(217,119,6,0.04)',
    },
    accent: { main: '#d97706', light: '#fef3c7', dark: '#b45309' },
    info: { main: '#d97706', light: '#fef3c7', dark: '#b45309' },
    background: { default: '#fffbeb', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#92400e',
      subItemText: '#fde68a',
      hoverBg: '#a16207',
      buttonBg: '#b45309',
      buttonHoverBg: '#d97706',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
      headerBlueDark: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
      headerNavy: 'linear-gradient(135deg, #78350f 0%, #92400e 55%, #b45309 100%)',
      sectionBlue: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
    },
    text: { link: '#d97706', hover: '#b45309' },
    icon: { hover: '#d97706' },
  },

  Blues: {
    primary: {
      main: '#0284c7',
      light: '#e0f2fe',
      dark: '#0369a1',
      contrastText: '#ffffff',
      border: '#7dd3fc',
      blueAlpha03: 'rgba(2,132,199,0.03)',
      blueAlpha04: 'rgba(2,132,199,0.04)',
    },
    accent: { main: '#0284c7', light: '#e0f2fe', dark: '#0369a1' },
    info: { main: '#0284c7', light: '#e0f2fe', dark: '#0369a1' },
    background: { default: '#f0f9ff', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#0369a1',
      subItemText: '#bae6fd',
      hoverBg: '#0284c7',
      buttonBg: '#075985',
      buttonHoverBg: '#0284c7',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg,#0369a1 0%,#0284c7 55%,#38bdf8 100%)',
      headerBlueDark: 'linear-gradient(135deg,#075985 0%,#0369a1 100%)',
      headerNavy: 'linear-gradient(135deg,#075985 0%,#0369a1 100%)',
      sectionBlue: 'linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)',
    },
    text: { link: '#0284c7', hover: '#0369a1' },
    icon: { hover: '#0284c7' },
  },

  Clean: {
    primary: {
      main: '#0ea5e9',
      light: '#e0f2fe',
      dark: '#0284c7',
      contrastText: '#ffffff',
      border: '#7dd3fc',
      blueAlpha03: 'rgba(14,165,233,0.03)',
      blueAlpha04: 'rgba(14,165,233,0.04)',
    },
    accent: { main: '#0ea5e9', light: '#e0f2fe', dark: '#0284c7' },
    info: { main: '#0ea5e9', light: '#e0f2fe', dark: '#0284c7' },
    background: { default: '#f0f9ff', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#0369a1',
      subItemText: '#bae6fd',
      hoverBg: '#0284c7',
      buttonBg: '#0284c7',
      buttonHoverBg: '#0ea5e9',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
      headerBlueDark: 'linear-gradient(135deg, #075985 0%, #0284c7 100%)',
      headerNavy: 'linear-gradient(135deg, #075985 0%, #0369a1 55%, #0284c7 100%)',
      sectionBlue: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
    },
    text: { link: '#0ea5e9', hover: '#0284c7' },
    icon: { hover: '#0ea5e9' },
  },

  Cobalt: {
    primary: {
      main: '#4f46e5',
      light: '#ede9fe',
      dark: '#3730a3',
      contrastText: '#ffffff',
      border: '#a5b4fc',
      blueAlpha03: 'rgba(79,70,229,0.03)',
      blueAlpha04: 'rgba(79,70,229,0.04)',
    },
    accent: { main: '#4f46e5', light: '#ede9fe', dark: '#3730a3' },
    info: { main: '#4f46e5', light: '#ede9fe', dark: '#3730a3' },
    background: { default: '#eef2ff', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#312e81',
      subItemText: '#c7d2fe',
      hoverBg: '#3730a3',
      buttonBg: '#3730a3',
      buttonHoverBg: '#4f46e5',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg,#312e81 0%,#3730a3 55%,#4f46e5 100%)',
      headerBlueDark: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)',
      headerNavy: 'linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%)',
      sectionBlue: 'linear-gradient(135deg,#312e81 0%,#4f46e5 100%)',
    },
    text: { link: '#4f46e5', hover: '#3730a3' },
    icon: { hover: '#4f46e5' },
  },

  'Cobalt Contrast UI': {
    primary: {
      main: '#1d4ed8',
      light: '#dbeafe',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
      border: '#60a5fa',
      blueAlpha03: 'rgba(29,78,216,0.06)',
      blueAlpha04: 'rgba(29,78,216,0.08)',
    },
    accent: { main: '#1d4ed8', light: '#dbeafe', dark: '#1e3a8a' },
    info: { main: '#1d4ed8', light: '#dbeafe', dark: '#1e3a8a' },
    background: { default: '#e8edff', paper: '#f1f5ff' },
    sidebar: {
      ...darkSidebarText,
      background: '#0f2463',
      subItemText: '#93c5fd',
      hoverBg: '#1e3a8a',
      buttonBg: '#1e3a8a',
      buttonHoverBg: '#1d4ed8',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #0f2463 0%, #1e3a8a 55%, #1d4ed8 100%)',
      headerBlueDark: 'linear-gradient(135deg, #0f2463 0%, #1e3a8a 100%)',
      headerNavy: 'linear-gradient(135deg, #0f2463 0%, #1e3a8a 100%)',
      sectionBlue: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    text: { primary: '#0f172a', secondary: '#1e293b', link: '#1d4ed8', hover: '#1e3a8a' },
    icon: { hover: '#1d4ed8' },
  },

  'Contrast UI': {
    primary: {
      main: '#ca8a04',
      light: '#fef9c3',
      dark: '#713f12',
      contrastText: '#000000',
      border: '#facc15',
      blueAlpha03: 'rgba(202,138,4,0.06)',
      blueAlpha04: 'rgba(202,138,4,0.08)',
    },
    accent: { main: '#ca8a04', light: '#fef9c3', dark: '#713f12' },
    info: { main: '#ca8a04', light: '#fef9c3', dark: '#713f12' },
    background: { default: '#ffffff', paper: '#fffef0' },
    sidebar: {
      ...darkSidebarText,
      background: '#1c1c1c',
      subItemText: '#facc15',
      hoverBg: '#2d2d2d',
      buttonBg: '#374151',
      buttonHoverBg: '#4b5563',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #1c1c1c 0%, #374151 55%, #4b5563 100%)',
      headerBlueDark: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
      headerNavy: 'linear-gradient(135deg, #000000 0%, #1c1c1c 100%)',
      sectionBlue: 'linear-gradient(135deg, #1c1c1c 0%, #374151 100%)',
    },
    text: { primary: '#000000', secondary: '#1f2937', link: '#92400e', hover: '#713f12' },
    icon: { hover: '#ca8a04' },
  },

  Midnight: {
    primary: {
      main: '#7c3aed',
      light: '#ede9fe',
      dark: '#5b21b6',
      contrastText: '#ffffff',
      border: '#c4b5fd',
      blueAlpha03: 'rgba(124,58,237,0.03)',
      blueAlpha04: 'rgba(124,58,237,0.05)',
    },
    accent: { main: '#7c3aed', light: '#ede9fe', dark: '#5b21b6' },
    info: { main: '#7c3aed', light: '#ede9fe', dark: '#5b21b6' },
    background: { default: '#f5f3ff', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#1e1b4b',
      subItemText: '#c4b5fd',
      hoverBg: '#2e2a6e',
      buttonBg: '#3730a3',
      buttonHoverBg: '#7c3aed',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #7c3aed 100%)',
      headerBlueDark: 'linear-gradient(135deg, #0f0d2e 0%, #1e1b4b 100%)',
      headerNavy: 'linear-gradient(135deg, #0f0d2e 0%, #2e2a6e 100%)',
      sectionBlue: 'linear-gradient(135deg, #3730a3 0%, #7c3aed 100%)',
      sectionPurple: 'linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)',
    },
    text: { link: '#7c3aed', hover: '#5b21b6' },
    icon: { hover: '#7c3aed' },
  },

  Rose: {
    primary: {
      main: '#f43f5e',
      light: '#ffe4e6',
      dark: '#e11d48',
      contrastText: '#ffffff',
      border: '#fda4af',
      blueAlpha03: 'rgba(244,63,94,0.03)',
      blueAlpha04: 'rgba(244,63,94,0.04)',
    },
    accent: { main: '#f43f5e', light: '#ffe4e6', dark: '#e11d48' },
    info: { main: '#f43f5e', light: '#ffe4e6', dark: '#e11d48' },
    background: { default: '#fff1f2', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#881337',
      subItemText: '#fda4af',
      hoverBg: '#9f1239',
      buttonBg: '#be123c',
      buttonHoverBg: '#e11d48',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
      headerBlueDark: 'linear-gradient(135deg, #4c0519 0%, #881337 100%)',
      headerNavy: 'linear-gradient(135deg, #4c0519 0%, #881337 55%, #be123c 100%)',
      sectionBlue: 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)',
    },
    text: { link: '#e11d48', hover: '#be123c' },
    icon: { hover: '#f43f5e' },
  },

  Forest: {
    primary: {
      main: '#059669',
      light: '#d1fae5',
      dark: '#065f46',
      contrastText: '#ffffff',
      border: '#6ee7b7',
      blueAlpha03: 'rgba(5,150,105,0.03)',
      blueAlpha04: 'rgba(5,150,105,0.05)',
    },
    accent: { main: '#059669', light: '#d1fae5', dark: '#065f46' },
    info: { main: '#059669', light: '#d1fae5', dark: '#065f46' },
    background: { default: '#f0fdf4', paper: '#ffffff' },
    sidebar: {
      ...darkSidebarText,
      background: '#064e3b',
      subItemText: '#6ee7b7',
      hoverBg: '#065f46',
      buttonBg: '#047857',
      buttonHoverBg: '#059669',
    },
    gradient: {
      headerBlue: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #059669 100%)',
      headerBlueDark: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
      headerNavy: 'linear-gradient(135deg, #022c22 0%, #065f46 100%)',
      sectionBlue: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
      sectionPurple: 'linear-gradient(135deg, #047857 0%, #34d399 100%)',
    },
    text: { link: '#059669', hover: '#065f46' },
    icon: { hover: '#059669' },
  },
};

export function getThemeOverride(name: string): ThemePaletteOverride {
  return THEME_OVERRIDES[name] ?? {};
}

export function mergeWithBase(override: ThemePaletteOverride): typeof palette {
  const result = { ...palette } as Record<string, unknown>;
  for (const key of Object.keys(override) as (keyof typeof palette)[]) {
    if (override[key] && typeof override[key] === 'object') {
      result[key] = { ...(palette[key] as object), ...(override[key] as object) };
    }
  }
  return result as typeof palette;
}
