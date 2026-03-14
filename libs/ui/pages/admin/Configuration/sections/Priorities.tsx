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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Link,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SpeedIcon from '@mui/icons-material/Speed';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import { DataTable, Column, Loader } from '@picks/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@picks/services';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PriorityLevel {
  id: string;
  name: string;
  description: string;
  color: string; // text color (always #fff for dark badges)
  bgColor: string; // badge background
  sortOrder: number;
  enabledFor: Record<string, boolean>; // ticketType → enabled
}

interface ImpactLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  enabledFor: Record<string, boolean>;
}

interface UrgencyLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  enabledFor: Record<string, boolean>;
}

type MatrixMap = Record<string, Record<string, string>>;

// ── Ticket types shown as columns in the priority table ───────────────────────

const TICKET_TYPE_COLUMNS = [
  { key: 'incident', label: 'Incident' },
  { key: 'service_request', label: 'Service Request' },
  { key: 'advisory_request', label: 'Advisory Request' },
  { key: 'change_request', label: 'Change Request' },
  { key: 'problem_request', label: 'Problem Request' },
  { key: 'task', label: 'Task' },
];

// ── Per-ticket-type matrix section config ─────────────────────────────────────

const TICKET_TYPE_MATRIX_CONFIG: Record<
  string,
  { label: string; pluralLabel: string; accentColor: string; Icon: React.ElementType }
> = {
  incident: {
    label: 'Incident',
    pluralLabel: 'Incidents',
    accentColor: '#7c3aed',
    Icon: ReportProblemIcon,
  },
  service_request: {
    label: 'Service Request',
    pluralLabel: 'Service Requests',
    accentColor: '#1d4ed8',
    Icon: BuildIcon,
  },
  advisory_request: {
    label: 'Advisory Request',
    pluralLabel: 'Advisory Requests',
    accentColor: '#0f766e',
    Icon: LightbulbIcon,
  },
  change_request: {
    label: 'Change Request',
    pluralLabel: 'Change Requests',
    accentColor: '#4527a0',
    Icon: SwapHorizIcon,
  },
  problem_request: {
    label: 'Problem Request',
    pluralLabel: 'Problem Requests',
    accentColor: '#bf360c',
    Icon: BugReportIcon,
  },
  task: {
    label: 'Task',
    pluralLabel: 'Tasks',
    accentColor: '#1b5e20',
    Icon: TaskAltIcon,
  },
};

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_PRIORITIES: PriorityLevel[] = [
  {
    id: 'critical',
    name: '1-Critical',
    description: 'Business-critical outage — immediate action required across all operations',
    color: '#fff',
    bgColor: '#b91c1c',
    sortOrder: 1,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: false,
    },
  },
  {
    id: 'high',
    name: '2-High',
    description: 'Major impact on operations — urgent attention needed within the hour',
    color: '#fff',
    bgColor: '#ea580c',
    sortOrder: 2,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
  },
  {
    id: 'medium',
    name: '3-Medium',
    description: 'Moderate impact — should be addressed promptly but not immediately',
    color: '#fff',
    bgColor: '#ca8a04',
    sortOrder: 3,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
  },
  {
    id: 'low',
    name: '4-Low',
    description: 'Minor impact — address when resources allow within normal SLA windows',
    color: '#fff',
    bgColor: '#2563eb',
    sortOrder: 4,
    enabledFor: {
      incident: true,
      service_request: true,
      advisory_request: true,
      change_request: true,
      problem_request: true,
      task: true,
    },
  },
  {
    id: 'planning',
    name: '5-Planning',
    description: 'Scheduled or planned work — no immediate urgency, tracked for future sprints',
    color: '#fff',
    bgColor: '#0f766e',
    sortOrder: 5,
    enabledFor: {
      incident: false,
      service_request: true,
      advisory_request: true,
      change_request: false,
      problem_request: false,
      task: true,
    },
  },
];

