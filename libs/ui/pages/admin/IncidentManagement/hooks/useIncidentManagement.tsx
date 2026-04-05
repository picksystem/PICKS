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
import { Column } from '@serviceops/component';
import { useGetIncidentsQuery, useGetDraftIncidentsQuery } from '@serviceops/services';
import { IIncident } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import PriorityChip from '../components/PriorityChip';
import StatusChip from '../components/StatusChip';
import { IncidentRow } from '../types/IncidentManagement.types';
import {
  FAVORITES_KEY,
  buildTabLists,
  getFilteredData as filterData,
} from '../utils/IncidentManagement.utils';

const useIncidentManagement = () => {
  const { AdminPath } = constants;

  const {
    data: incidents,
    isLoading: incidentsLoading,
    error: incidentsError,
  } = useGetIncidentsQuery();
  const {
    data: draftIncidents,
    isLoading: draftsLoading,
    error: draftsError,
  } = useGetDraftIncidentsQuery();

  const isLoading = incidentsLoading || draftsLoading;
  const error = incidentsError || draftsError;

  const allIncidents = useMemo(() => {
    const map = new Map<number, IIncident>();
    (incidents || []).forEach((inc) => map.set(inc.id, inc));
    (draftIncidents || []).forEach((inc) => {
      if (!map.has(inc.id)) map.set(inc.id, inc);
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
      // eslint-disable-next-line no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [tabValue, setTabValue] = useState(0);
  const [tableSearch, setTableSearch] = useState('');

  const tabLists = useMemo(() => buildTabLists(allIncidents), [allIncidents]);

  const openIncident = (number: string) => {
    window.open(
      `${window.location.origin}${AdminPath.INCIDENT_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const tabLabels = [
    { label: `All (${tabLists[0].length})`, icon: <AssignmentIcon /> },
    { label: `New (${tabLists[1].length})`, icon: <FiberNewIcon /> },
    { label: `In Progress (${tabLists[2].length})`, icon: <AutorenewIcon /> },
    { label: `On Hold (${tabLists[3].length})`, icon: <PauseCircleIcon /> },
    { label: `Resolved (${tabLists[4].length})`, icon: <CheckCircleIcon /> },
    { label: `Drafts (${tabLists[5].length})`, icon: <DraftsIcon /> },
  ];

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
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabLists,
    tabLabels,
    columns,
    openIncident,
    getFilteredData,
  };
};

export default useIncidentManagement;
