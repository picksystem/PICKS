import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  Tooltip,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';
import {
  IConfigSLAAdminControls,
  IConfigResponseAckSLARow,
  IConfigActivationRow,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import ResponseAckSLAFormDialog from '../dialogs/ResponseAckSLAFormDialog';
import ResolutionSLAFormDialog from '../dialogs/ResolutionSLAFormDialog';
import DueDateFormDialog from '../dialogs/DueDateFormDialog';
import ActivationRowFormDialog from '../dialogs/ActivationRowFormDialog';

// ── Default controls ──────────────────────────────────────────────────────────

const DEFAULT_CONTROLS: IConfigSLAAdminControls = {
  enabled: false,
  activateOnTicketTypes: {},
  basedOnCallerCalendar: false,
  basedOnConsultantCalendar: true,
  excludeCallerBankHolidays: false,
  excludeCallerLeaves: false,
  excludeConsultantBankHolidays: true,
  excludeConsultantLeaves: false,
  excludeSaturdaysAndSundays: true,
  excludeFridaysAndSaturdays: false,
  excludeFridaysOnly: false,
  excludeSaturdaysOnly: false,
  excludeSundaysOnly: false,
  responseAckSLAEnabled: true,
  responseAlertOnBreach: true,
  resolutionSLAEnabled: true,
  dueDateAdminEnabled: true,
  dueDateOverrideByAgents: false,
  dueDateEnableDates: true,
  dueDateEditableByConsultants: false,
  dueDateEqualToSLADates: false,
  dueDateExtendDueDates: false,
  dueDatesEnabled: true,
  dueDateVisibleToCallers: true,
  alertBeforeDueDate: true,
  etaEnabled: false,
  etaEditableByConsultants: false,
  etaEqualToDueDates: false,
  etaActivationEnabled: false,
  etaVisibleToCallers: false,
  etaEmailNotifications: false,
  timeLogAdminEnabled: true,
  requireTimeLogsForResolution: false,
  timeLogsActivationEnabled: true,
  showTimeLogsToCallers: false,
};

// ── Chip palette (cycles by index, matching Statuses/Priorities pattern) ──────

const CHIP_COLORS = ['#7c3aed', '#1d4ed8', '#0f766e', '#1b5e20', '#c2410c', '#0891b2', '#b45309'];

// ── Per-ticket-type default P-value tables ────────────────────────────────────

const DEFAULT_ACK_VALUES: Record<
  string,
  { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
> = {
  incident: { activation: true, p1: 15, p2: 30, p3: 60, p4: 240, p5: 480 },
  service_request: { activation: true, p1: 30, p2: 60, p3: 120, p4: 480, p5: 960 },
  advisory_request: { activation: false, p1: 60, p2: 120, p3: 240, p4: 960, p5: 1920 },
};
const FALLBACK_DEFAULTS = { activation: true, p1: 15, p2: 30, p3: 60, p4: 240, p5: 480 };

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

// ── Toggle row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  indent?: boolean;
  subtle?: boolean;
}

const ToggleRow = ({
  label,
  checked,
  onChange,
  disabled = false,
  indent = false,
  subtle = false,
}: ToggleRowProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 0.625,
      pl: indent ? 2 : 0,
      opacity: disabled ? 0.42 : 1,
      transition: 'opacity 0.18s',
    }}
  >
    <Typography
      sx={{
        fontSize: subtle ? '0.8rem' : '0.83rem',
        fontWeight: subtle ? 400 : 500,
        color: subtle ? 'text.secondary' : 'text.primary',
        lineHeight: 1.4,
        pr: 1,
      }}
    >
      {label}
    </Typography>
    <Switch
      size='small'
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      color='primary'
      sx={{ flexShrink: 0 }}
    />
  </Box>
);

const RowDivider = () => <Divider sx={{ opacity: 0.45 }} />;

const TogglePanel = ({ children }: { children: React.ReactNode }) => (
  <Paper variant='outlined' sx={{ borderRadius: 1.5, overflow: 'hidden', px: 1.5, py: 0.5 }}>
    {children}
  </Paper>
);

// ── Main SLAs component ───────────────────────────────────────────────────────

