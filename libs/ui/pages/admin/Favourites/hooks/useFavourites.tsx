import React, { useState, useEffect, useMemo } from 'react';
import { IconButton, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Column } from '@serviceops/component';
import { useGetIncidentsQuery, useGetDraftIncidentsQuery } from '@serviceops/services';
import { IIncident } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import PriorityChip from '../components/PriorityChip';
import StatusChip from '../components/StatusChip';
import { IncidentRow } from '../types/Favourites.types';
import {
  FAVORITES_KEY,
  TICKET_TABS,
  EMPTY_MESSAGES,
  getFilteredData as filterData,
} from '../utils/Favourites.utils';

const useFavourites = () => {
  const { AdminPath } = constants;

  const { data: incidents, isLoading: incidentsLoading } = useGetIncidentsQuery();
  const { data: draftIncidents, isLoading: draftsLoading } = useGetDraftIncidentsQuery();
  const isLoading = incidentsLoading || draftsLoading;

  const [tabValue, setTabValue] = useState(0);
  const [tableSearch, setTableSearch] = useState('');

  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        setFavorites(stored ? new Set(JSON.parse(stored)) : new Set());
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const removeFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const favoriteIncidents = useMemo(() => {
    const map = new Map<number, IIncident>();
    (incidents || []).forEach((inc) => map.set(inc.id, inc));
    (draftIncidents || []).forEach((inc) => {
      if (!map.has(inc.id)) map.set(inc.id, inc);
    });
    return Array.from(map.values()).filter((inc) => favorites.has(inc.id));
  }, [incidents, draftIncidents, favorites]);

  const openIncident = (number: string) => {
    window.open(
      `${window.location.origin}${AdminPath.INCIDENT_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const tabData: IIncident[][] = [favoriteIncidents, favoriteIncidents, [], [], [], [], []];

  const columns: Column<IncidentRow>[] = [
    { id: 'sno', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
    {
      id: 'number',
      label: 'Ticket #',
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
      label: 'Remove',
      minWidth: 80,
      align: 'center',
      sortable: false,
      format: (_v, row: IncidentRow): React.ReactNode => (
        <IconButton size='small' onClick={(e) => removeFavorite(row.id, e)}>
          <StarIcon sx={{ color: '#faaf00', fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const getFilteredData = (list: IIncident[]) => filterData(list, tableSearch);

  return {
    isLoading,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabData,
    columns,
    openIncident,
    getFilteredData,
    TICKET_TABS,
    EMPTY_MESSAGES,
  };
};

export default useFavourites;
