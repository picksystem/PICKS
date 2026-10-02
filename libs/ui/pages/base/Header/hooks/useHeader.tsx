import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { useAuth, useDebounce } from '@serviceops/hooks';
import {
  useAuthActionMutation,
  useGetTicketsQuery,
  useGetKBArticlesQuery,
} from '@serviceops/services';
import { IAuthUser } from '@serviceops/interfaces';

type TicketType = 'incident' | 'service_request' | 'advisory_request';

type Ticket = {
  id: number;
  number: string;
  shortDescription: string | null;
  status: string;
  ticketType: TicketType;
};

type KBArticle = {
  id: number;
  title: string;
  description: string;
  category?: string | null;
};

type SearchResult =
  | {
      type: 'ticket';
      id: number;
      number: string;
      shortDescription: string | null;
      status: string;
      ticketType: string;
    }
  | { type: 'kb'; id: number; title: string; description: string; category?: string | null };

const TICKET_TYPE_PATH_SEGMENT: Record<TicketType, string> = {
  incident: 'incident',
  service_request: 'service-request',
  advisory_request: 'advisory-request',
};

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

  // Notifications — use boolean for dialog open state
  const [notifOpen, setNotifOpen] = useState(false);

  // Notifications data
  const [notifications, setNotifications] = useState<IAuthUser[]>([]);
  const fetchPendingRequests = useCallback(async () => {
    try {
      const result = await authAction({ action: 'get-pending-role-requests' }).unwrap();
      setNotifications(result.data || []);
    } catch {
      // non-critical
    }
  }, [authAction]);

  // Loading overlay
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Search
  const [ticketSearch, setTicketSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedSearch = useDebounce(ticketSearch, 300);
  const { data: tickets } = useGetTicketsQuery(void 0);
  const { data: kbArticles } = useGetKBArticlesQuery(void 0);

  const normalizeText = (text: string | null | undefined): string =>
    (text ?? '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];
    const query = normalizeText(debouncedSearch);
    const words = query.split(' ').filter(Boolean);
    if (words.length === 0) return [];

    const results: SearchResult[] = [];

    // Search tickets by number, title, and description
    if (tickets?.length) {
      (tickets as Ticket[]).forEach((t) => {
        const normNumber = normalizeText(t.number);
        const normTitle = normalizeText(t.shortDescription);
        if (words.every((w) => normNumber.includes(w) || normTitle.includes(w))) {
          results.push({
            type: 'ticket',
            id: t.id,
            number: t.number,
            shortDescription: t.shortDescription,
            status: t.status,
            ticketType: t.ticketType,
          });
        }
      });
    }

    // Search KB articles by title and description
    if (kbArticles?.length) {
      (kbArticles as KBArticle[]).forEach((a) => {
        const normTitle = normalizeText(a.title);
        const normDesc = normalizeText(a.description);
        if (words.every((w) => normTitle.includes(w) || normDesc.includes(w))) {
          results.push({
            type: 'kb',
            id: a.id,
            title: a.title,
            description: a.description,
            category: a.category,
          });
        }
      });
    }

    return results.slice(0, 8);
  }, [debouncedSearch, tickets, kbArticles]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // Refetch notifications when dialog opens
  useEffect(() => {
    if (notifOpen) {
      fetchPendingRequests();
    }
  }, [notifOpen, fetchPendingRequests]);

  const userName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  // Search handlers
  const handleTicketSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketSearch(e.target.value);
    setShowSearchResults(true);
  }, []);

  const handleSelectSearchResult = useCallback(
    (result: SearchResult) => {
      setShowSearchResults(false);
      setTicketSearch('');
      if (result.type === 'ticket') {
        const t = result as { type: 'ticket'; number: string; ticketType: string };
        const segment = TICKET_TYPE_PATH_SEGMENT[t.ticketType as TicketType];
        const detailPath = currentPath.startsWith('/app/user')
          ? `/app/user/${segment}/${t.number}`
          : currentPath.startsWith('/app/consultant')
            ? `/app/consultant/${segment}/${t.number}`
            : `/app/base/${segment}/${t.number}`;
        navigate(detailPath);
      } else if (result.type === 'kb') {
        navigate('/app/base/knowledge-base');
      }
    },
    [currentPath, navigate],
  );

  const handleCloseSearchResults = useCallback(() => setShowSearchResults(false), []);

  // Menu handlers
  const handleSettingsOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleSettingsClose = () => setAnchorEl(null);
  const handleNotifOpen = () => setNotifOpen(true);
  const handleNotifClose = () => setNotifOpen(false);
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
    notifOpen,
    notifications,
    isLoading,
    loadingMessage,
    ticketSearch,
    showSearchResults,
    searchResults,
    activeDashboardPath,
    // Handlers
    handleTicketSearchChange,
    handleSelectSearchResult,
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
