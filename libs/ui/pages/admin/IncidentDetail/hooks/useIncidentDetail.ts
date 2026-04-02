import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  useGetIncidentByNumberQuery,
  useGetIncidentsQuery,
  useUpdateIncidentMutation,
  useGetTimeEntriesQuery,
  useCreateTimeEntryMutation,
} from '../../../../../services';
import { useGetAllUsersMutation } from '@serviceops/services';
import { useAuth } from '@serviceops/hooks';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { showNotification } from '../../../../slices';
import { IncidentStatus, IUpdateIncidentInput } from '@serviceops/interfaces';
import { ModalType, TimeSummaryData } from '../types/incidentDetail.types';
import { useIncidentTimer } from './useIncidentTimer';
import { useIncidentNavigation } from './useIncidentNavigation';
import { calculateSLA, calculateTimeSummary } from '../utils/incidentDetail.utils';

export const useIncidentDetail = () => {
  const { number } = useParams<{ number: string }>();
  const { data: incident, isLoading, error, refetch } = useGetIncidentByNumberQuery(number || '');
  const { data: allIncidents } = useGetIncidentsQuery();
  const { user, isAdmin, logout } = useAuth();
  const [updateIncident] = useUpdateIncidentMutation();
  const [createTimeEntry] = useCreateTimeEntryMutation();
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
  const [editFormData, setEditFormData] = useState<IUpdateIncidentInput>({});

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // ETA state (defaults from due date, independently editable)
  const [eta, setEta] = useState<Date | null>(null);

  // Time entries query
  const {
    data: timeEntries,
    isLoading: timeEntriesLoading,
    refetch: refetchTimeEntries,
  } = useGetTimeEntriesQuery(incident?.id ?? 0, { skip: !incident });

  // Calculate time summary from time entries
  const timeSummary = useMemo<TimeSummaryData>(() => {
    return calculateTimeSummary(timeEntries ?? []);
  }, [timeEntries]);

  // Derive unique dropdown options — merge users list with existing incident values
  const userNames = useMemo<string[]>(
    () =>
      users
        .map((u) => u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim())
        .filter(Boolean),
    [users],
  );

  const clientOptions = useMemo<string[]>(() => {
    const fromIncidents = (allIncidents ?? [])
      .map((i) => i.client)
      .filter(Boolean) as string[];
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
        await updateIncident({ id: incident.id, data: { eta: newEta.toISOString() } }).unwrap();
      } catch {
        // ETA saved locally even if DB call fails silently
      }
    },
    [incident, updateIncident],
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
        await createTimeEntry({
          incidentId: incident.id,
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
    [incident, user, createTimeEntry, refetchTimeEntries, dispatch],
  );

  // Timer (resets when navigating to a different incident)
  const timer = useIncidentTimer(number, handleTimerSave);

  // Navigation
  const navigation = useIncidentNavigation(number, allIncidents);

  // Draft expiry countdown
  useEffect(() => {
    if (incident?.status !== IncidentStatus.DRAFT || !incident?.draftExpiresAt) return;

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

  // Reset edit + ETA state whenever incident number changes (navigation between incidents)
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
      isMajor: incident.isMajor,
      isRecurring: incident.isRecurring,
      isReleaseManagement: incident.isReleaseManagement,
      shortDescription: incident.shortDescription || undefined,
      description: incident.description || undefined,
    });
    setIsEditing(true);
  }, [incident]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditFormData({});
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!incident) return;
    try {
      await updateIncident({ id: incident.id, data: editFormData }).unwrap();
      setIsEditing(false);
      setEditFormData({});
      dispatch(showNotification({ message: 'Incident updated successfully', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to update incident', severity: 'error' }));
    }
  }, [incident, editFormData, updateIncident, refetch, dispatch]);

  const handleSaveAndClose = useCallback(async () => {
    await handleSaveEdit();
    window.close();
  }, [handleSaveEdit]);

  // Direct actions
  const handleAccept = useCallback(async () => {
    if (!incident || !user) return;
    try {
      await updateIncident({
        id: incident.id,
        data: {
          primaryResource: user.email,
          status: IncidentStatus.ASSIGNED,
        },
      }).unwrap();
      dispatch(
        showNotification({ message: 'Incident accepted and assigned to you', severity: 'success' }),
      );
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to accept incident', severity: 'error' }));
    }
  }, [incident, user, updateIncident, refetch, dispatch]);

  const handleFollow = useCallback(async () => {
    if (!incident || !user) return;
    try {
      const currentFollowers: string[] = incident.followers ? JSON.parse(incident.followers) : [];
      if (currentFollowers.includes(user.email)) {
        dispatch(
          showNotification({
            message: 'You are already following this incident',
            severity: 'info',
          }),
        );
        return;
      }
      currentFollowers.push(user.email);
      await updateIncident({
        id: incident.id,
        data: { followers: JSON.stringify(currentFollowers) },
      }).unwrap();
      dispatch(showNotification({ message: 'Now following this incident', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to follow incident', severity: 'error' }));
    }
  }, [incident, user, updateIncident, refetch, dispatch]);

  const handleCancelIncident = useCallback(async () => {
    if (!incident) return;
    try {
      await updateIncident({
        id: incident.id,
        data: { status: IncidentStatus.CANCELLED },
      }).unwrap();
      dispatch(showNotification({ message: 'Incident cancelled', severity: 'success' }));
      refetch();
    } catch {
      dispatch(showNotification({ message: 'Failed to cancel incident', severity: 'error' }));
    }
  }, [incident, updateIncident, refetch, dispatch]);

  const handleGoToActivity = useCallback(() => {
    setActiveTab(3);
  }, []);

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
    isLoading,
    error,
    allIncidents,
    user,
    isAdmin,
    refetch,
    isMobile,

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
    handleGoToActivity,
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
