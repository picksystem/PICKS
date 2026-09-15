import React, { useEffect, useMemo, useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Column, PriorityChip, StatusChip } from '@serviceops/component';
import { useGetTicketsQuery, useGetDraftTicketsQuery } from '@serviceops/services';
import { IIncident, IncidentStatus } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import { IncidentRow } from '../types/IncidentManagement.types';
import { FAVORITES_KEY, getFilteredData as filterData } from '../utils/IncidentManagement.utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'All', icon: <AssignmentIcon /> },
  { value: IncidentStatus.NEW, label: 'New', icon: <FiberNewIcon /> },
  { value: 'in_progress', label: 'In Progress', icon: <AutorenewIcon /> },
  { value: IncidentStatus.ON_HOLD, label: 'On Hold', icon: <PauseCircleIcon /> },
  { value: IncidentStatus.RESOLVED, label: 'Resolved', icon: <CheckCircleIcon /> },
  { value: IncidentStatus.DRAFT, label: 'Drafts', icon: <DraftsIcon /> },
];

const useIncidentManagement = () => {
  const { BasePath } = constants;

  const {
    data: incidents,
    isLoading: incidentsLoading,
    error: incidentsError,
  } = useGetTicketsQuery({ ticketType: 'incident' });
  const {
    data: draftIncidents,
    isLoading: draftsLoading,
    error: draftsError,
  } = useGetDraftTicketsQuery({ ticketType: 'incident' });

  const isLoading = incidentsLoading || draftsLoading;
  const error = incidentsError || draftsError;

  const allIncidents = useMemo(() => {
    const map = new Map<number, IIncident>();
    (incidents || []).forEach((t) => {
      if ((t as any).ticketType === 'incident') {
        map.set(t.id, t as IIncident);
      }
    });
    (draftIncidents || []).forEach((t) => {
      if ((t as any).ticketType === 'incident' && !map.has(t.id)) {
        map.set(t.id, t as IIncident);
      }
    });
    return Array.from(map.values());
  }, [incidents, draftIncidents]);

  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  const filteredList = useMemo(() => {
    if (selectedStatus === 'all') return allIncidents;
    if (selectedStatus === 'in_progress') {
      return allIncidents.filter(
        (i) =>
          i.status === IncidentStatus.IN_PROGRESS ||
          i.status === IncidentStatus.ASSIGNED,
      );
    }
    return allIncidents.filter((i) => i.status === selectedStatus);
  }, [allIncidents, selectedStatus]);

  const openIncident = (number: string) => {
    window.open(
      `${window.location.origin}${BasePath.INCIDENT_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const statusFilterOptions = STATUS_FILTERS.map(({ value, label, icon }) => ({
    value,
    label,
    icon,
  }));

  const getCountForStatus = (statusValue: string): number => {
    if (statusValue === 'all') return allIncidents.length;
    if (statusValue === 'in_progress') {
      return allIncidents.filter(
        (i) =>
          i.status === IncidentStatus.IN_PROGRESS ||
          i.status === IncidentStatus.ASSIGNED,
      ).length;
    }
    return allIncidents.filter((i) => i.status === statusValue).length;
  };

  const columns: Column<IncidentRow>[] = [
    { id: 'sno', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
    {
      id: 'number',
      label: 'Ticket',
      minWidth: 130,
      format: (v, row): React.ReactNode => (
        <Typography
          variant='body2'
          component='span'
          onClick={(e) => {
            e.stopPropagation();
            openIncident((row as IncidentRow).number);
          }}
          sx={{
            color: 'primary.main',
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {String(v || '-')}
        </Typography>
      ),
    },
    {
      id: 'shortDescription',
      label: 'Short Description',
      minWidth: 240,
      format: (v): React.ReactNode => (
        <Typography variant='body2' noWrap sx={{ maxWidth: 320 }}>
          {String(v || '-')}
        </Typography>
      ),
    },
    { id: 'caller', label: 'Affected user', minWidth: 140, format: (v) => String(v || '-') },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 120,
      align: 'center',
      format: (v): React.ReactNode => <PriorityChip value={v} />,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      align: 'center',
      format: (v): React.ReactNode => <StatusChip value={v} />,
    },
    {
      id: 'assignmentGroup',
      label: 'Assignment Group',
      minWidth: 160,
      format: (v): React.ReactNode => String(v || '-'),
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      format: (v): React.ReactNode =>
        v
          ? new Date(v as string).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '-',
    },
    {
      id: 'favorite' as keyof IncidentRow,
      label: 'Favorite',
      minWidth: 50,
      align: 'center',
      sortable: false,
      format: (_v, row: IncidentRow): React.ReactNode => (
        <IconButton size='small' onClick={(e) => toggleFavorite(row.id, e)}>
          {favorites.has(row.id) ? (
            <StarIcon sx={{ color: '#faaf00', fontSize: 18 }} />
          ) : (
            <StarBorderIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          )}
        </IconButton>
      ),
    },
  ];

  const getFilteredData = (list: IIncident[]) => filterData(list, tableSearch);

  return {
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    statusFilterOptions,
    getCountForStatus,
    allIncidents,
    filteredList,
    columns,
    openIncident,
    tableSearch,
    setTableSearch,
    getFilteredData,
  };
};

export default useIncidentManagement;
