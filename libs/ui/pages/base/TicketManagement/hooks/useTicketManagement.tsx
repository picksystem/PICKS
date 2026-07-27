import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { Column } from '@serviceops/component';
import {
  useGetTicketsQuery,
  useGetDraftTicketsQuery,
  useGetTicketTypeQuery,
} from '@serviceops/services';
import { IIncident, IServiceRequest, IAdvisoryRequest, ITicketType } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import PriorityChip from '../components/PriorityChip';
import StatusChip from '../components/StatusChip';
import TicketTypeChip from '../components/TicketTypeChip';
import { TicketKind, TicketManagementRow } from '../types/TicketManagement.types';
import { getFilteredData as filterData } from '../utils/TicketManagement.utils';

const dedupeById = <T extends { id: number }>(primary: T[] = [], drafts: T[] = []): T[] => {
  const map = new Map<number, T>();
  primary.forEach((item) => map.set(item.id, item));
  drafts.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
};

const toRow = (
  ticket: IIncident | IServiceRequest | IAdvisoryRequest,
  ticketType: TicketKind,
  ticketTypeName: string,
): TicketManagementRow => ({
  rowId: `${ticketType}-${ticket.id}`,
  sno: 0,
  id: ticket.id,
  number: ticket.number,
  ticketType,
  ticketTypeName,
  shortDescription: ticket.shortDescription,
  caller: ticket.caller,
  priority: ticket.priority,
  status: ticket.status,
  assignmentGroup: ticket.assignmentGroup,
  createdAt: ticket.createdAt,
});

const useTicketManagement = () => {
  const { BasePath } = constants;

  const {
    data: incidents,
    isLoading: incidentsLoading,
    error: incidentsError,
  } = useGetTicketsQuery({ ticketType: 'incident' });
  const { data: draftIncidents, isLoading: draftIncidentsLoading } =
    useGetDraftTicketsQuery({ ticketType: 'incident' });

  const {
    data: serviceRequests,
    isLoading: serviceRequestsLoading,
    error: serviceRequestsError,
  } = useGetTicketsQuery({ ticketType: 'service_request' });
  const { data: draftServiceRequests, isLoading: draftServiceRequestsLoading } =
    useGetDraftTicketsQuery({ ticketType: 'service_request' });

  const {
    data: advisoryRequests,
    isLoading: advisoryRequestsLoading,
    error: advisoryRequestsError,
  } = useGetTicketsQuery({ ticketType: 'advisory_request' });
  const { data: draftAdvisoryRequests, isLoading: draftAdvisoryRequestsLoading } =
    useGetDraftTicketsQuery({ ticketType: 'advisory_request' });

  const {
    data: ticketTypesRaw,
    isLoading: ticketTypesLoading,
    error: ticketTypesError,
  } = useGetTicketTypeQuery();

  const isLoading =
    incidentsLoading ||
    draftIncidentsLoading ||
    serviceRequestsLoading ||
    draftServiceRequestsLoading ||
    advisoryRequestsLoading ||
    draftAdvisoryRequestsLoading ||
    ticketTypesLoading;

  const error = incidentsError || serviceRequestsError || advisoryRequestsError || ticketTypesError;

  const typeNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    (ticketTypesRaw || []).forEach((tt: ITicketType) => map.set(tt.type, tt.name));
    return map;
  }, [ticketTypesRaw]);

  const nameForType = (type: TicketKind, fallback: string) => typeNameByKey.get(type) ?? fallback;

  const allTickets = useMemo<TicketManagementRow[]>(() => {
    const incidentRows = dedupeById(incidents, draftIncidents).map((t) =>
      toRow(t as any, 'incident', nameForType('incident', 'Incident')),
    );
    const serviceRequestRows = dedupeById(serviceRequests, draftServiceRequests).map((t) =>
      toRow(t as any, 'service_request', nameForType('service_request', 'Service Request')),
    );
    const advisoryRequestRows = dedupeById(advisoryRequests, draftAdvisoryRequests).map((t) =>
      toRow(t as any, 'advisory_request', nameForType('advisory_request', 'Advisory Request')),
    );
    return [...incidentRows, ...serviceRequestRows, ...advisoryRequestRows];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    incidents,
    draftIncidents,
    serviceRequests,
    draftServiceRequests,
    advisoryRequests,
    draftAdvisoryRequests,
    typeNameByKey,
  ]);

  const ticketTypes = useMemo(
    () =>
      (ticketTypesRaw || [])
        .filter((tt) => tt.isActive)
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [ticketTypesRaw],
  );

  const [tabValue, setTabValue] = useState(0);
  const [tableSearch, setTableSearch] = useState('');

  const tabLists = useMemo<TicketManagementRow[][]>(
    () => [
      allTickets,
      ...ticketTypes.map((tt) => allTickets.filter((t) => t.ticketType === tt.type)),
    ],
    [allTickets, ticketTypes],
  );

  const openTicket = (number: string) => {
    window.open(
      `${window.location.origin}${BasePath.TICKET_DETAIL.replace(':number', number)}`,
      '_blank',
    );
  };

  const tabLabels = useMemo(
    () => [
      { label: `All (${tabLists[0].length})`, icon: <AssignmentIcon /> },
      ...ticketTypes.map((tt, i) => ({
        label: `${tt.name} (${tabLists[i + 1].length})`,
        icon: <ConfirmationNumberIcon />,
      })),
    ],
    [tabLists, ticketTypes],
  );

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
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabLists,
    tabLabels,
    ticketTypes,
    columns,
    openTicket,
    getFilteredData,
  };
};

export default useTicketManagement;