const SLAs = () => {
  const { classes } = useStyles();
  const { slas: apiSlas, saveSection } = useConfiguration();

  // ── Ticket types from API (same pattern as Statuses / Priorities) ──────────
  const { data: ticketTypesData } = useGetTicketTypeQuery();
  const activeTicketTypes =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  // ── Local state ───────────────────────────────────────────────────────────
  const [ctrl, setCtrl] = useState<IConfigSLAAdminControls>(DEFAULT_CONTROLS);
  const [ackRows, setAckRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [selectedAckRowId, setSelectedAckRowId] = useState<string | null>(null);
  const [ackDialogOpen, setAckDialogOpen] = useState(false);
  const [editingAckRow, setEditingAckRow] = useState<IConfigResponseAckSLARow | null>(null);
  const [ackDeleteOpen, setAckDeleteOpen] = useState(false);
  const [etaActRows, setEtaActRows] = useState<IConfigActivationRow[]>([]);
  const [timeLogActRows, setTimeLogActRows] = useState<IConfigActivationRow[]>([]);

  useEffect(() => {
    if (apiSlas?.adminControls) setCtrl(apiSlas.adminControls);
    if (apiSlas?.responseAckRows) setAckRows(apiSlas.responseAckRows);
  }, [apiSlas]);

  // ── Derive one display row per active ticket type (merge with stored data) ─
  const displayAckRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = ackRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_ACK_VALUES[tt.type] ?? FALLBACK_DEFAULTS;
    return {
      id: stored?.id ?? `rack_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const selectedAckRow = displayAckRows.find((r) => r.id === selectedAckRowId) ?? null;

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persistSlas = (
    nextCtrl: IConfigSLAAdminControls,
    nextAckRows: IConfigResponseAckSLARow[],
    nextResRows: IConfigResponseAckSLARow[],
    nextDueDateRows: IConfigResponseAckSLARow[],
    nextEtaActRows: IConfigActivationRow[],
    nextTimeLogActRows: IConfigActivationRow[],
  ) => {
    saveSection('slas', {
      adminControls: nextCtrl,
      items: apiSlas?.items ?? [],
      responseAckRows: nextAckRows,
      resolutionRows: nextResRows,
      dueDateRows: nextDueDateRows,
      etaActivationRows: nextEtaActRows,
      timeLogActivationRows: nextTimeLogActRows,
    });
  };

  const update = <K extends keyof IConfigSLAAdminControls>(
    key: K,
    value: IConfigSLAAdminControls[K],
  ) => {
    const next = { ...ctrl, [key]: value };
    setCtrl(next);
    persistSlas(next, ackRows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const toggleTicketTypeActivation = (typeKey: string, value: boolean) => {
    const next = {
      ...ctrl,
      activateOnTicketTypes: { ...(ctrl.activateOnTicketTypes ?? {}), [typeKey]: value },
    };
    setCtrl(next);
    persistSlas(next, ackRows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const saveAckRows = (rows: IConfigResponseAckSLARow[]) => {
    setAckRows(rows);
    persistSlas(ctrl, rows, resRows, dueDateRows, etaActRows, timeLogActRows);
  };

  const handleAckSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = ackRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? ackRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...ackRows, row];
    saveAckRows(next);
    setAckDialogOpen(false);
    setEditingAckRow(null);
    setSelectedAckRowId(row.id);
  };

  // Inline activation toggle in the table — saves without opening dialog
  const toggleRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_ACK_VALUES[tt?.type ?? ''] ?? FALLBACK_DEFAULTS;
    const existing = ackRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rack_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
          p1: def.p1,
          p2: def.p2,
          p3: def.p3,
          p4: def.p4,
          p5: def.p5,
        };
    const next = existing
      ? ackRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...ackRows, updated];
    saveAckRows(next);
  };

  const handleLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_ACK_VALUES[tt.type] ?? FALLBACK_DEFAULTS;
      return {
        id: `rack_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveAckRows(defaultRows);
    setSelectedAckRowId(null);
  };

  const usedAckIds = ackRows.map((r) => r.ticketTypeId);

  const handleAckDelete = () => {
    if (!selectedAckRow) return;
    const next = ackRows.filter((r) => r.ticketTypeId !== selectedAckRow.ticketTypeId);
    saveAckRows(next);
    setSelectedAckRowId(null);
    setAckDeleteOpen(false);
  };

  // ── Resolution SLA rows ───────────────────────────────────────────────────
  const [resRows, setResRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [selectedResRowId, setSelectedResRowId] = useState<string | null>(null);
  const [resDialogOpen, setResDialogOpen] = useState(false);
  const [editingResRow, setEditingResRow] = useState<IConfigResponseAckSLARow | null>(null);
  const [resDeleteOpen, setResDeleteOpen] = useState(false);

  useEffect(() => {
    if (apiSlas?.resolutionRows) setResRows(apiSlas.resolutionRows);
  }, [apiSlas]);

  const DEFAULT_RES_VALUES: Record<
    string,
    { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
  > = {
    incident: { activation: true, p1: 4, p2: 8, p3: 16, p4: 24, p5: 48 },
    service_request: { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 96 },
    advisory_request: { activation: false, p1: 16, p2: 24, p3: 48, p4: 96, p5: 168 },
  };
  const FALLBACK_RES = { activation: true, p1: 4, p2: 8, p3: 16, p4: 24, p5: 48 };

  const displayResRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = resRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_RES_VALUES[tt.type] ?? FALLBACK_RES;
    return {
      id: stored?.id ?? `rres_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const selectedResRow = displayResRows.find((r) => r.id === selectedResRowId) ?? null;

  const saveResRows = (rows: IConfigResponseAckSLARow[]) => {
    setResRows(rows);
    persistSlas(ctrl, ackRows, rows, dueDateRows, etaActRows, timeLogActRows);
  };

  const handleResSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = resRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? resRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...resRows, row];
    saveResRows(next);
    setResDialogOpen(false);
    setEditingResRow(null);
    setSelectedResRowId(row.id);
  };

  const toggleResRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_RES_VALUES[tt?.type ?? ''] ?? FALLBACK_RES;
    const existing = resRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rres_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          ...def,
          activation: value,
        };
    const next = existing
      ? resRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...resRows, updated];
    saveResRows(next);
  };

  const handleResDelete = () => {
    if (!selectedResRow) return;
    const next = resRows.filter((r) => r.ticketTypeId !== selectedResRow.ticketTypeId);
    saveResRows(next);
    setSelectedResRowId(null);
    setResDeleteOpen(false);
  };

  const handleResLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_RES_VALUES[tt.type] ?? FALLBACK_RES;
      return {
        id: `rres_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveResRows(defaultRows);
    setSelectedResRowId(null);
  };

  const usedResIds = resRows.map((r) => r.ticketTypeId);

  // ── Due Date rows ─────────────────────────────────────────────────────────
  const [dueDateRows, setDueDateRows] = useState<IConfigResponseAckSLARow[]>([]);
  const [selectedDueDateRowId, setSelectedDueDateRowId] = useState<string | null>(null);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [editingDueDateRow, setEditingDueDateRow] = useState<IConfigResponseAckSLARow | null>(null);
  const [dueDateDeleteOpen, setDueDateDeleteOpen] = useState(false);

  const DEFAULT_DUEDATE_VALUES: Record<
    string,
    { activation: boolean; p1: number; p2: number; p3: number; p4: number; p5: number }
  > = {
    incident: { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 72 },
    service_request: { activation: true, p1: 16, p2: 24, p3: 48, p4: 72, p5: 120 },
    advisory_request: { activation: false, p1: 24, p2: 48, p3: 72, p4: 120, p5: 168 },
  };
  const FALLBACK_DUEDATE = { activation: true, p1: 8, p2: 16, p3: 24, p4: 48, p5: 72 };

  useEffect(() => {
    if (apiSlas?.dueDateRows) setDueDateRows(apiSlas.dueDateRows);
  }, [apiSlas]);

  const displayDueDateRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
    const stored = dueDateRows.find((r) => r.ticketTypeId === tt.id);
    const def = DEFAULT_DUEDATE_VALUES[tt.type] ?? FALLBACK_DUEDATE;
    return {
      id: stored?.id ?? `rdd_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? def.activation,
      p1: stored?.p1 ?? def.p1,
      p2: stored?.p2 ?? def.p2,
      p3: stored?.p3 ?? def.p3,
      p4: stored?.p4 ?? def.p4,
      p5: stored?.p5 ?? def.p5,
    };
  });

  const selectedDueDateRow = displayDueDateRows.find((r) => r.id === selectedDueDateRowId) ?? null;

  const saveDueDateRows = (rows: IConfigResponseAckSLARow[]) => {
    setDueDateRows(rows);
    persistSlas(ctrl, ackRows, resRows, rows, etaActRows, timeLogActRows);
  };

  const handleDueDateSubmit = (row: IConfigResponseAckSLARow) => {
    const existing = dueDateRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? dueDateRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...dueDateRows, row];
    saveDueDateRows(next);
    setDueDateDialogOpen(false);
    setEditingDueDateRow(null);
    setSelectedDueDateRowId(row.id);
  };

  const toggleDueDateRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const def = DEFAULT_DUEDATE_VALUES[tt?.type ?? ''] ?? FALLBACK_DUEDATE;
    const existing = dueDateRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigResponseAckSLARow = existing
      ? { ...existing, activation: value }
      : {
          id: `rdd_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          ...def,
          activation: value,
        };
    const next = existing
      ? dueDateRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...dueDateRows, updated];
    saveDueDateRows(next);
  };

  const handleDueDateLoadDefaults = () => {
    const defaultRows: IConfigResponseAckSLARow[] = activeTicketTypes.map((tt) => {
      const def = DEFAULT_DUEDATE_VALUES[tt.type] ?? FALLBACK_DUEDATE;
      return {
        id: `rdd_${tt.type}`,
        ticketTypeId: tt.id,
        ticketTypeName: tt.displayName || tt.name,
        ...def,
      };
    });
    saveDueDateRows(defaultRows);
    setSelectedDueDateRowId(null);
  };

  const usedDueDateIds = dueDateRows.map((r) => r.ticketTypeId);

  const handleDueDateDelete = () => {
    if (!selectedDueDateRow) return;
    const next = dueDateRows.filter((r) => r.ticketTypeId !== selectedDueDateRow.ticketTypeId);
    saveDueDateRows(next);
    setSelectedDueDateRowId(null);
    setDueDateDeleteOpen(false);
  };

  // ── ETA Activation rows ───────────────────────────────────────────────────
  const [selectedEtaActRowId, setSelectedEtaActRowId] = useState<string | null>(null);
  const [etaActDialogOpen, setEtaActDialogOpen] = useState(false);
  const [editingEtaActRow, setEditingEtaActRow] = useState<IConfigActivationRow | null>(null);
  const [etaActDeleteOpen, setEtaActDeleteOpen] = useState(false);

  useEffect(() => {
    if (apiSlas?.etaActivationRows) setEtaActRows(apiSlas.etaActivationRows);
  }, [apiSlas]);

  const displayEtaActRows: IConfigActivationRow[] = activeTicketTypes.map((tt) => {
    const stored = etaActRows.find((r) => r.ticketTypeId === tt.id);
    return {
      id: stored?.id ?? `eta_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? true,
    };
  });

  const selectedEtaActRow = displayEtaActRows.find((r) => r.id === selectedEtaActRowId) ?? null;

  const saveEtaActRows = (rows: IConfigActivationRow[]) => {
    setEtaActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, rows, timeLogActRows);
  };

  const handleEtaActSubmit = (row: IConfigActivationRow) => {
    const existing = etaActRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? etaActRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...etaActRows, row];
    saveEtaActRows(next);
    setEtaActDialogOpen(false);
    setEditingEtaActRow(null);
    setSelectedEtaActRowId(row.id);
  };

  const toggleEtaActRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const existing = etaActRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigActivationRow = existing
      ? { ...existing, activation: value }
      : {
          id: `eta_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
        };
    const next = existing
      ? etaActRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...etaActRows, updated];
    saveEtaActRows(next);
  };

  const handleEtaActDelete = () => {
    if (!selectedEtaActRow) return;
    const next = etaActRows.filter((r) => r.ticketTypeId !== selectedEtaActRow.ticketTypeId);
    saveEtaActRows(next);
    setSelectedEtaActRowId(null);
    setEtaActDeleteOpen(false);
  };

  const usedEtaActIds = etaActRows.map((r) => r.ticketTypeId);

  // ── Time Log Activation rows ──────────────────────────────────────────────
  const [selectedTimeLogActRowId, setSelectedTimeLogActRowId] = useState<string | null>(null);
  const [timeLogActDialogOpen, setTimeLogActDialogOpen] = useState(false);
  const [editingTimeLogActRow, setEditingTimeLogActRow] = useState<IConfigActivationRow | null>(
    null,
  );
  const [timeLogActDeleteOpen, setTimeLogActDeleteOpen] = useState(false);

  useEffect(() => {
    if (apiSlas?.timeLogActivationRows) setTimeLogActRows(apiSlas.timeLogActivationRows);
  }, [apiSlas]);

  const displayTimeLogActRows: IConfigActivationRow[] = activeTicketTypes.map((tt) => {
    const stored = timeLogActRows.find((r) => r.ticketTypeId === tt.id);
    return {
      id: stored?.id ?? `tlog_${tt.type}`,
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      activation: stored?.activation ?? true,
    };
  });

  const selectedTimeLogActRow =
    displayTimeLogActRows.find((r) => r.id === selectedTimeLogActRowId) ?? null;

  const saveTimeLogActRows = (rows: IConfigActivationRow[]) => {
    setTimeLogActRows(rows);
    persistSlas(ctrl, ackRows, resRows, dueDateRows, etaActRows, rows);
  };

  const handleTimeLogActSubmit = (row: IConfigActivationRow) => {
    const existing = timeLogActRows.findIndex((r) => r.ticketTypeId === row.ticketTypeId);
    const next =
      existing >= 0
        ? timeLogActRows.map((r) => (r.ticketTypeId === row.ticketTypeId ? row : r))
        : [...timeLogActRows, row];
    saveTimeLogActRows(next);
    setTimeLogActDialogOpen(false);
    setEditingTimeLogActRow(null);
    setSelectedTimeLogActRowId(row.id);
  };

  const toggleTimeLogActRowActivation = (ticketTypeId: number, value: boolean) => {
    const tt = activeTicketTypes.find((t) => t.id === ticketTypeId);
    const existing = timeLogActRows.find((r) => r.ticketTypeId === ticketTypeId);
    const updated: IConfigActivationRow = existing
      ? { ...existing, activation: value }
      : {
          id: `tlog_${tt?.type ?? ticketTypeId}`,
          ticketTypeId,
          ticketTypeName: tt?.displayName ?? tt?.name ?? '',
          activation: value,
        };
    const next = existing
      ? timeLogActRows.map((r) => (r.ticketTypeId === ticketTypeId ? updated : r))
      : [...timeLogActRows, updated];
    saveTimeLogActRows(next);
  };

  const handleTimeLogActDelete = () => {
    if (!selectedTimeLogActRow) return;
    const next = timeLogActRows.filter(
      (r) => r.ticketTypeId !== selectedTimeLogActRow.ticketTypeId,
    );
    saveTimeLogActRows(next);
    setSelectedTimeLogActRowId(null);
    setTimeLogActDeleteOpen(false);
  };

  const usedTimeLogActIds = timeLogActRows.map((r) => r.ticketTypeId);

  // ── Search state ─────────────────────────────────────────────────────────
  const [ackSearch, setAckSearch] = useState('');
  const [resSearch, setResSearch] = useState('');
  const [dueDateSearch, setDueDateSearch] = useState('');
  const [etaActSearch, setEtaActSearch] = useState('');
  const [timeLogActSearch, setTimeLogActSearch] = useState('');

  const filteredAckRows = ackSearch
    ? displayAckRows.filter((r) => r.ticketTypeName.toLowerCase().includes(ackSearch.toLowerCase()))
    : displayAckRows;

  const filteredResRows = resSearch
    ? displayResRows.filter((r) => r.ticketTypeName.toLowerCase().includes(resSearch.toLowerCase()))
    : displayResRows;

  const filteredDueDateRows = dueDateSearch
    ? displayDueDateRows.filter((r) =>
        r.ticketTypeName.toLowerCase().includes(dueDateSearch.toLowerCase()),
      )
    : displayDueDateRows;

  const filteredEtaActRows = etaActSearch
    ? displayEtaActRows.filter((r) =>
        r.ticketTypeName.toLowerCase().includes(etaActSearch.toLowerCase()),
      )
    : displayEtaActRows;

  const filteredTimeLogActRows = timeLogActSearch
    ? displayTimeLogActRows.filter((r) =>
        r.ticketTypeName.toLowerCase().includes(timeLogActSearch.toLowerCase()),
      )
    : displayTimeLogActRows;

  const off = !ctrl.enabled;

  // ── DataTable column definitions ──────────────────────────────────────────
  const chipCell = (row: IConfigResponseAckSLARow | IConfigActivationRow) => {
    const color =
      CHIP_COLORS[
        activeTicketTypes.findIndex((t) => t.id === row.ticketTypeId) % CHIP_COLORS.length
      ];
    return (
      <Chip
        label={row.ticketTypeName}
        size='small'
        sx={{
          bgcolor: color,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.72rem',
          height: 22,
          borderRadius: 1.5,
        }}
      />
    );
  };
  const pCell = (v: unknown) => (
    <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
      {String(v)}
    </Typography>
  );

  const ackColumns: Column<IConfigResponseAckSLARow>[] = [
    { id: 'ticketTypeName', label: 'SLAs', minWidth: 140, format: (_v, row) => chipCell(row) },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            toggleRowActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    { id: 'p1', label: 'P1', minWidth: 55, format: pCell },
    { id: 'p2', label: 'P2', minWidth: 55, format: pCell },
    { id: 'p3', label: 'P3', minWidth: 55, format: pCell },
    { id: 'p4', label: 'P4', minWidth: 55, format: pCell },
    { id: 'p5', label: 'P5', minWidth: 55, format: pCell },
  ];

  const resColumns: Column<IConfigResponseAckSLARow>[] = [
    { id: 'ticketTypeName', label: 'SLAs', minWidth: 140, format: (_v, row) => chipCell(row) },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            toggleResRowActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    { id: 'p1', label: 'P1', minWidth: 55, format: pCell },
    { id: 'p2', label: 'P2', minWidth: 55, format: pCell },
    { id: 'p3', label: 'P3', minWidth: 55, format: pCell },
    { id: 'p4', label: 'P4', minWidth: 55, format: pCell },
    { id: 'p5', label: 'P5', minWidth: 55, format: pCell },
  ];

  const dueDateColumns: Column<IConfigResponseAckSLARow>[] = [
    { id: 'ticketTypeName', label: 'SLAs', minWidth: 140, format: (_v, row) => chipCell(row) },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            toggleDueDateRowActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    { id: 'p1', label: 'P1', minWidth: 55, format: pCell },
    { id: 'p2', label: 'P2', minWidth: 55, format: pCell },
    { id: 'p3', label: 'P3', minWidth: 55, format: pCell },
    { id: 'p4', label: 'P4', minWidth: 55, format: pCell },
    { id: 'p5', label: 'P5', minWidth: 55, format: pCell },
  ];

  const etaActColumns: Column<IConfigActivationRow>[] = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 140,
      format: (_v, row) => chipCell(row),
    },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            toggleEtaActRowActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  const timeLogActColumns: Column<IConfigActivationRow>[] = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
      minWidth: 140,
      format: (_v, row) => chipCell(row),
    },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center',
      format: (_v, row) => (
        <Switch
          size='small'
          checked={row.activation}
          color='success'
          onChange={(e) => {
            e.stopPropagation();
            toggleTimeLogActRowActivation(row.ticketTypeId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Box className={classes.container}>
      {/* ── 1. SLA Settings ── */}
      <Section
        icon={<TimerIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='SLA Settings'
        subtitle='Master switch and ticket-type activation for SLA tracking'
        accentColor='#0891b2'
        defaultExpanded
      >
        <TogglePanel>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Enable SLAs</Typography>
              <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>
                Master switch — activates all SLA tracking across the system
              </Typography>
            </Box>
            <Switch
              checked={ctrl.enabled}
              onChange={(e) => update('enabled', e.target.checked)}
              color='primary'
              sx={{ flexShrink: 0 }}
            />
          </Box>

          <Divider />

          <Box sx={{ py: 1 }}>
            <Typography
              sx={{
                fontSize: '0.83rem',
                fontWeight: 600,
                color: off ? 'text.disabled' : 'text.primary',
                transition: 'color 0.18s',
                mb: 1,
              }}
            >
              Activate SLAs on tickets
            </Typography>

            {activeTicketTypes.length === 0 ? (
              <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', py: 0.5 }}>
                No active ticket types — configure them in the Ticket Types section.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {activeTicketTypes.map((tt, idx) => {
                  const isOn = (ctrl.activateOnTicketTypes ?? {})[tt.type] ?? true;
                  return (
                    <React.Fragment key={tt.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.5,
                          opacity: off ? 0.42 : 1,
                          transition: 'opacity 0.18s',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                          {tt.displayName || tt.name}
                        </Typography>
                        <Switch
                          size='small'
                          checked={isOn}
                          disabled={off}
                          onChange={(e) => toggleTicketTypeActivation(tt.type, e.target.checked)}
                          color='primary'
                        />
                      </Box>
                      {idx < activeTicketTypes.length - 1 && <Divider sx={{ opacity: 0.4 }} />}
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
          </Box>
        </TogglePanel>
      </Section>

      {/* ── 2. Calendar Rules ── */}
      <Section
        icon={<CalendarMonthIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Calendar Rules'
        subtitle='Define which calendars and non-working periods the SLA clock respects'
        accentColor='#7c3aed'
      >
        <TogglePanel>
          {(
            [
              ['basedOnCallerCalendar', "Based on caller's working calendar"],
              ['basedOnConsultantCalendar', "Based on consultant's working calendar"],
              ['excludeCallerBankHolidays', "Exclude caller's bank holidays"],
              ['excludeCallerLeaves', "Exclude caller's leaves"],
              ['excludeConsultantBankHolidays', "Exclude consultant's bank holidays"],
              ['excludeConsultantLeaves', "Exclude consultant's leaves"],
              ['excludeSaturdaysAndSundays', 'Exclude Saturdays and Sundays'],
              ['excludeFridaysAndSaturdays', 'Exclude Fridays and Saturdays'],
              ['excludeFridaysOnly', 'Exclude Fridays only'],
              ['excludeSaturdaysOnly', 'Exclude Saturdays only'],
              ['excludeSundaysOnly', 'Exclude Sundays only'],
            ] as [keyof IConfigSLAAdminControls, string][]
          ).map(([key, label], i, arr) => (
            <React.Fragment key={key}>
              <ToggleRow
                label={label}
                checked={ctrl[key] as boolean}
                disabled={off}
                onChange={(v) => update(key, v)}
                subtle
              />
              {i < arr.length - 1 && <RowDivider />}
            </React.Fragment>
          ))}
        </TogglePanel>
      </Section>

      {/* ── 3. Response / Acknowledgement SLA (in minutes) ── */}
      <Section
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Response / Acknowledgement SLA (in minutes)'
        subtitle='Configure response time targets and breach alerting for initial acknowledgement'
        accentColor='#0891b2'
      >
        {/* ── Action Toolbar ── */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedAckRow && (
              <Tooltip title='Add a new response / acknowledgement SLA row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingAckRow(null);
                      setAckDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 && usedAckIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedAckRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingAckRow(selectedAckRow);
                  setAckDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Edit
              </Button>
            )}

            {selectedAckRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setAckDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <Tooltip title='Reset all rows to system default values'>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                startIcon={<RestoreIcon />}
                onClick={handleLoadDefaults}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Load System Defaults
              </Button>
            </Tooltip>

            <TextField
              size='small'
              placeholder='Search...'
              value={ackSearch}
              onChange={(e) => setAckSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {selectedAckRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedAckRow.ticketTypeName}</strong>
              &nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedAckRowId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* ── SLA Table ── */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={ackColumns}
            data={filteredAckRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedAckRowId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedAckRowId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── 4. Resolution SLA ── */}
      <Section
        icon={<CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Resolution SLA (in hours)'
        subtitle='Track resolution time targets per ticket type and priority level'
        accentColor='#15803d'
      >
        {/* ── Action Toolbar ── */}
        <Paper variant='outlined' className={classes.actionToolbar} sx={{ mt: 2 }}>
          <Box className={classes.toolbarButtons}>
            {!selectedResRow && (
              <Tooltip title='Add a new resolution SLA row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingResRow(null);
                      setResDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 && usedResIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedResRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingResRow(selectedResRow);
                  setResDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Edit
              </Button>
            )}

            {selectedResRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setResDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <Tooltip title='Reset all rows to system default values'>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                startIcon={<RestoreIcon />}
                onClick={handleResLoadDefaults}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Load System Defaults
              </Button>
            </Tooltip>

            <TextField
              size='small'
              placeholder='Search...'
              value={resSearch}
              onChange={(e) => setResSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {selectedResRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedResRow.ticketTypeName}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedResRowId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* ── Resolution SLA Table ── */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={resColumns}
            data={filteredResRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedResRowId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedResRowId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── 5. Due Date Admin Controls ── */}
      <Section
        icon={<EventIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Due Date Admin Controls'
        subtitle='Manage due date settings, consultant permissions, and SLA alignment'
        accentColor='#ca8a04'
      >
        <TogglePanel>
          <ToggleRow
            label='Enable due date admin controls'
            checked={ctrl.dueDateAdminEnabled}
            disabled={off}
            onChange={(v) => update('dueDateAdminEnabled', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Enable dates'
            checked={ctrl.dueDateEnableDates}
            disabled={off || !ctrl.dueDateAdminEnabled}
            onChange={(v) => update('dueDateEnableDates', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Editable by consultants'
            checked={ctrl.dueDateEditableByConsultants}
            disabled={off || !ctrl.dueDateAdminEnabled}
            onChange={(v) => update('dueDateEditableByConsultants', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Equal to SLA dates'
            checked={ctrl.dueDateEqualToSLADates}
            disabled={off || !ctrl.dueDateAdminEnabled}
            onChange={(v) => update('dueDateEqualToSLADates', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Extend due dates'
            checked={ctrl.dueDateExtendDueDates}
            disabled={off || !ctrl.dueDateAdminEnabled}
            onChange={(v) => update('dueDateExtendDueDates', v)}
          />
        </TogglePanel>
      </Section>

      {/* ── 6. Due Dates ── */}
      <Section
        icon={<EventIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Due Dates'
        subtitle='Control due date visibility and alerting on tickets'
        accentColor='#b45309'
      >
        {/* ── Action Toolbar ── */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedDueDateRow && (
              <Tooltip title='Add a new due date SLA row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingDueDateRow(null);
                      setDueDateDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 &&
                      usedDueDateIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}

            {selectedDueDateRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingDueDateRow(selectedDueDateRow);
                  setDueDateDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Edit
              </Button>
            )}

            {selectedDueDateRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setDueDateDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <Tooltip title='Reset all rows to system default values'>
              <Button
                size='small'
                variant='outlined'
                color='secondary'
                startIcon={<RestoreIcon />}
                onClick={handleDueDateLoadDefaults}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Load System Defaults
              </Button>
            </Tooltip>

            <TextField
              size='small'
              placeholder='Search...'
              value={dueDateSearch}
              onChange={(e) => setDueDateSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {selectedDueDateRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedDueDateRow.ticketTypeName}</strong>&nbsp;·&nbsp;
              <Link
                component='button'
                variant='caption'
                onClick={() => setSelectedDueDateRowId(null)}
              >
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* ── Due Date Table ── */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={dueDateColumns}
            data={filteredDueDateRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) =>
              setSelectedDueDateRowId((prev) => (prev === row.id ? null : row.id))
            }
            activeRowKey={selectedDueDateRowId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── 7. ETA Admin Controls ── */}
      <Section
        icon={<UpdateIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='ETA Admin Controls'
        subtitle='Manage agent permissions for ETA setting and override'
        accentColor='#6366f1'
      >
        <TogglePanel>
          <ToggleRow
            label='Enable ETAs'
            checked={ctrl.etaEnabled}
            disabled={off}
            onChange={(v) => update('etaEnabled', v)}
          />
          <RowDivider />
          <ToggleRow
            label='Editable by consultants'
            checked={ctrl.etaEditableByConsultants}
            disabled={off}
            onChange={(v) => update('etaEditableByConsultants', v)}
            subtle
          />
          <RowDivider />
          <ToggleRow
            label='Equal to due dates'
            checked={ctrl.etaEqualToDueDates}
            disabled={off}
            onChange={(v) => update('etaEqualToDueDates', v)}
            subtle
          />
        </TogglePanel>
      </Section>

      {/* ── 8. ETA Activation ── */}
      <Section
        icon={<UpdateIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='ETA Activation'
        subtitle='Control ETA visibility and notification behaviour on tickets'
        accentColor='#4f46e5'
      >
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedEtaActRow && (
              <Tooltip title='Add a new ETA activation row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingEtaActRow(null);
                      setEtaActDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 &&
                      usedEtaActIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}
            {selectedEtaActRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingEtaActRow(selectedEtaActRow);
                  setEtaActDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Edit
              </Button>
            )}
            {selectedEtaActRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setEtaActDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <TextField
              size='small'
              placeholder='Search...'
              value={etaActSearch}
              onChange={(e) => setEtaActSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          {selectedEtaActRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedEtaActRow.ticketTypeName}</strong>&nbsp;·&nbsp;
              <Link
                component='button'
                variant='caption'
                onClick={() => setSelectedEtaActRowId(null)}
              >
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={etaActColumns}
            data={filteredEtaActRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) =>
              setSelectedEtaActRowId((prev) => (prev === row.id ? null : row.id))
            }
            activeRowKey={selectedEtaActRowId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── 9. Time Log Admin Controls ── */}
      <Section
        icon={<HistoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Time Log Admin Controls'
        subtitle='Configure time-logging permissions and resolution requirements'
        accentColor='#ea580c'
      >
        <TogglePanel>
          <ToggleRow
            label='Active time log'
            checked={ctrl.timeLogAdminEnabled}
            onChange={(v) => update('timeLogAdminEnabled', v)}
          />
        </TogglePanel>
      </Section>

      {/* ── 10. Time Logs Activation ── */}
      <Section
        icon={<HistoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Time Logs Activation'
        subtitle='Activate time logging on tickets and control caller visibility'
        accentColor='#c2410c'
      >
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedTimeLogActRow && (
              <Tooltip title='Add a new time log activation row'>
                <span>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingTimeLogActRow(null);
                      setTimeLogActDialogOpen(true);
                    }}
                    disabled={
                      activeTicketTypes.length > 0 &&
                      usedTimeLogActIds.length >= activeTicketTypes.length
                    }
                    sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </span>
              </Tooltip>
            )}
            {selectedTimeLogActRow && (
              <Button
                size='small'
                variant='contained'
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingTimeLogActRow(selectedTimeLogActRow);
                  setTimeLogActDialogOpen(true);
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Edit
              </Button>
            )}
            {selectedTimeLogActRow && (
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => setTimeLogActDeleteOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}

            <TextField
              size='small'
              placeholder='Search...'
              value={timeLogActSearch}
              onChange={(e) => setTimeLogActSearch(e.target.value)}
              className={classes.tableSearchField}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          {selectedTimeLogActRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedTimeLogActRow.ticketTypeName}</strong>&nbsp;·&nbsp;
              <Link
                component='button'
                variant='caption'
                onClick={() => setSelectedTimeLogActRowId(null)}
              >
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={timeLogActColumns}
            data={filteredTimeLogActRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) =>
              setSelectedTimeLogActRowId((prev) => (prev === row.id ? null : row.id))
            }
            activeRowKey={selectedTimeLogActRowId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── Dialogs: Response / Ack SLA ── */}
      <ResponseAckSLAFormDialog
        open={ackDialogOpen}
        editingRow={editingAckRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedAckIds}
        onClose={() => {
          setAckDialogOpen(false);
          setEditingAckRow(null);
        }}
        onSubmit={handleAckSubmit}
      />

      {/* ── Dialogs: Due Date SLA ── */}
      <DueDateFormDialog
        open={dueDateDialogOpen}
        editingRow={editingDueDateRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedDueDateIds}
        onClose={() => {
          setDueDateDialogOpen(false);
          setEditingDueDateRow(null);
        }}
        onSubmit={handleDueDateSubmit}
      />

      {/* ── Dialogs: Resolution SLA ── */}
      <ResolutionSLAFormDialog
        open={resDialogOpen}
        editingRow={editingResRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedResIds}
        onClose={() => {
          setResDialogOpen(false);
          setEditingResRow(null);
        }}
        onSubmit={handleResSubmit}
      />

      <Dialog open={ackDeleteOpen} onClose={() => setAckDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Response / Ack SLA Row</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete the SLA row for{' '}
            <strong>{selectedAckRow?.ticketTypeName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setAckDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleAckDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resDeleteOpen} onClose={() => setResDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Resolution SLA Row</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete the SLA row for{' '}
            <strong>{selectedResRow?.ticketTypeName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setResDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleResDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dueDateDeleteOpen}
        onClose={() => setDueDateDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Due Date SLA Row</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete the SLA row for{' '}
            <strong>{selectedDueDateRow?.ticketTypeName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setDueDateDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleDueDateDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialogs: ETA Activation ── */}
      <ActivationRowFormDialog
        open={etaActDialogOpen}
        title='ETA Activation'
        editingRow={editingEtaActRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedEtaActIds}
        idPrefix='eta'
        onClose={() => {
          setEtaActDialogOpen(false);
          setEditingEtaActRow(null);
        }}
        onSubmit={handleEtaActSubmit}
      />

      <Dialog
        open={etaActDeleteOpen}
        onClose={() => setEtaActDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete ETA Activation Row</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete the ETA activation row for{' '}
            <strong>{selectedEtaActRow?.ticketTypeName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setEtaActDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleEtaActDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialogs: Time Log Activation ── */}
      <ActivationRowFormDialog
        open={timeLogActDialogOpen}
        title='Time Log Activation'
        editingRow={editingTimeLogActRow}
        ticketTypes={activeTicketTypes}
        usedTicketTypeIds={usedTimeLogActIds}
        idPrefix='tlog'
        onClose={() => {
          setTimeLogActDialogOpen(false);
          setEditingTimeLogActRow(null);
        }}
        onSubmit={handleTimeLogActSubmit}
      />

      <Dialog
        open={timeLogActDeleteOpen}
        onClose={() => setTimeLogActDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Time Log Activation Row</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete the time log activation row for{' '}
            <strong>{selectedTimeLogActRow?.ticketTypeName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setTimeLogActDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleTimeLogActDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SLAs;