const ALL_ENABLED: Record<string, boolean> = Object.fromEntries(
  TICKET_TYPE_COLUMNS.map((t) => [t.key, true]),
);

const DEFAULT_IMPACTS: ImpactLevel[] = [
  {
    id: 'high',
    name: 'high',
    displayName: '1 - High',
    description: 'Widespread disruption affecting multiple users or core business functions',
    bgColor: '#b91c1c',
    sortOrder: 1,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: '2 - Medium',
    description: 'Partial disruption affecting a team or a non-critical business function',
    bgColor: '#ca8a04',
    sortOrder: 2,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'low',
    name: 'low',
    displayName: '3 - Low',
    description: 'Minimal disruption, isolated to a single user or workaround available',
    bgColor: '#15803d',
    sortOrder: 3,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
];

const DEFAULT_URGENCIES: UrgencyLevel[] = [
  {
    id: 'high',
    name: 'high',
    displayName: '1 - High',
    description: 'Immediate resolution required — time-critical situation',
    bgColor: '#b91c1c',
    sortOrder: 1,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: '2 - Medium',
    description: 'Should be resolved within hours — significant business pressure',
    bgColor: '#ca8a04',
    sortOrder: 2,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
  {
    id: 'low',
    name: 'low',
    displayName: '3 - Low',
    description: 'Can wait until next available window — low time sensitivity',
    bgColor: '#15803d',
    sortOrder: 3,
    isActive: true,
    enabledFor: { ...ALL_ENABLED },
  },
];

const DEFAULT_MATRIX: MatrixMap = {
  high: { high: 'critical', medium: 'high', low: 'medium' },
  medium: { high: 'high', medium: 'medium', low: 'low' },
  low: { high: 'medium', medium: 'low', low: 'planning' },
};

// ── Color presets ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#b91c1c',
  '#ea580c',
  '#ca8a04',
  '#2563eb',
  '#0f766e',
  '#7c3aed',
  '#db2777',
  '#15803d',
  '#1d4ed8',
  '#374151',
];

// ── Priority form dialog ──────────────────────────────────────────────────────

interface PriorityFormDialogProps {
  open: boolean;
  editing: PriorityLevel | null;
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

const PriorityFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
}: PriorityFormDialogProps) => {
  const [form, setForm] = useState<Partial<PriorityLevel>>({});

  const handleEnter = () => {
    setForm(
      editing
        ? {
            name: editing.name,
            description: editing.description,
            bgColor: editing.bgColor,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            name: '',
            description: '',
            bgColor: '#2563eb',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {editing ? 'Edit Priority' : 'Add New Priority'}
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        <TextField
          label='Priority Name'
          size='small'
          value={form.name ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          helperText='e.g. 1-Critical, 2-High, 3-Medium'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          required
        />
        <TextField
          label='Description'
          size='small'
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                onClick={() => setForm((f) => ({ ...f, bgColor: c }))}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: form.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                  boxShadow: form.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.18)' },
                }}
              />
            ))}
            <TextField
              size='small'
              value={form.bgColor ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
              sx={{ ml: 0.5 }}
            />
            {form.bgColor && (
              <Chip
                label={form.name || 'Preview'}
                size='small'
                sx={{ bgcolor: form.bgColor, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
          </Box>
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
            {ticketTypeColumns.map((t) => (
              <FormControlLabel
                key={t.key}
                labelPlacement='end'
                control={
                  <Switch
                    size='small'
                    checked={form.enabledFor?.[t.key] ?? true}
                    onChange={(e) =>
                      setForm((f) => ({
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
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => onSave(form)}
          disabled={!form.name}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {editing ? 'Save Changes' : 'Add Priority'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Matrix components ─────────────────────────────────────────────────────────

const ColorDot = ({ color }: { color: string }) => (
  <Box
    sx={{
      width: 12,
      height: 12,
      borderRadius: '50%',
      bgcolor: color,
      flexShrink: 0,
      border: '1px solid rgba(0,0,0,0.12)',
    }}
  />
);

interface MatrixTableProps {
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrix: MatrixMap;
  editable: boolean;
  onCellChange: (impact: string, urgency: string, priorityId: string) => void;
}

const MatrixTable = ({
  priorities,
  impacts,
  urgencies,
  matrix,
  editable,
  onCellChange,
}: MatrixTableProps) => {
  const activePriorities = priorities;
  const activeImpacts = impacts.filter((i) => i.isActive);
  const activeUrgencies = urgencies.filter((u) => u.isActive);

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component='table'
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8rem',
          '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1.25, py: 0.875 },
          '& thead th': {
            bgcolor: 'grey.50',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          },
        }}
      >
        <thead>
          <tr>
            <Box
              component='th'
              sx={{ width: 130, textAlign: 'left !important', borderBottomWidth: '2px !important' }}
            >
              Impact ↓ / Urgency →
            </Box>
            {activeUrgencies.map((u) => (
              <Box component='th' key={u.id} sx={{ textAlign: 'center !important', minWidth: 130 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                  }}
                >
                  <ColorDot color={u.bgColor} />
                  <span>{u.displayName}</span>
                </Box>
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeImpacts.map((impact) => (
            <tr key={impact.id}>
              <Box
                component='td'
                sx={{ fontWeight: 600, bgcolor: 'grey.50 !important', whiteSpace: 'nowrap' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ColorDot color={impact.bgColor} />
                  <span>{impact.displayName}</span>
                </Box>
              </Box>
              {activeUrgencies.map((urgency) => {
                const pid = matrix[impact.id]?.[urgency.id] ?? '';
                const priority = activePriorities.find((p) => p.id === pid);
                return (
                  <Box
                    component='td'
                    key={urgency.id}
                    sx={{ textAlign: 'center', p: '6px !important' }}
                  >
                    {editable ? (
                      <FormControl size='small' sx={{ minWidth: 130 }}>
                        <Select
                          value={pid}
                          onChange={(e) => onCellChange(impact.id, urgency.id, e.target.value)}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: priority?.color ?? '#fff',
                            bgcolor: priority?.bgColor ?? 'grey.300',
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            '& .MuiSelect-icon': { color: '#fff' },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0,0,0,0.2)',
                            },
                          }}
                        >
                          {activePriorities.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ColorDot color={p.bgColor} />
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                  {p.name}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={priority?.name ?? pid}
                        size='small'
                        sx={{
                          bgcolor: priority?.bgColor ?? 'grey.300',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 24,
                          borderRadius: 1.5,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
};

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

// ── Impact / Urgency level section ────────────────────────────────────────────

interface SimpleLevel {
  id: string;
  displayName: string;
  description: string;
  bgColor: string;
  isActive: boolean;
  enabledFor: Record<string, boolean>;
}

// ── Simple level form dialog ──────────────────────────────────────────────────

interface SimpleLevelFormDialogProps {
  open: boolean;
  noun: string;
  editing: SimpleLevel | null;
  onClose: () => void;
  onSave: (data: Partial<SimpleLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

const SimpleLevelFormDialog = ({
  open,
  noun,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
}: SimpleLevelFormDialogProps) => {
  const [form, setForm] = useState<Partial<SimpleLevel>>({});

  const handleEnter = () => {
    setForm(
      editing
        ? {
            displayName: editing.displayName,
            description: editing.description,
            bgColor: editing.bgColor,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            displayName: '',
            description: '',
            bgColor: '#2563eb',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {editing ? `Edit ${noun}` : `Add New ${noun}`}
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        <TextField
          label={`${noun} Display Name`}
          size='small'
          value={form.displayName ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          helperText='e.g. 1 - High, 2 - Medium, 3 - Low'
          required
        />
        <TextField
          label='Description'
          size='small'
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                onClick={() => setForm((f) => ({ ...f, bgColor: c }))}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: form.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                  boxShadow: form.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.18)' },
                }}
              />
            ))}
            <TextField
              size='small'
              value={form.bgColor ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
              sx={{ ml: 0.5 }}
            />
            {form.bgColor && (
              <Chip
                label={form.displayName || 'Preview'}
                size='small'
                sx={{ bgcolor: form.bgColor, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
          </Box>
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
            {ticketTypeColumns.map((t) => (
              <FormControlLabel
                key={t.key}
                labelPlacement='end'
                control={
                  <Switch
                    size='small'
                    checked={form.enabledFor?.[t.key] ?? true}
                    onChange={(e) =>
                      setForm((f) => ({
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
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => onSave(form)}
          disabled={!form.displayName}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {editing ? 'Save Changes' : `Add ${noun}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Simple level section ──────────────────────────────────────────────────────

interface SimpleLevelSectionProps {
  items: SimpleLevel[];
  noun: string;
  valueLabel: string;
  defaultItems: SimpleLevel[];
  ticketTypeColumns: { key: string; label: string }[];
  onAdd: (data: Partial<SimpleLevel>) => void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => void;
  onDelete: (id: string) => void;
  onReset: (defaults: SimpleLevel[]) => void;
  onToggleActive: (id: string) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
}

const SimpleLevelSection = ({
  items,
  noun,
  valueLabel,
  defaultItems,
  ticketTypeColumns,
  onAdd,
  onEdit,
  onDelete,
  onReset,
  onToggleActive,
  onToggleEnabledFor,
}: SimpleLevelSectionProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadDefaults, setLoadDefaults] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleLevel | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setDialogOpen(true);
    }
  };

  const handleSave = (data: Partial<SimpleLevel>) => {
    if (editingItem) {
      onEdit(editingItem.id, data);
    } else {
      onAdd(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedId) {
      onDelete(selectedId);
      setSelectedId(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadDefaults(checked);
    if (checked) {
      onReset(defaultItems);
      setSelectedId(null);
    }
  };

  const columns: Column<SimpleLevel>[] = [
    {
      id: 'displayName',
      label: valueLabel,
      minWidth: 120,
      format: (_v, row): React.ReactNode => (
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
          <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
            {row.displayName}
          </Typography>
        </Box>
      ),
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
    ...ticketTypeColumns.map(
      (t): Column<SimpleLevel> => ({
        id: 'enabledFor' as keyof SimpleLevel,
        label: t.label,
        minWidth: 100,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleEnabledFor(row.id, t.key);
            }}
            onClick={(e) => e.stopPropagation()}
            color='success'
          />
        ),
      }),
    ),
  ];

  const filteredItems = search
    ? items.filter((i) =>
        [i.displayName, i.description].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : items;

  return (
    <>
      <Paper variant='outlined' className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {/* Add — always visible when nothing selected */}
          {!selectedId && (
            <Tooltip title={`Add a new ${noun.toLowerCase()}`}>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New {noun}
              </Button>
            </Tooltip>
          )}

          {/* Edit / Delete — visible when a row is selected */}
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

          {/* Load system default values */}
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

          {/* Search */}
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
            Selected: <strong>{items.find((i) => i.id === selectedId)?.displayName}</strong>
            &nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredItems}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>

      {/* Add / Edit dialog */}
      <SimpleLevelFormDialog
        open={dialogOpen}
        noun={noun}
        editing={editingItem}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        ticketTypeColumns={ticketTypeColumns}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {noun}</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete{' '}
            <strong>{items.find((i) => i.id === selectedId)?.displayName}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Matrix section with Edit toggle ──────────────────────────────────────────

interface MatrixSectionProps {
  label: string;
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrix: MatrixMap;
  onMatrixChange: (impact: string, urgency: string, priorityId: string) => void;
}

const MatrixSection = ({
  label,
  priorities,
  impacts,
  urgencies,
  matrix,
  onMatrixChange,
}: MatrixSectionProps) => {
  const [editable, setEditable] = useState(false);
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.82rem' }}>
          Shows how <strong>Impact</strong> × <strong>Urgency</strong> maps to a{' '}
          <strong>Priority</strong> for {label}.
        </Typography>
        <FormControlLabel
          labelPlacement='start'
          control={
            <Switch
              size='small'
              checked={editable}
              onChange={(e) => setEditable(e.target.checked)}
              color='primary'
            />
          }
          label={
            <Typography variant='caption' fontWeight={600} sx={{ fontSize: '0.78rem' }}>
              Edit Matrix
            </Typography>
          }
          sx={{ mr: 0, ml: 0, gap: 0.75 }}
        />
      </Box>
      <MatrixTable
        priorities={priorities}
        impacts={impacts}
        urgencies={urgencies}
        matrix={matrix}
        editable={editable}
        onCellChange={onMatrixChange}
      />
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
        {priorities.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            size='small'
            sx={{
              bgcolor: p.bgColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// ── Main Priorities section ───────────────────────────────────────────────────

const Priorities = () => {
  const { classes } = useStyles();
  const { priorities: apiPriorities, ticketTypeKeys, saveSection, isLoading } = useConfiguration();
  const { data: ticketTypes = [] } = useGetTicketTypeQuery();

  // Build type → displayName lookup from live AdminTicketType data
  const ticketTypeDisplayNames = Object.fromEntries(
    ticketTypes.map((t) => [t.type, t.displayName]),
  );

  // Local editable state — initialised from API, saved back on every change
  const [priorities, setPriorities] = useState<PriorityLevel[]>(DEFAULT_PRIORITIES);
  const [impacts, setImpacts] = useState<ImpactLevel[]>(DEFAULT_IMPACTS);
  const [urgencies, setUrgencies] = useState<UrgencyLevel[]>(DEFAULT_URGENCIES);
  const [matrices, setMatrices] = useState<Record<string, MatrixMap>>({});

  // Hydrate local state from API once loaded
  useEffect(() => {
    if (!apiPriorities) return;
    if (apiPriorities.levels.length) setPriorities(apiPriorities.levels as PriorityLevel[]);
    if (apiPriorities.impactLevels.length) setImpacts(apiPriorities.impactLevels as ImpactLevel[]);
    if (apiPriorities.urgencyLevels.length)
      setUrgencies(apiPriorities.urgencyLevels as UrgencyLevel[]);
    if (Object.keys(apiPriorities.matrices).length) setMatrices(apiPriorities.matrices);
  }, [apiPriorities]);

  // Persist changes back to the API
  const persistPriorities = (
    levels: PriorityLevel[],
    impactLevels: ImpactLevel[],
    urgencyLevels: UrgencyLevel[],
    mats: Record<string, MatrixMap>,
  ) => {
    saveSection('priorities', {
      levels,
      impactLevels,
      urgencyLevels,
      matrices: mats,
    });
  };

  // Derive ticket-type columns from API (downstream of AdminTicketType)
  const activeTicketTypeColumns = ticketTypeKeys.length
    ? ticketTypeKeys.map((key) => ({
        key,
        label: ticketTypeDisplayNames[key] ?? TICKET_TYPE_MATRIX_CONFIG[key]?.label ?? key,
      }))
    : TICKET_TYPE_COLUMNS;

  // ── Priority table toolbar state ─────────────────────────────────────────
  const [tableSearch, setTableSearch] = useState('');
  const [selectedPriorityId, setSelectedPriorityId] = useState<string | null>(null);
  const [loadSystemDefaults, setLoadSystemDefaults] = useState(false);
  const [useImpactUrgency, setUseImpactUrgency] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityLevel | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId) ?? null;

  // ── Priority CRUD ─────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingPriority(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = () => {
    if (selectedPriority) {
      setEditingPriority(selectedPriority);
      setDialogOpen(true);
    }
  };

  const handleSavePriority = (data: Partial<PriorityLevel>) => {
    let next: PriorityLevel[];
    if (editingPriority) {
      next = priorities.map((p) => (p.id === editingPriority.id ? { ...p, ...data } : p));
    } else {
      const id = (data.name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newItem: PriorityLevel = {
        id,
        name: data.name ?? id,
        description: data.description ?? '',
        color: '#fff',
        bgColor: data.bgColor ?? '#2563eb',
        sortOrder: priorities.length + 1,
        enabledFor:
          data.enabledFor ?? Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
      };
      next = [...priorities, newItem];
    }
    setPriorities(next);
    persistPriorities(next, impacts, urgencies, matrices);
    setDialogOpen(false);
  };

  const handleDeletePriority = () => {
    if (selectedPriorityId) {
      const next = priorities.filter((p) => p.id !== selectedPriorityId);
      setPriorities(next);
      persistPriorities(next, impacts, urgencies, matrices);
      setSelectedPriorityId(null);
    }
    setConfirmDeleteOpen(false);
  };

  const handleToggleEnabledFor = (priorityId: string, ticketType: string) => {
    const next = priorities.map((p) =>
      p.id === priorityId
        ? { ...p, enabledFor: { ...p.enabledFor, [ticketType]: !p.enabledFor[ticketType] } }
        : p,
    );
    setPriorities(next);
    persistPriorities(next, impacts, urgencies, matrices);
  };

  const handleLoadDefaults = (checked: boolean) => {
    setLoadSystemDefaults(checked);
    if (checked) {
      setPriorities(DEFAULT_PRIORITIES);
      setSelectedPriorityId(null);
      persistPriorities(DEFAULT_PRIORITIES, impacts, urgencies, matrices);
    }
  };

  const filteredPriorities = tableSearch
    ? priorities.filter((p) =>
        [p.name, p.description].some((v) => v?.toLowerCase().includes(tableSearch.toLowerCase())),
      )
    : priorities;

  // ── Priority DataTable columns ────────────────────────────────────────────
  const columns: Column<PriorityLevel>[] = [
    {
      id: 'name',
      label: 'Urgency Values',
      minWidth: 130,
      format: (_v, row): React.ReactNode => (
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
          <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
            {row.name}
          </Typography>
        </Box>
      ),
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
    // One column per active ticket type (from API — downstream of AdminTicketType)
    ...activeTicketTypeColumns.map(
      (t): Column<PriorityLevel> => ({
        id: 'enabledFor' as keyof PriorityLevel,
        label: t.label,
        minWidth: 100,
        align: 'center',
        format: (_v, row): React.ReactNode => (
          <Switch
            size='small'
            checked={row.enabledFor[t.key] ?? false}
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

  // ── Impact / Urgency toggle helpers ──────────────────────────────────────
  const toggleImpactActive = (id: string) => {
    const next = impacts.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i));
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  const toggleImpactEnabledFor = (id: string, ticketType: string) => {
    const next = impacts.map((i) =>
      i.id === id
        ? { ...i, enabledFor: { ...i.enabledFor, [ticketType]: !i.enabledFor[ticketType] } }
        : i,
    );
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  const toggleUrgencyActive = (id: string) => {
    const next = urgencies.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  const toggleUrgencyEnabledFor = (id: string, ticketType: string) => {
    const next = urgencies.map((u) =>
      u.id === id
        ? { ...u, enabledFor: { ...u.enabledFor, [ticketType]: !u.enabledFor[ticketType] } }
        : u,
    );
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  // ── Impact CRUD ───────────────────────────────────────────────────────────
  const handleImpactAdd = (data: Partial<SimpleLevel>) => {
    const id =
      (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `impact_${Date.now()}`;
    const newItem: ImpactLevel = {
      id,
      name: id,
      displayName: data.displayName ?? id,
      description: data.description ?? '',
      bgColor: data.bgColor ?? '#2563eb',
      sortOrder: impacts.length + 1,
      isActive: true,
      enabledFor:
        data.enabledFor ?? Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
    };
    const next = [...impacts, newItem];
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  const handleImpactEdit = (id: string, data: Partial<SimpleLevel>) => {
    const next = impacts.map((i) => (i.id === id ? { ...i, ...data } : i));
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  const handleImpactDelete = (id: string) => {
    const next = impacts.filter((i) => i.id !== id);
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  const handleImpactReset = (defaults: SimpleLevel[]) => {
    const next = defaults as ImpactLevel[];
    setImpacts(next);
    persistPriorities(priorities, next, urgencies, matrices);
  };

  // ── Urgency CRUD ──────────────────────────────────────────────────────────
  const handleUrgencyAdd = (data: Partial<SimpleLevel>) => {
    const id =
      (data.displayName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `urgency_${Date.now()}`;
    const newItem: UrgencyLevel = {
      id,
      name: id,
      displayName: data.displayName ?? id,
      description: data.description ?? '',
      bgColor: data.bgColor ?? '#2563eb',
      sortOrder: urgencies.length + 1,
      isActive: true,
      enabledFor:
        data.enabledFor ?? Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
    };
    const next = [...urgencies, newItem];
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  const handleUrgencyEdit = (id: string, data: Partial<SimpleLevel>) => {
    const next = urgencies.map((u) => (u.id === id ? { ...u, ...data } : u));
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  const handleUrgencyDelete = (id: string) => {
    const next = urgencies.filter((u) => u.id !== id);
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  const handleUrgencyReset = (defaults: SimpleLevel[]) => {
    const next = defaults as UrgencyLevel[];
    setUrgencies(next);
    persistPriorities(priorities, impacts, next, matrices);
  };

  const updateMatrix = (
    ticketType: string,
    impact: string,
    urgency: string,
    priorityId: string,
  ) => {
    const next = {
      ...matrices,
      [ticketType]: {
        ...(matrices[ticketType] ?? {}),
        [impact]: { ...(matrices[ticketType]?.[impact] ?? {}), [urgency]: priorityId },
      },
    };
    setMatrices(next);
    persistPriorities(priorities, impacts, urgencies, next);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      {/* ── 1. Priorities ──────────────────────────────────────────────────── */}
      <Section
        icon={<PriorityHighIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Priorities'
        subtitle='Define priority levels and control which ticket types each priority applies to'
        accentColor='#b91c1c'
        defaultExpanded
      >
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {/* Add — always visible when nothing selected */}
            {!selectedPriorityId && (
              <Tooltip title='Add a new priority level'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  Add New Priority
                </Button>
              </Tooltip>
            )}

            {/* Edit / Delete — visible when a row is selected */}
            {selectedPriorityId && (
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

            {/* Load system default values */}
            <FormControlLabel
              labelPlacement='start'
              control={
                <Switch
                  size='small'
                  checked={loadSystemDefaults}
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

            <Divider orientation='vertical' flexItem className={classes.toolbarDivider} />

            {/* Use Impact and Urgency based Priorities */}
            <FormControlLabel
              labelPlacement='start'
              control={
                <Switch
                  size='small'
                  checked={useImpactUrgency}
                  onChange={(e) => setUseImpactUrgency(e.target.checked)}
                  color='primary'
                />
              }
              label={
                <Typography variant='body2' fontWeight={500} fontSize='0.8rem'>
                  Use Impact and Urgency based Priorities
                </Typography>
              }
              sx={{ mr: 0, ml: 0, gap: 0.75, width: { xs: '100%', sm: 'auto' } }}
            />

            {/* Search */}
            <TextField
              size='small'
              placeholder='Search...'
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
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

          {/* Selection info bar */}
          {selectedPriorityId && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedPriority?.name}</strong>&nbsp;·&nbsp;
              <Link
                component='button'
                variant='caption'
                onClick={() => setSelectedPriorityId(null)}
              >
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* DataTable */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={filteredPriorities}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedPriorityId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedPriorityId ?? undefined}
          />
        </Paper>
      </Section>

      {/* ── 2. Impact ──────────────────────────────────────────────────────── */}
      <Section
        icon={<FlashOnIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Impact'
        subtitle='Define impact levels — how broadly a ticket affects the business'
        accentColor='#ea580c'
      >
        <SimpleLevelSection
          items={impacts}
          noun='Impact'
          valueLabel='Impact Values'
          defaultItems={DEFAULT_IMPACTS}
          ticketTypeColumns={activeTicketTypeColumns}
          onAdd={handleImpactAdd}
          onEdit={handleImpactEdit}
          onDelete={handleImpactDelete}
          onReset={handleImpactReset}
          onToggleActive={toggleImpactActive}
          onToggleEnabledFor={toggleImpactEnabledFor}
        />
      </Section>

      {/* ── 3. Urgency ─────────────────────────────────────────────────────── */}
      <Section
        icon={<SpeedIcon sx={{ color: '#fff', fontSize: '1rem' }} />}
        title='Urgency'
        subtitle='Define urgency levels — how time-sensitive a ticket is'
        accentColor='#ca8a04'
      >
        <SimpleLevelSection
          items={urgencies}
          noun='Urgency'
          valueLabel='Urgency Values'
          defaultItems={DEFAULT_URGENCIES}
          ticketTypeColumns={activeTicketTypeColumns}
          onAdd={handleUrgencyAdd}
          onEdit={handleUrgencyEdit}
          onDelete={handleUrgencyDelete}
          onReset={handleUrgencyReset}
          onToggleActive={toggleUrgencyActive}
          onToggleEnabledFor={toggleUrgencyEnabledFor}
        />
      </Section>

      {/* ── 4–9. Per-ticket-type priority matrices (driven by AdminTicketType) ── */}
      {activeTicketTypeColumns.map(({ key }) => {
        const displayName =
          ticketTypeDisplayNames[key] ?? TICKET_TYPE_MATRIX_CONFIG[key]?.label ?? key;
        const cfg = TICKET_TYPE_MATRIX_CONFIG[key] ?? {
          label: displayName,
          pluralLabel: `${displayName}s`,
          accentColor: '#6366f1',
          Icon: TuneIcon,
        };
        const { Icon } = cfg;
        return (
          <Section
            key={key}
            icon={<Icon sx={{ color: '#fff', fontSize: '1rem' }} />}
            title={`${displayName} Priorities based on Impact and Urgency`}
            subtitle={`Configure how Impact × Urgency determines priority for ${cfg.pluralLabel}`}
            accentColor={cfg.accentColor}
          >
            <MatrixSection
              label={cfg.pluralLabel}
              priorities={priorities}
              impacts={impacts}
              urgencies={urgencies}
              matrix={matrices[key] ?? DEFAULT_MATRIX}
              onMatrixChange={(i, u, p) => updateMatrix(key, i, u, p)}
            />
          </Section>
        );
      })}

      {/* ── Priority form dialog ────────────────────────────────────────────── */}
      <PriorityFormDialog
        open={dialogOpen}
        editing={editingPriority}
        onClose={() => setDialogOpen(false)}
        onSave={handleSavePriority}
        ticketTypeColumns={activeTicketTypeColumns}
      />

      {/* ── Delete confirm dialog ───────────────────────────────────────────── */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Priority</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to delete <strong>{selectedPriority?.name}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            sx={{ textTransform: 'none', borderRadius: 2 }}
            onClick={handleDeletePriority}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Priorities;
