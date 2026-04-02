import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { useAuth, useDebounce } from '@serviceops/hooks';
import { useAuthActionMutation, useGetIncidentsQuery } from '@serviceops/services';
import { IAuthUser, IIncident } from '@serviceops/interfaces';

export const useHeader = () => {
  const navigate = useNavigate();
  const { AdminPath, AuthPath } = constants;
  const { user, isAdmin, logout } = useAuth();
  const [authAction] = useAuthActionMutation();

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

  const handleSelectIncident = useCallback((incident: IIncident) => {
    setShowSearchResults(false);
    setTicketSearch('');
    window.open(`${window.location.origin}/app/admin/incident/${incident.number}`, '_blank');
  }, []);

  const handleCloseSearchResults = useCallback(() => setShowSearchResults(false), []);

  // Menu handlers
  const handleSettingsOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleSettingsClose = () => setAnchorEl(null);
  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);
  const handleNotifClick = () => {
    handleNotifClose();
    navigate(AdminPath.ROLE_REQUESTS);
  };

  // Navigation handlers
  const handleLogout = () => {
    handleSettingsClose();
    logout();
    navigate(AuthPath.SIGNIN);
  };

  const handleProfile = () => {
    handleSettingsClose();
    navigate(AdminPath.PROFILE);
  };

  const handleUserPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to User Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate('/app/user/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  const handleConsultantPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to Consultant Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate('/app/consultant/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  const handleLogoClick = () => navigate('/app/admin/dashboard');
  const handleCreateTicket = () => navigate(AdminPath.CREATE_TICKET);

  return {
    // State
    user,
    isAdmin,
    userName,
    anchorEl,
    notifAnchorEl,
    notifications,
    isLoading,
    loadingMessage,
    ticketSearch,
    showSearchResults,
    filteredIncidents,
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
    handleLogoClick,
    handleCreateTicket,
  };
};
