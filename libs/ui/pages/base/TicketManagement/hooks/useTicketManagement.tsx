import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { Column } from '@serviceops/component';
import {
  useGetTicketsQuery,
  useGetDraftTicketsQuery,
  useGetTicketTypeQuery,
} from '@serviceops/services';
import { IAdminTicket, ITicketType } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import PriorityChip from '../components/PriorityChip';
import StatusChip from '../components/StatusChip';
import TicketTypeChip from '../components/TicketTypeChip';
import { TicketManagementRow } from '../types/TicketManagement.types';
import { getFilteredData as filterData } from '../utils/TicketManagement.utils';

const dedupeById = (primary: IAdminTicket[] = [], drafts: IAdminTicket[] = []): IAdminTicket[] => {
  const map = new Map<number, IAdminTicket>();
  primary.forEach((item) => map.set(item.id, item));
  drafts.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const toRow = (ticket: IAdminTicket, ticketTypeName: string): TicketManagementRow => ({
  rowId: `${ticket.ticketType}-${ticket.id}`,
  sno: 0,
  id: ticket.id,
  number: ticket.number,
  ticketType: ticket.ticketType,
  ticketTypeName,
  shortDescription: ticket.shortDescription ?? null,
  caller: ticket.caller ?? null,
  priority: ticket.priority ?? null,
  status: ticket.status ?? null,
  assignmentGroup: ticket.assignmentGroup ?? null,
  createdAt: ticket.createdAt,
});

const useTicketManagement = () => {
  const { BasePath } = constants;

  // Fetch ALL tickets — no type filter, so every ticket type (task, change, demo, etc.)
  // is included. The API endpoint returns all types when ticketType is not provided.
  const {
    data: allTicketsRaw,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useGetTicketsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  });

  // Fetch ALL drafts — no type filter
  const {
    data: allDraftsRaw,
    isLoading: draftsLoading,
    refetch: refetchDrafts,
  } = useGetDraftTicketsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  });

  // Fetch ticket type definitions for tab labels
  const {
    data: ticketTypesRaw,
    isLoading: ticketTypesLoading,
    error: ticketTypesError,
  } = useGetTicketTypeQuery();

  const isLoading = ticketsLoading || draftsLoading || ticketTypesLoading;
  const error = ticketsError || ticketTypesError;

  // Merge primary tickets + drafts, safely coerce customFieldValues
  const allTickets = useMemo<IAdminTicket[]>(() => {
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

  // Convert tickets to rows
  const allRows = useMemo<TicketManagementRow[]>(() => {
    return allTickets.map((t) => toRow(t, typeNameByKey.get(t.ticketType) ?? t.ticketType));
  }, [allTickets, typeNameByKey]);

  const [selectedTicketType, setSelectedTicketType] = useState('');

  // Build dropdown options from active ticket types
  const ticketTypeOptions = useMemo(
    () =>
      ticketTypes.map((tt) => ({
        value: tt.type,
        label: tt.name,
      })),
    [ticketTypes],
  );

  // Filter the ticket list based on the selected ticket type (or show all)
  const filteredList = useMemo<TicketManagementRow[]>(() => {
    if (!selectedTicketType) return allRows;
    return allRows.filter((r) => r.ticketType === selectedTicketType);
  }, [allRows, selectedTicketType]);

  const openTicket = (number: string) => {
    window.open(
      `${window.location.origin}${BasePath.TICKET_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const [tableSearch, setTableSearch] = useState('');

  const columns: Column<TicketManagementRow>[] = [
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
            openTicket((row as TicketManagementRow).number);
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
    { id: 'caller', label: 'Requested By', minWidth: 140, format: (v) => String(v || '-') },
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
  ];

  const getFilteredData = (list: TicketManagementRow[]) => filterData(list, tableSearch);

  return {
    isLoading,
    error,
    selectedTicketType,
    setSelectedTicketType,
    ticketTypeOptions,
    filteredList,
    allRows,
    ticketTypes,
    columns,
    openTicket,
    getFilteredData,
    tableSearch,
    setTableSearch,
  };
};

export default useTicketManagement;
