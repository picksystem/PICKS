import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { useAuth, useDebounce } from '@serviceops/hooks';
import { useAuthActionMutation, useGetIncidentsQuery } from '@serviceops/services';
import { IAuthUser, IIncident } from '@serviceops/interfaces';

export const useHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { BasePath, UserPath, ConsultantPath, AuthPath } = constants;
  const { user, isAdmin, isConsultant, logout } = useAuth();
  const [authAction] = useAuthActionMutation();

  // Get current mode based on URL path
  const currentPath = location.pathname;
  const isOnUserPage = currentPath.startsWith('/app/user');
  const isOnConsultantPage = currentPath.startsWith('/app/consultant');

  // Determine active dashboard path based on current mode
  const activeDashboardPath = isConsultant
    ? ConsultantPath.DASHBOARD
    : isAdmin && isOnUserPage
      ? UserPath.DASHBOARD
      : isAdmin && isOnConsultantPage
        ? ConsultantPath.DASHBOARD
        : BasePath.DASHBOARD;

  // Menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  // Notifications
  const [notifications, setNotifications] = useState<IAuthUser[]>([]);

  // Loading overlay
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Search
  const [ticketSearch, setTicketSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedSearch = useDebounce(ticketSearch, 300);
  const { data: incidents } = useGetIncidentsQuery();

  const filteredIncidents = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2 || !incidents) return [];
    const query = debouncedSearch.toLowerCase();
    return incidents.filter((inc) => inc.number.toLowerCase().includes(query)).slice(0, 8);
  }, [debouncedSearch, incidents]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const result = await authAction({ action: 'get-pending-role-requests' }).unwrap();
        setNotifications(result.data || []);
      } catch {
        // non-critical
      }
    };
    fetchPendingRequests();
  }, [authAction]);

  const userName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  // Search handlers
  const handleTicketSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketSearch(e.target.value);
    setShowSearchResults(true);
  }, []);

  const handleSelectIncident = useCallback(
    (incident: IIncident) => {
      setShowSearchResults(false);
      setTicketSearch('');
      // Navigate to incident detail in the current mode
      const detailPath = currentPath.startsWith('/app/user')
        ? `/app/user/incident/${incident.number}`
        : currentPath.startsWith('/app/consultant')
          ? `/app/consultant/incident/${incident.number}`
          : `/app/base/incident/${incident.number}`;
      navigate(detailPath);
    },
    [currentPath, navigate],
  );

  const handleCloseSearchResults = useCallback(() => setShowSearchResults(false), []);

  // Menu handlers
  const handleSettingsOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleSettingsClose = () => setAnchorEl(null);
  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);
  const handleNotifClick = () => {
    handleNotifClose();
    navigate(BasePath.ROLE_REQUESTS);
  };

  // Navigation handlers
  const handleLogout = () => {
    handleSettingsClose();
    logout();
    navigate(AuthPath.SIGNIN);
  };

  const handleProfile = () => {
    handleSettingsClose();
    navigate(BasePath.PROFILE);
  };

  const handleUserPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to User Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate(UserPath.DASHBOARD);
      setIsLoading(false);
    }, 1500);
  };

  const handleConsultantPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to Consultant Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate(ConsultantPath.DASHBOARD);
      setIsLoading(false);
    }, 1500);
  };

  const handleAdminPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to Admin Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate(BasePath.DASHBOARD);
      setIsLoading(false);
    }, 1500);
  };

  // Determine current role based on URL path
  const currentRole: 'admin' | 'consultant' | 'user' = currentPath.startsWith('/app/admin')
    ? 'admin'
    : currentPath.startsWith('/app/consultant')
      ? 'consultant'
      : 'user';

  const handleLogoClick = () => navigate(activeDashboardPath);
  const handleCreateTicket = () => {
    // Navigate to create ticket in current mode
    if (isConsultant) {
      navigate(ConsultantPath.CREATE_TICKET);
    } else if (isOnUserPage) {
      navigate(UserPath.CREATE_TICKET || BasePath.CREATE_TICKET);
    } else {
      navigate(BasePath.CREATE_TICKET);
    }
  };

  return {
    // State
    user,
    isAdmin,
    currentRole,
    userName,
    anchorEl,
    notifAnchorEl,
    notifications,
    isLoading,
    loadingMessage,
    ticketSearch,
    showSearchResults,
    filteredIncidents,
    activeDashboardPath,
    // Handlers
    handleTicketSearchChange,
    handleSelectIncident,
    handleCloseSearchResults,
    handleSettingsOpen,
    handleSettingsClose,
    handleNotifOpen,
    handleNotifClose,
    handleNotifClick,
    handleLogout,
    handleProfile,
    handleUserPage,
    handleConsultantPage,
    handleAdminPage,
    handleLogoClick,
    handleCreateTicket,
  };
};
