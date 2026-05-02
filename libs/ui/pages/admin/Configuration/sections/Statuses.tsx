import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Link,
  alpha,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable, Column, Loader } from '@serviceops/component';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';

// ── Color presets ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#6366f1',
  '#2563eb',
  '#0284c7',
  '#0f766e',
  '#15803d',
  '#ca8a04',
  '#ea580c',
  '#b91c1c',
  '#db2777',
  '#374151',
];

// ── Default ticket statuses ───────────────────────────────────────────────────

const DEFAULT_STATUSES: IConfigStatusLevel[] = [
  {
    id: 'new',
    name: 'new',
    displayName: 'New',
    description: 'Ticket has been created and is awaiting assignment',
    color: '#fff',
    bgColor: '#6366f1',
    sortOrder: 1,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'assigned',
    name: 'assigned',
    displayName: 'Assigned',
    description: 'Ticket has been assigned to an agent or team',
    color: '#fff',
    bgColor: '#2563eb',
    sortOrder: 2,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'in_progress',
    name: 'in_progress',
    displayName: 'In Progress',
    description: 'An agent is actively working on the ticket',
    color: '#fff',
    bgColor: '#0284c7',
    sortOrder: 3,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'on_hold',
    name: 'on_hold',
    displayName: 'On Hold',
    description: 'Work is paused, waiting for customer response or third-party action',
    color: '#fff',
    bgColor: '#ca8a04',
    sortOrder: 4,
    isActive: true,
    slaActive: false,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'resolved',
    name: 'resolved',
    displayName: 'Resolved',
    description: 'Issue has been resolved and awaiting confirmation from the requester',
    color: '#fff',
    bgColor: '#15803d',
    sortOrder: 5,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
  {
    id: 'closed',
    name: 'closed',
    displayName: 'Closed',
    description: 'Ticket has been confirmed as resolved and is now closed',
    color: '#fff',
    bgColor: '#374151',
    sortOrder: 6,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
  {
    id: 'cancelled',
    name: 'cancelled',
    displayName: 'Cancelled',
    description: 'Ticket was cancelled and will not be worked on',
    color: '#fff',
    bgColor: '#b91c1c',
    sortOrder: 7,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
];

// ── Default release cycle statuses ────────────────────────────────────────────

const DEFAULT_RELEASE_STATUSES: IConfigStatusLevel[] = [
  {
    id: 'awaiting_design_approval',
    name: 'awaiting_design_approval',
    displayName: 'Awaiting Design Approval',
    description: 'Release is pending design team sign-off',
    color: '#fff',
    bgColor: '#7c3aed',
    sortOrder: 1,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'awaiting_estimates_approval',
    name: 'awaiting_estimates_approval',
    displayName: 'Awaiting Estimates Approval',
    description: 'Release effort estimates are pending approval',
    color: '#fff',
    bgColor: '#6366f1',
    sortOrder: 2,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'awaiting_internal_approval',
    name: 'awaiting_internal_approval',
    displayName: 'Awaiting Internal Approval',
    description: 'Release is pending internal stakeholder approval',
    color: '#fff',
    bgColor: '#0284c7',
    sortOrder: 3,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'under_deployment',
    name: 'under_deployment',
    displayName: 'Under Deployment',
    description: 'Release is actively being deployed to the target environment',
    color: '#fff',
    bgColor: '#0891b2',
    sortOrder: 4,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'pending_deployment',
    name: 'pending_deployment',
    displayName: 'Pending Deployment',
    description: 'Release is approved and queued for deployment',
    color: '#fff',
    bgColor: '#0f766e',
    sortOrder: 5,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'awaiting_uat',
    name: 'awaiting_uat',
    displayName: 'Awaiting UAT',
    description: 'Release is deployed and waiting for user acceptance testing',
    color: '#fff',
    bgColor: '#ca8a04',
    sortOrder: 6,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'uat_approved',
    name: 'uat_approved',
    displayName: 'UAT Approved',
    description: 'User acceptance testing has been completed and approved',
    color: '#fff',
    bgColor: '#15803d',
    sortOrder: 7,
    isActive: true,
    slaActive: false,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'awaiting_cab_approval',
    name: 'awaiting_cab_approval',
    displayName: 'Awaiting CAB Approval',
    description: 'Release is pending Change Advisory Board approval',
    color: '#fff',
    bgColor: '#ea580c',
    sortOrder: 8,
    isActive: true,
    slaActive: true,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'cab_approved',
    name: 'cab_approved',
    displayName: 'CAB Approved',
    description: 'Change Advisory Board has approved the release for production',
    color: '#fff',
    bgColor: '#16a34a',
    sortOrder: 9,
    isActive: true,
    slaActive: false,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'prod_release_scheduled',
    name: 'prod_release_scheduled',
    displayName: 'PROD Release Scheduled',
    description: 'Release has been scheduled for production deployment',
    color: '#fff',
    bgColor: '#2563eb',
    sortOrder: 10,
    isActive: true,
    slaActive: false,
    isFinal: false,
    enabledFor: {},
  },
  {
    id: 'release_closed',
    name: 'release_closed',
    displayName: 'Closed',
    description: 'Release cycle has been completed and closed',
    color: '#fff',
    bgColor: '#374151',
    sortOrder: 11,
    isActive: true,
    slaActive: false,
    isFinal: true,
    enabledFor: {},
  },
];

// ── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const Section = ({
  icon,
  title,
  subtitle,
  accentColor,
  defaultExpanded = false,
  children,
}: SectionProps) => {
  const { classes } = useStyles();
  return (
    <Accordion defaultExpanded={defaultExpanded} className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>{title}</Typography>
            <Typography className={classes.sectionSubtitle}>{subtitle}</Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

// ── Reusable status badge column cell ─────────────────────────────────────────

const StatusBadgeCell = ({ row }: { row: IConfigStatusLevel }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: row.bgColor,
        flexShrink: 0,
        border: '1px solid rgba(0,0,0,0.12)',
      }}
    />
    <Chip
      label={row.displayName}
      size='small'
      sx={{
        bgcolor: row.bgColor,
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: 1.5,
      }}
    />
    {row.isFinal && (
      <Chip
        label='Final'
        size='small'
        variant='outlined'
        sx={{ fontSize: '0.65rem', height: 18, borderRadius: 1 }}
      />
    )}
  </Box>
);

// ── Main Statuses section ─────────────────────────────────────────────────────

const Statuses = () => {
  const { classes } = useStyles();
  const {
    statuses: apiStatuses,
    releaseStatuses: apiReleaseStatuses,
    saveSection,
    isLoading,
  } = useConfiguration();
  const { data: ticketTypes = [] } = useGetTicketTypeQuery();

  const activeTicketTypeColumns =
    ticketTypes.length > 0
      ? ticketTypes
          .filter((t) => t.isActive)
          .map((t) => ({ key: t.type, label: t.displayName || t.type }))
      : [
          { key: 'incident', label: 'Incident' },
          { key: 'service_request', label: 'Service Request' },
          { key: 'advisory_request', label: 'Advisory' },
          { key: 'change_request', label: 'Change Request' },
          { key: 'problem_request', label: 'Problem Request' },
          { key: 'task', label: 'Task' },
        ];

  // ── Ticket Statuses state ────────────────────────────────────────────────

  const [statuses, setStatuses] = useState<IConfigStatusLevel[]>(DEFAULT_STATUSES);

  useEffect(() => {
    if (!apiStatuses) return;
    if (apiStatuses.items && apiStatuses.items.length > 0) {
      setStatuses(apiStatuses.items as IConfigStatusLevel[]);
    }
  }, [apiStatuses]);

  const persistStatuses = (items: IConfigStatusLevel[]) => saveSection('statuses', { items });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadDefaults, setLoadDefaults] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<IConfigStatusLevel | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [statusForm, setStatusForm] = useState<Partial<IConfigStatusLevel>>({});

  const selectedStatus = statuses.find((s) => s.id === selectedId) ?? null;

  const initStatusForm = (editing: IConfigStatusLevel | null) => {
    setStatusForm(
      editing
        ? {
            displayName: editing.displayName,
            description: editing.description,
            bgColor: editing.bgColor,
            isActive: editing.isActive,
            slaActive: editing.slaActive,
            isFinal: editing.isFinal,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            displayName: '',
            description: '',
            bgColor: '#6366f1',
            isActive: true,
            slaActive: true,
            isFinal: false,
            enabledFor: Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
          },
    );
  };

  const handleOpenAdd = () => {
    setEditingStatus(null);
    initStatusForm(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedStatus) {
      setEditingStatus(selectedStatus);
      initStatusForm(selectedStatus);
      setDialogOpen(true);
    }
  };

  const handleSave = () => {
    let next: IConfigStatusLevel[];
    if (editingStatus) {
      next = statuses.map((s) => (s.id === editingStatus.id ? { ...s, ...statusForm } : s));
    } else {
      const id =
        (statusForm.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') ||
        `status_${Date.now()}`;
      const allEnabled = Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true]));
      const newItem: IConfigStatusLevel = {
        id,
        name: id,
        displayName: statusForm.displayName ?? id,
        description: statusForm.description ?? '',
        color: '#fff',
        bgColor: statusForm.bgColor ?? '#6366f1',
        sortOrder: statuses.length + 1,
        isActive: statusForm.isActive ?? true,
        slaActive: statusForm.slaActive ?? true,
        isFinal: statusForm.isFinal ?? false,
        enabledFor: statusForm.enabledFor ?? allEnabled,
      };
      next = [...statuses, newItem];
    }
    setStatuses(next);
    persistStatuses(next);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedId) {
      const next = statuses.filter((s) => s.id !== selectedId);
      setStatuses(next);
      persistStatuses(next);
      setSelectedId(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadDefaults(checked);
    if (checked) {
      setStatuses(DEFAULT_STATUSES);
      setSelectedId(null);
      persistStatuses(DEFAULT_STATUSES);
    }
  };

  const handleToggleActive = (id: string) => {
    const next = statuses.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setStatuses(next);
    persistStatuses(next);
  };

  const handleToggleSlaActive = (id: string) => {
    const next = statuses.map((s) => (s.id === id ? { ...s, slaActive: !s.slaActive } : s));
    setStatuses(next);
    persistStatuses(next);
  };

  const handleToggleEnabledFor = (id: string, ticketType: string) => {
    const next = statuses.map((s) =>
      s.id === id
        ? { ...s, enabledFor: { ...s.enabledFor, [ticketType]: !s.enabledFor[ticketType] } }
        : s,
    );
    setStatuses(next);
    persistStatuses(next);
  };

  const filteredStatuses = search
    ? statuses.filter((s) =>
        [s.displayName, s.description].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : statuses;

  const ticketColumns: Column<IConfigStatusLevel>[] = [
    {
      id: 'displayName',
      label: 'Ticket Statuses',
      minWidth: 140,
      format: (_v, row): React.ReactNode => <StatusBadgeCell row={row} />,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Status Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    },
    {
      id: 'slaActive',
      label: 'SLA Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.slaActive}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleSlaActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='primary'
        />
      ),
    },
    ...activeTicketTypeColumns.map(
      (t): Column<IConfigStatusLevel> => ({
        id: 'enabledFor' as keyof IConfigStatusLevel,
        label: t.label,
        minWidth: 90,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? true}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleEnabledFor(row.id, t.key);
            }}
            onClick={(e) => e.stopPropagation()}
            color='success'
          />
        ),
      }),
    ),
  ];

  // ── Release Cycle Statuses state ─────────────────────────────────────────

  const [releaseStatuses, setReleaseStatuses] =
    useState<IConfigStatusLevel[]>(DEFAULT_RELEASE_STATUSES);

  useEffect(() => {
    if (!apiReleaseStatuses) return;
    if (apiReleaseStatuses.items && apiReleaseStatuses.items.length > 0) {
      setReleaseStatuses(apiReleaseStatuses.items as IConfigStatusLevel[]);
    }
  }, [apiReleaseStatuses]);

  const persistReleaseStatuses = (items: IConfigStatusLevel[]) =>
    saveSection('releaseStatuses', { items });

  const [relSelectedId, setRelSelectedId] = useState<string | null>(null);
  const [relSearch, setRelSearch] = useState('');
  const [relLoadDefaults, setRelLoadDefaults] = useState(false);
  const [relDialogOpen, setRelDialogOpen] = useState(false);
  const [relEditingStatus, setRelEditingStatus] = useState<IConfigStatusLevel | null>(null);
  const [relConfirmDeleteOpen, setRelConfirmDeleteOpen] = useState(false);
  const [relStatusForm, setRelStatusForm] = useState<Partial<IConfigStatusLevel>>({});

  const relSelectedStatus = releaseStatuses.find((s) => s.id === relSelectedId) ?? null;

  const initRelStatusForm = (editing: IConfigStatusLevel | null) => {
    setRelStatusForm(
      editing
        ? {
            displayName: editing.displayName,
            description: editing.description,
            bgColor: editing.bgColor,
            isActive: editing.isActive,
            slaActive: editing.slaActive,
            isFinal: editing.isFinal,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            displayName: '',
            description: '',
            bgColor: '#0891b2',
            isActive: true,
            slaActive: true,
            isFinal: false,
            enabledFor: Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
          },
    );
  };

  const handleRelOpenAdd = () => {
    setRelEditingStatus(null);
    initRelStatusForm(null);
    setRelDialogOpen(true);
  };

  const handleRelOpenEdit = () => {
    if (relSelectedStatus) {
      setRelEditingStatus(relSelectedStatus);
      initRelStatusForm(relSelectedStatus);
      setRelDialogOpen(true);
    }
  };

  const handleRelSave = () => {
    let next: IConfigStatusLevel[];
    if (relEditingStatus) {
      next = releaseStatuses.map((s) =>
        s.id === relEditingStatus.id ? { ...s, ...relStatusForm } : s,
      );
    } else {
      const id =
        (relStatusForm.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') ||
        `release_status_${Date.now()}`;
      const allEnabled = Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true]));
      const newItem: IConfigStatusLevel = {
        id,
        name: id,
        displayName: relStatusForm.displayName ?? id,
        description: relStatusForm.description ?? '',
        color: '#fff',
        bgColor: relStatusForm.bgColor ?? '#0891b2',
        sortOrder: releaseStatuses.length + 1,
        isActive: relStatusForm.isActive ?? true,
        slaActive: relStatusForm.slaActive ?? true,
        isFinal: relStatusForm.isFinal ?? false,
        enabledFor: relStatusForm.enabledFor ?? allEnabled,
      };
      next = [...releaseStatuses, newItem];
    }
    setReleaseStatuses(next);
    persistReleaseStatuses(next);
    setRelDialogOpen(false);
  };

  const handleRelDelete = () => {
    if (relSelectedId) {
      const next = releaseStatuses.filter((s) => s.id !== relSelectedId);
      setReleaseStatuses(next);
      persistReleaseStatuses(next);
      setRelSelectedId(null);
    }
    setRelConfirmDeleteOpen(false);
  };

  const handleRelLoadDefaults = (checked: boolean) => {
    setRelLoadDefaults(checked);
    if (checked) {
      setReleaseStatuses(DEFAULT_RELEASE_STATUSES);
      setRelSelectedId(null);
      persistReleaseStatuses(DEFAULT_RELEASE_STATUSES);
    }
  };

  const handleRelToggleActive = (id: string) => {
    const next = releaseStatuses.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setReleaseStatuses(next);
    persistReleaseStatuses(next);
  };

  const handleRelToggleSlaActive = (id: string) => {
    const next = releaseStatuses.map((s) => (s.id === id ? { ...s, slaActive: !s.slaActive } : s));
    setReleaseStatuses(next);
    persistReleaseStatuses(next);
  };

  const handleRelToggleEnabledFor = (id: string, ticketType: string) => {
    const next = releaseStatuses.map((s) =>
      s.id === id
        ? { ...s, enabledFor: { ...s.enabledFor, [ticketType]: !s.enabledFor[ticketType] } }
        : s,
    );
    setReleaseStatuses(next);
    persistReleaseStatuses(next);
  };

  const filteredReleaseStatuses = relSearch
    ? releaseStatuses.filter((s) =>
        [s.displayName, s.description].some((v) =>
          v?.toLowerCase().includes(relSearch.toLowerCase()),
        ),
      )
    : releaseStatuses;

  const releaseColumns: Column<IConfigStatusLevel>[] = [
    {
      id: 'displayName',
      label: 'Release Cycle Statuses',
      minWidth: 180,
      format: (_v, row): React.ReactNode => <StatusBadgeCell row={row} />,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 260,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Status Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            handleRelToggleActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    },
    {
      id: 'slaActive',
      label: 'SLA Activation',
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.slaActive}
          onChange={(e) => {
            e.stopPropagation();
            handleRelToggleSlaActive(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          color='primary'
        />
      ),
    },
    ...activeTicketTypeColumns.map(
      (t): Column<IConfigStatusLevel> => ({
        id: 'enabledFor' as keyof IConfigStatusLevel,
        label: t.label,
        minWidth: 90,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? true}
            onChange={(e) => {
              e.stopPropagation();
              handleRelToggleEnabledFor(row.id, t.key);
            }}
            onClick={(e) => e.stopPropagation()}
            color='success'
          />
        ),
      }),
    ),
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      {/* ── Ticket Statuses ── */}
      <Section
        icon={<RadioButtonCheckedIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Ticket Statuses'
        subtitle='Configure lifecycle statuses, SLA tracking, and per-ticket-type availability'
        accentColor='#7c3aed'
        defaultExpanded
      >
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedId && (
              <Tooltip title='Add a new ticket status'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  New
                </Button>
              </Tooltip>
            )}

            {selectedId && (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={handleOpenEdit}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmDeleteOpen(true)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
              </>
            )}

            <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

            <FormControlLabel
              labelPlacement='start'
              control={
                <Switch
                  size='small'
                  checked={loadDefaults}
                  onChange={(e) => handleLoadDefaults(e.target.checked)}
                  color='warning'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                  Load system default values
                </Typography>
              }
              sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
            />

            <TextField
              size='small'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {selectedId && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedStatus?.displayName}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={ticketColumns}
            data={filteredStatuses}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── Release Cycle Statuses ── */}
      <Section
        icon={<ChangeCircleIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Release Cycle Statuses'
        subtitle='Configure statuses for the release lifecycle from design approval through production'
        accentColor='#0891b2'
      >
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!relSelectedId && (
              <Tooltip title='Add a new release cycle status'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleRelOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  New
                </Button>
              </Tooltip>
            )}

            {relSelectedId && (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<EditIcon />}
                  onClick={handleRelOpenEdit}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setRelConfirmDeleteOpen(true)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
              </>
            )}

            <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

            <FormControlLabel
              labelPlacement='start'
              control={
                <Switch
                  size='small'
                  checked={relLoadDefaults}
                  onChange={(e) => handleRelLoadDefaults(e.target.checked)}
                  color='warning'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                  Load system default values
                </Typography>
              }
              sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
            />

            <TextField
              size='small'
              placeholder='Search...'
              value={relSearch}
              onChange={(e) => setRelSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {relSelectedId && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{relSelectedStatus?.displayName}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setRelSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={releaseColumns}
            data={filteredReleaseStatuses}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={11}
            onRowClick={(row) => setRelSelectedId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={relSelectedId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── Ticket status dialogs ── */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
        isEdit={!!editingStatus}
        icon={<RadioButtonCheckedIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#7c3aed'
        title='Status'
        submitDisabled={!statusForm.displayName}
        submitLabel={editingStatus ? 'Save Changes' : 'Add Status'}
        maxWidth='sm'
      >
        <TextField
          label='Status Name'
          size='small'
          value={statusForm.displayName ?? ''}
          onChange={(e) => setStatusForm((f) => ({ ...f, displayName: e.target.value }))}
          helperText='e.g. New, In Progress, Resolved'
          required
        />
        <TextField
          label='Description'
          size='small'
          value={statusForm.description ?? ''}
          onChange={(e) => setStatusForm((f) => ({ ...f, description: e.target.value }))}
          multiline
          rows={2}
        />

        {/* Color picker */}
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            sx={{ mb: 0.75, display: 'block' }}
          >
            Badge Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setStatusForm((f) => ({ ...f, bgColor: c }))}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border:
                    statusForm.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                  boxShadow:
                    statusForm.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.18)' },
                }}
              />
            ))}
            <TextField
              size='small'
              value={statusForm.bgColor ?? ''}
              onChange={(e) => setStatusForm((f) => ({ ...f, bgColor: e.target.value }))}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
              sx={{ ml: 0.5 }}
            />
            {statusForm.bgColor && (
              <Chip
                label={statusForm.displayName || 'Preview'}
                size='small'
                sx={{
                  bgcolor: statusForm.bgColor,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Flags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={statusForm.isActive ?? true}
                onChange={(e) => setStatusForm((f) => ({ ...f, isActive: e.target.checked }))}
                color='success'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Status Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={statusForm.slaActive ?? true}
                onChange={(e) => setStatusForm((f) => ({ ...f, slaActive: e.target.checked }))}
                color='primary'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>SLA Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={statusForm.isFinal ?? false}
                onChange={(e) => setStatusForm((f) => ({ ...f, isFinal: e.target.checked }))}
                color='warning'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Final Status</Typography>}
          />
        </Box>

        {/* Ticket type toggles */}
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            sx={{ mb: 1, display: 'block' }}
          >
            Enable for Ticket Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {activeTicketTypeColumns.map((t) => (
              <FormControlLabel
                key={t.key}
                labelPlacement='end'
                control={
                  <Switch
                    size='small'
                    checked={statusForm.enabledFor?.[t.key] ?? true}
                    onChange={(e) =>
                      setStatusForm((f) => ({
                        ...f,
                        enabledFor: { ...(f.enabledFor ?? {}), [t.key]: e.target.checked },
                      }))
                    }
                    color='success'
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem' }}>{t.label}</Typography>}
                sx={{ mr: 2 }}
              />
            ))}
          </Box>
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Status'
        itemName={selectedStatus?.displayName ?? ''}
      />

      {/* ── Release cycle status dialogs ── */}
      <ConfigFormDialog
        open={relDialogOpen}
        onClose={() => setRelDialogOpen(false)}
        onSubmit={handleRelSave}
        isEdit={!!relEditingStatus}
        icon={<ChangeCircleIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#0891b2'
        title='Release Cycle Status'
        submitDisabled={!relStatusForm.displayName}
        submitLabel={relEditingStatus ? 'Save Changes' : 'Add Status'}
        maxWidth='sm'
      >
        <TextField
          label='Status Name'
          size='small'
          value={relStatusForm.displayName ?? ''}
          onChange={(e) => setRelStatusForm((f) => ({ ...f, displayName: e.target.value }))}
          helperText='e.g. Awaiting UAT, Under Deployment'
          required
        />
        <TextField
          label='Description'
          size='small'
          value={relStatusForm.description ?? ''}
          onChange={(e) => setRelStatusForm((f) => ({ ...f, description: e.target.value }))}
          multiline
          rows={2}
        />

        {/* Color picker */}
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            sx={{ mb: 0.75, display: 'block' }}
          >
            Badge Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setRelStatusForm((f) => ({ ...f, bgColor: c }))}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border:
                    relStatusForm.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                  boxShadow:
                    relStatusForm.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.18)' },
                }}
              />
            ))}
            <TextField
              size='small'
              value={relStatusForm.bgColor ?? ''}
              onChange={(e) => setRelStatusForm((f) => ({ ...f, bgColor: e.target.value }))}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
              sx={{ ml: 0.5 }}
            />
            {relStatusForm.bgColor && (
              <Chip
                label={relStatusForm.displayName || 'Preview'}
                size='small'
                sx={{
                  bgcolor: relStatusForm.bgColor,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Flags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={relStatusForm.isActive ?? true}
                onChange={(e) => setRelStatusForm((f) => ({ ...f, isActive: e.target.checked }))}
                color='success'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Status Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={relStatusForm.slaActive ?? true}
                onChange={(e) => setRelStatusForm((f) => ({ ...f, slaActive: e.target.checked }))}
                color='primary'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>SLA Active</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={relStatusForm.isFinal ?? false}
                onChange={(e) => setRelStatusForm((f) => ({ ...f, isFinal: e.target.checked }))}
                color='warning'
              />
            }
            label={<Typography sx={{ fontSize: '0.8rem' }}>Final Status</Typography>}
          />
        </Box>

        {/* Ticket type toggles */}
        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            sx={{ mb: 1, display: 'block' }}
          >
            Enable for Ticket Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {activeTicketTypeColumns.map((t) => (
              <FormControlLabel
                key={t.key}
                labelPlacement='end'
                control={
                  <Switch
                    size='small'
                    checked={relStatusForm.enabledFor?.[t.key] ?? true}
                    onChange={(e) =>
                      setRelStatusForm((f) => ({
                        ...f,
                        enabledFor: { ...(f.enabledFor ?? {}), [t.key]: e.target.checked },
                      }))
                    }
                    color='success'
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem' }}>{t.label}</Typography>}
                sx={{ mr: 2 }}
              />
            ))}
          </Box>
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={relConfirmDeleteOpen}
        onClose={() => setRelConfirmDeleteOpen(false)}
        onConfirm={handleRelDelete}
        entityName='Release Cycle Status'
        itemName={relSelectedStatus?.displayName ?? ''}
      />
    </Box>
  );
};

export default Statuses;
