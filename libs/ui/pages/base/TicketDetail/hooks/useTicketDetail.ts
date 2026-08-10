import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  useGetTicketByNumberQuery,
  useGetTicketsQuery,
  useUpdateTicketMutation,
  useGetTicketTimeEntriesQuery,
  useCreateTicketTimeEntryMutation,
} from '../../../../../services';
import {
  useGetAllUsersMutation,
  useGetTicketTypeQuery,
  showNotification,
} from '@serviceops/services';
import { useAuth } from '@serviceops/hooks';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { mergeLayoutConfig } from '@serviceops/tickettypelayout';
import { ITimeEntry } from '@serviceops/interfaces';
import {
  ModalType,
  TimeSummaryData,
  TicketEntity,
  TicketUpdateInput,
} from '../types/ticketDetail.types';
import { useTicketTimer } from './useTicketTimer';
import { useTicketNavigation } from './useTicketNavigation';
import { calculateSLA, calculateTimeSummary } from '../utils/ticketDetail.utils';

export const useTicketDetail = () => {
  const { number } = useParams<{ number: string }>();
  const {
    data: ticket,
    isLoading,
    error,
    refetch,
  } = useGetTicketByNumberQuery(number || '', { skip: !number });
  const incident = ticket as TicketEntity | undefined;
  const ticketType = incident?.ticketType ?? 'incident';

  // Ticket lists for prev/next navigation and dropdown-option derivation.
  // Call all three list queries unconditionally (Rules of Hooks) and pick
  // the one matching this ticket's type.
  const { data: allIncidentsList } = useGetTicketsQuery({ ticketType: 'incident' });
  const { data: allServiceRequestsList } = useGetTicketsQuery({ ticketType: 'service_request' });
  const { data: allAdvisoryRequestsList } = useGetTicketsQuery({ ticketType: 'advisory_request' });
  const allIncidents = useMemo<TicketEntity[] | undefined>(() => {
    if (ticketType === 'service_request')
      return allServiceRequestsList as TicketEntity[] | undefined;
    if (ticketType === 'advisory_request')
      return allAdvisoryRequestsList as TicketEntity[] | undefined;
    return allIncidentsList as TicketEntity[] | undefined;
  }, [ticketType, allIncidentsList, allServiceRequestsList, allAdvisoryRequestsList]);

  const { data: ticketTypes } = useGetTicketTypeQuery();
  const { user, isAdmin, logout } = useAuth();

  // Update mutation — call all three unconditionally, dispatch by ticketType.
  const [updateIncidentTrigger] = useUpdateTicketMutation();
  const [updateServiceRequestTrigger] = useUpdateTicketMutation();
  const [updateAdvisoryRequestTrigger] = useUpdateTicketMutation();
  const updateTicket = useCallback(
    (args: { id: number | string; data: TicketUpdateInput }) => {
      if (ticketType === 'service_request') {
        return updateServiceRequestTrigger({
          ticketType: 'service_request',
          id: Number(args.id),
          data: args.data,
        });
      }
      if (ticketType === 'advisory_request') {
        return updateAdvisoryRequestTrigger({
          ticketType: 'advisory_request',
          id: Number(args.id),
          data: args.data,
        });
      }
      return updateIncidentTrigger({ ticketType: 'incident', id: Number(args.id), data: args.data });
    },
    [ticketType, updateIncidentTrigger, updateServiceRequestTrigger, updateAdvisoryRequestTrigger],
  );

  const [createTicketTimeEntry] = useCreateTicketTimeEntryMutation();
  const [getAllUsers] = useGetAllUsersMutation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch users for dropdown options
  const [users, setUsers] = useState<{ name?: string; firstName?: string; lastName?: string }[]>(
    [],
  );
  useEffect(() => {
    getAllUsers()
      .unwrap()
      .then((result) => {
        if (Array.isArray(result)) setUsers(result);
      })
      .catch(() => {
        // silently ignore — dropdowns will fall back to incident-derived values
      });
  }, [getAllUsers]);

  // UI state - sidebar collapsed by default on mobile
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [moreToolsAnchorEl, setMoreToolsAnchorEl] = useState<null | HTMLElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<TicketUpdateInput>({});
  const [editCustomFieldValues, setEditCustomFieldValues] = useState<Record<string, string>>({});

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // ETA state (defaults from due date, independently editable)
  const [eta, setEta] = useState<Date | null>(null);

  // Time entries query
  const {
    data: timeEntries,
    isLoading: timeEntriesLoading,
    refetch: refetchTimeEntries,
  } = useGetTicketTimeEntriesQuery(
    { ticketType, ticketId: incident?.id ?? 0 },
    { skip: !incident },
  );

  // Calculate time summary from time entries
  const timeSummary = useMemo<TimeSummaryData>(() => {
    return calculateTimeSummary((timeEntries ?? []) as any as ITimeEntry[]);
  }, [timeEntries]);

  // Resolve which Admin ▸ Ticket Type record governs this ticket's number
  // prefix, so its saved Ticket Detail Screen Layout (persisted server-side
  // on that ticket type row) is the one applied here.
  const resolvedTicketType = useMemo(
    () =>
      (ticketTypes ?? []).find(
        (t) => t.prefix && incident?.number?.toUpperCase().startsWith(t.prefix.toUpperCase()),
      ),
    [ticketTypes, incident?.number],
  );

  const layoutConfig = useMemo(
    () => mergeLayoutConfig(resolvedTicketType?.layoutConfig),
    [resolvedTicketType],
  );

  // Derive unique dropdown options — merge users list with existing ticket values
  const userNames = useMemo<string[]>(
    () =>
      users.map((u) => u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()).filter(Boolean),
    [users],
  );

  const clientOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? []).map((i) => i.client).filter(Boolean) as string[];
    return [...new Set([...userNames, ...fromIncidents])].sort();
  }, [userNames, allIncidents]);

  const assignmentGroupOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.assignmentGroup)
      .filter(Boolean) as string[];
    return [...new Set(fromIncidents)].sort();
  }, [allIncidents]);

  const secondaryResourceOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.secondaryResources)
      .filter(Boolean) as string[];
    return [...new Set([...userNames, ...fromIncidents])].sort();
  }, [userNames, allIncidents]);

  const serviceLineOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.serviceLine)
      .filter(Boolean) as string[];
    const mock = [
      'Core Banking',
      'Cloud Infrastructure',
      'Cybersecurity',
      'Data & Analytics',
      'Digital Workplace',
      'ERP & Finance',
      'IT Service Management',
      'Network & Connectivity',
      'Software Development',
      'End User Support',
    ];
    return [...new Set([...fromIncidents, ...mock])].sort();
  }, [allIncidents]);

  const applicationOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.application)
      .filter(Boolean) as string[];
    const mock = [
      'Active Directory',
      'Azure DevOps',
      'Dynamics 365',
      'Internal Wiki',
      'Microsoft 365',
      'Payment Gateway',
      'Power BI',
      'SAP ERP',
      'ServiceNow',
      'SharePoint',
    ];
    return [...new Set([...fromIncidents, ...mock])].sort();
  }, [allIncidents]);

  const applicationCategoryOptions: string[] = [
    'Authentication & Access',
    'Data Management',
    'Email & Communication',
    'Finance & Accounting',
    'Hardware',
    'Integration & API',
    'Network',
    'Reporting & BI',
    'Security',
    'Storage',
    'User Interface',
  ];

  const applicationSubCategoryOptions: string[] = [
    'Account Lockout',
    'Configuration Error',
    'Data Corruption',
    'Data Loss',
    'Disk Space',
    'Failed Integration',
    'Login Failure',
    'Memory Leak',
    'Patch / Update',
    'Performance Degradation',
    'Permission Denied',
    'Service Outage',
    'SSL / Certificate',
    'Timeout Error',
  ];

  const ticketSourceOptions: string[] = [
    'Email',
    'Phone',
    'Self-Service Portal',
    'Walk-In',
    'Chat',
    'Monitoring Alert',
    'Management Escalation',
    'Third-Party Vendor',
  ];

  const businessCategoryOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.businessCategory)
      .filter(Boolean) as string[];
    const mock = [
      'Financial Services',
      'Healthcare',
      'Human Resources',
      'Legal & Compliance',
      'Manufacturing',
      'Operations',
      'Sales & Marketing',
      'Technology',
    ];
    return [...new Set([...fromIncidents, ...mock])].sort();
  }, [allIncidents]);

  // Initialize ETA: from incident.eta if persisted, else from calculated due date
  useEffect(() => {
    if (!incident || eta !== null) return;
    if (incident.eta) {
      setEta(new Date(incident.eta));
    } else {
      const { dueDateObj } = calculateSLA(incident.createdAt);
      setEta(dueDateObj);
    }
  }, [incident, eta]);

  // Save ETA to DB and update local state
  const handleEtaChange = useCallback(
    async (newEta: Date) => {
      setEta(newEta);
      if (!incident) return;
      try {
        await updateTicket({ id: incident.id, data: { eta: newEta.toISOString() } }).unwrap();
      } catch {
        // ETA saved locally even if DB call fails silently
      }
    },
    [incident, updateTicket],
  );

  // Draft expiry countdown
  const [draftRemaining, setDraftRemaining] = useState('');
  const [draftExpired, setDraftExpired] = useState(false);

  // Save timer seconds as a time entry when stopped
  const handleTimerSave = useCallback(
    async (seconds: number) => {
      if (!incident || !user) return;
      const totalMinutes = Math.round(seconds / 60);
      if (totalMinutes < 1) return;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      try {
        await createTicketTimeEntry({
          ticketType,
          ticketId: incident.id,
          date: new Date().toISOString().split('T')[0],
          hours,
          minutes,
          createdBy: user.email ?? user.firstName ?? 'unknown',
        }).unwrap();
        refetchTimeEntries();
        dispatch(showNotification({ message: 'Time entry saved', severity: 'success' }));
      } catch {
        dispatch(showNotification({ message: 'Failed to save time entry', severity: 'error' }));
      }
    },
    [incident, user, ticketType, createTicketTimeEntry, refetchTimeEntries, dispatch],
  );

  // Timer (resets when navigating to a different ticket)
  const timer = useTicketTimer(number, handleTimerSave);

  // Navigation
  const navigation = useTicketNavigation(number, allIncidents);

  // Draft expiry countdown
  useEffect(() => {
    if (incident?.status !== 'draft' || !incident?.draftExpiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(incident.draftExpiresAt!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setDraftExpired(true);
        setDraftRemaining('Draft Expired');
        return;
      }

      setDraftExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDraftRemaining(`${days} days ${hours} hours ${minutes} minutes remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [incident?.status, incident?.draftExpiresAt]);

  // Reset edit + ETA state whenever ticket number changes (navigation between tickets)
  useEffect(() => {
    setIsEditing(false);
    setEditFormData({});
    setEta(null);
  }, [number]);

  // Initialize edit form data when entering edit mode
  const handleStartEditing = useCallback(() => {
    if (!incident) return;
    setEditFormData({
      client: incident.client || undefined,
      assignmentGroup: incident.assignmentGroup || undefined,
      secondaryResources: incident.secondaryResources || undefined,
      // isMajor only exists on Incident — Service/Advisory Requests don't have it
      ...(ticketType === 'incident'
        ? { isMajor: (incident as { isMajor?: boolean }).isMajor }
        : {}),
      isRecurring: incident.isRecurring,
      isReleaseManagement: incident.isReleaseManagement,
      shortDescription: incident.shortDescription || undefined,
      description: incident.description || undefined,
    });
    setEditCustomFieldValues(incident.customFieldValues ?? {});
    setIsEditing(true);
  }, [incident, ticketType]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditFormData({});
    setEditCustomFieldValues({});
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!incident) return;
    try {
      const updateData = { ...editFormData, customFieldValues: editCustomFieldValues };
      await updateTicket({ id: incident.id, data: updateData }).unwrap();
      setIsEditing(false);
      setEditFormData({});
      setEditCustomFieldValues({});
      dispatch(showNotification({ message: 'Ticket updated successfully', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to update ticket', severity: 'error' }));
    }
  }, [incident, editFormData, editCustomFieldValues, updateTicket, refetch, dispatch]);

  const handleSaveAndClose = useCallback(async () => {
    await handleSaveEdit();
    window.close();
  }, [handleSaveEdit]);

  // Direct actions
  const handleAccept = useCallback(async () => {
    if (!incident || !user) return;
    try {
      await updateTicket({
        id: incident.id,
        data: {
          primaryResource: user.email,
          status: 'assigned',
        },
      }).unwrap();
      dispatch(
        showNotification({ message: 'Ticket accepted and assigned to you', severity: 'success' }),
      );
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to accept ticket', severity: 'error' }));
    }
  }, [incident, user, updateTicket, refetch, dispatch]);

  const handleFollow = useCallback(async () => {
    if (!incident || !user) return;
    try {
      const currentFollowers: string[] = incident.followers ? JSON.parse(incident.followers) : [];
      if (currentFollowers.includes(user.email)) {
        dispatch(
          showNotification({
            message: 'You are already following this ticket',
            severity: 'info',
          }),
        );
        return;
      }
      currentFollowers.push(user.email);
      await updateTicket({
        id: incident.id,
        data: { followers: JSON.stringify(currentFollowers) },
      }).unwrap();
      dispatch(showNotification({ message: 'Now following this ticket', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to follow ticket', severity: 'error' }));
    }
  }, [incident, user, updateTicket, refetch, dispatch]);

  const handleCancelIncident = useCallback(async () => {
    if (!incident) return;
    try {
      await updateTicket({
        id: incident.id,
        data: { status: 'cancelled' },
      }).unwrap();
      dispatch(showNotification({ message: 'Ticket cancelled', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to cancel ticket', severity: 'error' }));
    }
  }, [incident, updateTicket, refetch, dispatch]);

  const handleReviewLater = useCallback(() => {
    if (!incident) return;
    try {
      const key = 'reviewLater_incidents';
      const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (existing.includes(incident.number)) {
        const updated = existing.filter((n) => n !== incident.number);
        localStorage.setItem(key, JSON.stringify(updated));
        dispatch(showNotification({ message: 'Removed from Review Later', severity: 'info' }));
      } else {
        existing.push(incident.number);
        localStorage.setItem(key, JSON.stringify(existing));
        dispatch(
          showNotification({
            message: `${incident.number} added to Review Later`,
            severity: 'success',
          }),
        );
      }
    } catch {
      dispatch(showNotification({ message: 'Could not update Review Later', severity: 'error' }));
    }
  }, [incident, dispatch]);

  // Settings menu
  const handleSettingsOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(e.currentTarget);
  }, []);
  const handleSettingsClose = useCallback(() => setSettingsAnchorEl(null), []);

  // More tools menu
  const handleMoreToolsOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setMoreToolsAnchorEl(e.currentTarget);
  }, []);
  const handleMoreToolsClose = useCallback(() => setMoreToolsAnchorEl(null), []);

  const handleCloseWindow = useCallback(() => window.close(), []);

  const dispatchNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
      dispatch(showNotification({ message, severity }));
    },
    [dispatch],
  );

  return {
    // Data
    number,
    incident,
    ticketType,
    isLoading,
    error,
    allIncidents,
    layoutConfig,
    resolvedTicketType,
    user,
    isAdmin,
    refetch,
    isMobile,
    updateTicket,

    // UI state
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    settingsAnchorEl,
    moreToolsAnchorEl,
    isEditing,
    editFormData,
    setEditFormData,
    editCustomFieldValues,
    setEditCustomFieldValues,
    activeModal,
    setActiveModal,
    draftRemaining,
    draftExpired,

    // Handlers
    handleStartEditing,
    handleCancelEditing,
    handleSaveEdit,
    handleSaveAndClose,
    handleAccept,
    handleFollow,
    handleCancelIncident,
    handleReviewLater,
    handleSettingsOpen,
    handleSettingsClose,
    handleMoreToolsOpen,
    handleMoreToolsClose,
    handleCloseWindow,
    showNotification: dispatchNotification,
    logout,

    // Dropdown options
    clientOptions,
    assignmentGroupOptions,
    secondaryResourceOptions,
    serviceLineOptions,
    applicationOptions,
    applicationCategoryOptions,
    applicationSubCategoryOptions,
    ticketSourceOptions,
    businessCategoryOptions,

    // ETA & Time Summary
    eta,
    setEta,
    handleEtaChange,
    timeSummary,
    timeEntries,
    timeEntriesLoading,

    // Composed hooks
    timer,
    navigation,
  };
};
