import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CommonColors {
    shim: string;
    white15: string;
    white10: string;
    white18: string;
    white20: string;
    white25: string;
    white30: string;
    white35: string;
    white40: string;
    white50: string;
    white55: string;
    white60: string;
    white70: string;
    white75: string;
    white80: string;
  }

  interface PaletteColor {
    darkText?: string;
    background?: string;
    border?: string;
    icon?: string;
    complete?: string;
    // warning extras
    accent?: string;
    accentAlpha20?: string;
    accentAlpha25?: string;
    accentAlpha40?: string;
    accentAlpha50?: string;
    amberDark?: string;
    amber?: string;
    amberAlpha30?: string;
    amberAlpha60?: string;
    // success extras
    green?: string;
    greenAlpha25?: string;
    greenAlpha40?: string;
    mint?: string;
    tealAlpha30?: string;
    tealAlpha60?: string;
    // error extras
    redAlpha10?: string;
    // info extras
    lightBlue?: string;
    // primary extras
    blueAlpha04?: string;
    blueAlpha03?: string;
  }

  interface SimplePaletteColorOptions {
    darkText?: string;
    background?: string;
    border?: string;
    icon?: string;
    complete?: string;
    accent?: string;
    accentAlpha20?: string;
    accentAlpha25?: string;
    accentAlpha40?: string;
    accentAlpha50?: string;
    amberDark?: string;
    amber?: string;
    amberAlpha30?: string;
    amberAlpha60?: string;
    green?: string;
    greenAlpha25?: string;
    greenAlpha40?: string;
    mint?: string;
    tealAlpha30?: string;
    tealAlpha60?: string;
    redAlpha10?: string;
    lightBlue?: string;
    blueAlpha04?: string;
    blueAlpha03?: string;
  }

  interface Palette {
    accent: Palette['primary'];

    border: {
      default: string;
    };

    gradient: {
      headerBlue: string;
      headerBlueDark: string;
      headerNavy: string;
      headerGreen: string;
      headerAmber: string;
      headerRed: string;
      sectionBlue: string;
      sectionPurple: string;
    };

    icon: {
      dark: string;
      default: string;
      hover: string;
      stroke: string;
    };

    other: {
      partner: string;
      backdrop: string;
      background: string;
      backgroundContrastText: string;
      body: string;
      border: string;
      caution: string;
      cookieBanner: string;
      divider: string;
      genesysChatBg: string;
      genesysChatIcon: string;
      tooltip: string;
      tooltipDark: string;
      footerBackground: string;
      footerTextLink: string;
      footerTextPrimary: string;
      footerTextSecondary: string;
      headerBackground: string;
    };

    shadow: {
      primary: string;
      light: string;
      medium: string;
      strong: string;
      dark: string;
      overlay: string;
    };

    sidebar: {
      background: string;
      text: string;
      textTransparent: string;
      subItemText: string;
      hoverBg: string;
      buttonBg: string;
      buttonHoverBg: string;
      border: string;
      shadow: string;
      shadowHover: string;
    };

    notFound: {
      background: string;
      text: string;
    };
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];

    border?: {
      default?: string;
    };

    gradient?: {
      headerBlue?: string;
      headerBlueDark?: string;
      headerNavy?: string;
      headerGreen?: string;
      headerAmber?: string;
      headerRed?: string;
      sectionBlue?: string;
      sectionPurple?: string;
    };

    icon?: {
      dark?: string;
      default?: string;
      hover?: string;
      stroke?: string;
    };

    other?: {
      partner?: string;
      backdrop?: string;
      background?: string;
      backgroundContrastText?: string;
      body?: string;
      border?: string;
      caution?: string;
      cookieBanner?: string;
      divider?: string;
      genesysChatBg?: string;
      genesysChatIcon?: string;
      tooltip?: string;
      tooltipDark?: string;
      footerBackground?: string;
      footerTextLink?: string;
      footerTextPrimary?: string;
      footerTextSecondary?: string;
      headerBackground?: string;
    };

    shadow?: {
      primary?: string;
      light?: string;
      medium?: string;
      strong?: string;
      dark?: string;
      overlay?: string;
    };

    sidebar?: {
      background?: string;
      text?: string;
      textTransparent?: string;
      subItemText?: string;
      hoverBg?: string;
      buttonBg?: string;
      buttonHoverBg?: string;
      border?: string;
      shadow?: string;
      shadowHover?: string;
    };

    notFound?: {
      background?: string;
      text?: string;
    };
  }
}
