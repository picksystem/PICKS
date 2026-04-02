import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, alpha } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import TimerIcon from '@mui/icons-material/Timer';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useCollapse, useDevice } from '@serviceops/hooks';

import General from './sections/General';
import TicketTypes from './sections/TicketTypes';
import Priorities from './sections/Priorities';
import Statuses from './sections/Statuses';
import SLAs from './sections/SLAs';
import Categorization from './sections/Categorization';
import ConsultantProfiles from './sections/ConsultantProfiles';
import Approvals from './sections/Approvals';
import UserConfig from './sections/UserConfig';
import Templates from './sections/Templates';
import ReasonCodes from './sections/ReasonCodes';
import Calendars from './sections/Calendars';

const BASE = '/app/admin/configuration';
const INNER_NAV_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'General', path: `${BASE}/general`, Icon: SettingsIcon, accent: '#2563eb' },
  {
    label: 'Ticket Types',
    path: `${BASE}/ticket-types`,
    Icon: ConfirmationNumberIcon,
    accent: '#7c3aed',
  },
  { label: 'Priorities', path: `${BASE}/priorities`, Icon: PriorityHighIcon, accent: '#dc2626' },
  { label: 'Statuses', path: `${BASE}/statuses`, Icon: RadioButtonCheckedIcon, accent: '#7c3aed' },
  { label: 'SLAs', path: `${BASE}/slas`, Icon: TimerIcon, accent: '#0891b2' },
  {
    label: 'Categorization',
    path: `${BASE}/categorization`,
    Icon: AccountTreeIcon,
    accent: '#059669',
  },
  {
    label: 'Consultant Profiles',
    path: `${BASE}/consultant-profiles`,
    Icon: BusinessCenterIcon,
    accent: '#d97706',
  },
  { label: 'Approvals', path: `${BASE}/approvals`, Icon: HowToRegIcon, accent: '#0369a1' },
  {
    label: 'User Config',
    path: `${BASE}/user-config`,
    Icon: ManageAccountsIcon,
    accent: '#be185d',
  },
  { label: 'Templates', path: `${BASE}/templates`, Icon: FileCopyIcon, accent: '#4f46e5' },
  { label: 'Reason Codes', path: `${BASE}/reason-codes`, Icon: CommentIcon, accent: '#0f766e' },
  { label: 'Calendars', path: `${BASE}/calendars`, Icon: CalendarMonthIcon, accent: '#b45309' },
];

// ── Desktop inner nav list ─────────────────────────────────────────────────────
const DesktopNavList = ({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate: (path: string) => void;
}) => (
  <List disablePadding sx={{ px: 0.75, py: 0.75 }}>
    {NAV_ITEMS.map(({ label, path, Icon, accent }) => {
      const isActive = activePath === path;
      return (
        <ListItem
          key={path}
          onClick={() => onNavigate(path)}
          sx={{
            borderRadius: 1.5,
            mb: 0.25,
            px: 1.25,
            py: 0.875,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            color: isActive ? accent : 'text.secondary',
            bgcolor: isActive ? alpha(accent, 0.1) : 'transparent',
            borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
            '&:hover': {
              bgcolor: isActive ? alpha(accent, 0.1) : 'action.hover',
              color: isActive ? accent : 'text.primary',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 'auto',
              mr: 1.25,
              color: 'inherit',
              '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
            }}
          >
            <Icon fontSize='small' />
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              noWrap: true,
            }}
          />
          {isActive && (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: accent,
                flexShrink: 0,
                ml: 0.5,
              }}
            />
          )}
        </ListItem>
      );
    })}
  </List>
);

// ── Mobile horizontal pill nav ─────────────────────────────────────────────────
const MobilePillNav = ({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate: (path: string) => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      gap: 0.75,
      px: 1.25,
      py: 0.875,
      overflowX: 'auto',
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
    }}
  >
    {NAV_ITEMS.map(({ label, path, Icon, accent }) => {
      const isActive = activePath === path;
      return (
        <Box
          key={path}
          onClick={() => onNavigate(path)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
            px: 1.25,
            py: 0.5,
            borderRadius: 5,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            userSelect: 'none',
            bgcolor: isActive ? accent : 'grey.100',
            color: isActive ? 'white' : 'text.secondary',
            fontSize: '0.72rem',
            fontWeight: isActive ? 700 : 500,
            boxShadow: isActive ? `0 2px 8px ${alpha(accent, 0.4)}` : 'none',
            '&:hover': {
              bgcolor: isActive ? accent : alpha(accent, 0.1),
              color: isActive ? 'white' : accent,
            },
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <Icon sx={{ fontSize: '0.82rem' }} />
          <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        </Box>
      );
    })}
  </Box>
);

// ── Section routes ─────────────────────────────────────────────────────────────
const ConfigRoutes = () => (
  <Routes>
    <Route index element={<Navigate to='general' replace />} />
    <Route path='general' element={<General />} />
    <Route path='ticket-types' element={<TicketTypes />} />
    <Route path='priorities' element={<Priorities />} />
    <Route path='statuses' element={<Statuses />} />
    <Route path='slas' element={<SLAs />} />
    <Route path='categorization' element={<Categorization />} />
    <Route path='consultant-profiles' element={<ConsultantProfiles />} />
    <Route path='approvals' element={<Approvals />} />
    <Route path='user-config' element={<UserConfig />} />
    <Route path='templates' element={<Templates />} />
    <Route path='reason-codes' element={<ReasonCodes />} />
    <Route path='calendars' element={<Calendars />} />
    <Route path='*' element={<Navigate to='general' replace />} />
  </Routes>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Configuration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed } = useCollapse();
  const { isXS, isSM } = useDevice();

  const headerHeight = isXS ? 104 : 64;

  const sidebarWidth = isXS
    ? collapsed
      ? 68
      : 195
    : isSM
      ? collapsed
        ? 70
        : 200
      : collapsed
        ? 72
        : 250;

  const isMobileLayout = isXS || isSM;
  const activePath = location.pathname;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: headerHeight,
        left: sidebarWidth,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
        transition: 'left 0.3s ease',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TuneIcon sx={{ color: 'white', fontSize: '0.95rem' }} />
        </Box>
        <Typography variant='body2' fontWeight={700} color='text.primary'>
          Configuration
        </Typography>
      </Box>

      {/* ══ BODY: inner nav sidebar (desktop) + pill nav (mobile) + content ═══ */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobileLayout ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        {/* Desktop: persistent inner nav sidebar */}
        {!isMobileLayout && (
          <Box
            sx={{
              width: INNER_NAV_WIDTH,
              minWidth: INNER_NAV_WIDTH,
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
              '&::-webkit-scrollbar': { width: 3 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.12)', borderRadius: 4 },
            }}
          >
            <DesktopNavList activePath={activePath} onNavigate={(p) => navigate(p)} />
          </Box>
        )}

        {/* Mobile: horizontal scrollable pills */}
        {isMobileLayout && (
          <MobilePillNav activePath={activePath} onNavigate={(p) => navigate(p)} />
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: 'grey.50',
            minWidth: 0,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: 4 },
          }}
        >
          <ConfigRoutes />
        </Box>
      </Box>
    </Box>
  );
};

export default Configuration;
