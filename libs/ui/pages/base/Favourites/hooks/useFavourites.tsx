import React, { useState, useEffect, useMemo } from 'react';
import { IconButton, Typography } from '@mui/material';
import { Column } from '@serviceops/component';
import StarIcon from '@mui/icons-material/Star';
import {
  useGetTicketsQuery,
  useGetDraftTicketsQuery,
  useGetTicketTypeQuery,
} from '@serviceops/services';
import { IAdminTicket, ITicketType } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import { FavouriteRow } from '../types/Favourites.types';
import PriorityChip from '../components/PriorityChip';
import StatusChip from '../components/StatusChip';
import TicketTypeChip from '../components/TicketTypeChip';
import {
  FAVORITES_KEY as FAVORITES_INCIDENTS_KEY,
  getFilteredData as filterData,
} from '../utils/Favourites.utils';
import { FAVORITES_KEY as FAVORITES_TICKETS_KEY } from '../../TicketManagement/utils/TicketManagement.utils';

const dedupeById = (primary: IAdminTicket[] = [], drafts: IAdminTicket[] = []): IAdminTicket[] => {
  const map = new Map<number, IAdminTicket>();
  primary.forEach((item) => map.set(item.id, item));
  drafts.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const toRow = (ticket: IAdminTicket, ticketTypeName: string): FavouriteRow => ({
  rowId: `${ticket.ticketType}-${ticket.id}`,
  sno: 0,
  id: ticket.id,
  number: ticket.number,
  ticketType: ticket.ticketType,
  ticketTypeName,
  shortDescription: ticket.shortDescription ?? null,
  caller: ticket.caller ?? '',
  priority: ticket.priority ?? null,
  status: ticket.status ?? null,
  assignmentGroup: ticket.assignmentGroup ?? null,
  createdAt: ticket.createdAt,
});

const useFavourites = () => {
  const { BasePath } = constants;

  const {
    data: allTicketsRaw,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useGetTicketsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  });

  const {
    data: allDraftsRaw,
    isLoading: draftsLoading,
    error: draftsError,
  } = useGetDraftTicketsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  });

  const {
    data: ticketTypesRaw,
    isLoading: ticketTypesLoading,
    error: ticketTypesError,
  } = useGetTicketTypeQuery();

  const isLoading = ticketsLoading || draftsLoading || ticketTypesLoading;
  const error = ticketsError || draftsError || ticketTypesError;

  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const readFavorites = (): Set<number> => {
    try {
      const merged = new Set<number>();
      const incidents = localStorage.getItem(FAVORITES_INCIDENTS_KEY);
      const tickets = localStorage.getItem(FAVORITES_TICKETS_KEY);
      if (incidents) JSON.parse(incidents).forEach((id: number) => merged.add(id));
      if (tickets) JSON.parse(tickets).forEach((id: number) => merged.add(id));
      return merged;
    } catch {
      return new Set();
    }
  };

  const [favorites, setFavorites] = useState<Set<number>>(() => readFavorites());

  useEffect(() => {
    const handleStorage = () => {
      setFavorites(readFavorites());
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
      localStorage.removeItem(FAVORITES_INCIDENTS_KEY);
      const inc = localStorage.getItem(FAVORITES_INCIDENTS_KEY);
      if (inc) {
        const arr = JSON.parse(inc).filter((v: number) => v !== id);
        localStorage.setItem(FAVORITES_INCIDENTS_KEY, JSON.stringify(arr));
      }
      const tix = localStorage.getItem(FAVORITES_TICKETS_KEY);
      if (tix) {
        const arr = JSON.parse(tix).filter((v: number) => v !== id);
        localStorage.setItem(FAVORITES_TICKETS_KEY, JSON.stringify(arr));
      }
      return next;
    });
  };

  // Merge primary tickets + drafts, coerce customFieldValues, sort newest-first
  const allTickets = useMemo(() => {
    const primary = (allTicketsRaw || []) as IAdminTicket[];
    const drafts = (allDraftsRaw || []) as IAdminTicket[];
    const merged = dedupeById(primary, drafts);
    return merged.map((t) => {
      const raw = (t as any).customFieldValues;
      let parsed: Record<string, string> = {};
      if (raw === null || raw === '') {
        parsed = {};
      } else if (typeof raw === 'string') {
        try {
          const obj = JSON.parse(raw);
          parsed =
            typeof obj === 'object' && obj !== null
              ? Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]))
              : {};
        } catch {
          parsed = {};
        }
      } else if (typeof raw === 'object') {
        parsed = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
      }
      return { ...(t as IAdminTicket), customFieldValues: parsed };
    });
  }, [allTicketsRaw, allDraftsRaw]);

  // Map ticket type keys to display names
  const typeNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    (ticketTypesRaw || []).forEach((tt: ITicketType) => map.set(tt.type, tt.name));
    return map;
  }, [ticketTypesRaw]);

  // Active ticket types sorted by displayOrder
  const ticketTypes = useMemo(
    () =>
      (ticketTypesRaw || [])
        .filter((tt) => tt.isActive)
        .slice()
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [ticketTypesRaw],
  );

  // Convert all tickets to rows
  const allRows = useMemo(() => {
    return allTickets.map((t) => toRow(t, typeNameByKey.get(t.ticketType) ?? t.ticketType));
  }, [allTickets, typeNameByKey]);

  // Filter by favorites
  const favoriteRows = useMemo(() => {
    return allRows.filter((r) => favorites.has(r.id));
  }, [allRows, favorites]);

  // Filter by selected ticket type
  const filteredList = useMemo<FavouriteRow[]>(() => {
    if (!selectedTicketType) return favoriteRows;
    return favoriteRows.filter((r) => r.ticketType === selectedTicketType);
  }, [favoriteRows, selectedTicketType]);

  // Build dropdown options from active ticket types
  const ticketTypeOptions = useMemo(
    () =>
      ticketTypes.map((tt) => ({
        value: tt.type,
        label: tt.name,
      })),
    [ticketTypes],
  );

  const openIncident = (number: string) => {
    window.open(
      `${window.location.origin}${BasePath.INCIDENT_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const columns: Column<FavouriteRow>[] = [
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
            openIncident((row as FavouriteRow).number);
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
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 150,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <TicketTypeChip type={row.ticketType} name={row.ticketTypeName} />
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
      id: 'favorite' as keyof FavouriteRow,
      label: 'Remove',
      minWidth: 80,
      align: 'center',
      sortable: false,
      format: (_v, row: FavouriteRow): React.ReactNode => (
        <IconButton size='small' onClick={(e) => removeFavorite(row.id, e)}>
          <StarIcon sx={{ color: '#faaf00', fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const getFilteredData = (list: FavouriteRow[]) => filterData(list, tableSearch);

  return {
    isLoading,
    error,
    selectedTicketType,
    setSelectedTicketType,
    ticketTypeOptions,
    filteredList,
    favoriteRows,
    ticketTypes,
    columns,
    openIncident,
    getFilteredData,
    tableSearch,
    setTableSearch,
  };
};

export default useFavourites;
