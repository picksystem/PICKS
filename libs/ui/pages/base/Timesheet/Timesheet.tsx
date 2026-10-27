import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Modal,
  Toggle,
  NavigateBeforeIcon,
  NavigateNextIcon,
  ArrowBackIcon,
  PageHeader,
  AddIcon,
  ContentCopyIcon,
  LinkIcon,
  AttachFileIcon,
  EditIcon,
  StarBorderIcon,
  StarIcon,
  IconButton,
  TextField,
  Checkbox,
  BookmarkIcon,
  CommentIcon,
  AssessmentIcon,
} from '../../../components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Stack,
  styled,
} from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaidIcon from '@mui/icons-material/Paid';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PercentIcon from '@mui/icons-material/Percent';
import { useNotification } from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import { useNavigate } from 'react-router-dom';
import { ProjectSearchField } from '../Configuration/shared/GenericPanel/components/ProjectSearchField/ProjectSearchField';
import { ClientSearchField } from '../Configuration/shared/GenericPanel/components/ClientSearchField/ClientSearchField';
import { OptionsSearchField } from '../Configuration/shared/GenericPanel/components/OptionsSearchField/OptionsSearchField';
import {
  RichTextEditor,
  parseRichText,
  serializeRichText,
} from '../Configuration/shared/RichTextEditor';
import { useStyles } from './styles';
import { TimesheetLine, TIMESHEET_TASKS, DayEntry, ApprovalEntry } from './types/timesheet.types';

export const theme_warning = '#ff9800';
export const theme_success = '#008a00';
export const theme_error = '#d32f2f';
export const theme_draft = '#c5cae9';

/* ── Note types: external (client-visible, blue) vs internal (team-only, amber) ── */
export type NoteKind = 'external' | 'internal';

const NOTE_TYPE_CONFIG: Record<
  NoteKind,
  {
    color: string;
    emptyLabel: string;
    filledLabel: string;
    dialogTitle: string;
    dialogSubtitle: string;
    editorTitle: string;
  }
> = {
  external: {
    color: '#1d4ed8',
    emptyLabel: 'Add External comment',
    filledLabel: 'External comment',
    dialogTitle: 'Add External comment',
    dialogSubtitle: 'Visible to the client — use plain, client-friendly language.',
    editorTitle: 'External Comment',
  },
  internal: {
    color: theme_warning,
    emptyLabel: 'Add Internal comment',
    filledLabel: 'Internal comment',
    dialogTitle: 'Add Internal comment',
    dialogSubtitle: 'Visible to your team only — never shown to the client.',
    editorTitle: 'Internal Comment',
  },
};

const STATUS_LEGEND: { label: string; color: string }[] = [
  { label: 'Draft', color: theme_draft },
  { label: 'Pending', color: theme_warning },
  { label: 'Approved', color: theme_success },
  { label: 'Rejected', color: theme_error },
];

const StatusDot = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  flexShrink: 0,
}));

const TIMESHEET_ICON_SX = { fontSize: '1.5rem' };

const TASK_OPTIONS = TIMESHEET_TASKS.map((t) => ({ value: t, label: t }));

/* ── KPI stat card: pastel icon chip + value/label, shared by both rows ── */
/* ── Holiday / leave hours per line id (used by the KPI cards) ── */
const HOLIDAYS_HOURS: Record<string, number> = { 'line-4': 8 };
const LEAVES_HOURS: Record<string, number> = { 'line-3': 8 };

const STAT_CARD_TONES = {
  indigo: { bg: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  blue: { bg: '#dbeafe', border: '#bfdbfe', color: '#2563eb' },
  green: { bg: '#d1fae5', border: '#a7f3d0', color: '#059669' },
  amber: { bg: '#fef3c7', border: '#fde68a', color: '#d97706' },
  teal: { bg: '#ccfbf1', border: '#99f6e4', color: '#0d9488' },
  cyan: { bg: '#e0f2fe', border: '#bae6fd', color: '#0284c7' },
  purple: { bg: '#ede9fe', border: '#ddd6fe', color: '#7c3aed' },
} as const;

const StatCard = ({
  tone,
  icon: Icon,
  value,
  label,
  valueNode,
  classes,
}: {
  tone: keyof typeof STAT_CARD_TONES;
  icon: React.ElementType;
  value?: string;
  label: string;
  valueNode?: React.ReactNode;
  classes: Record<string, string>;
}) => {
  const toneCfg = STAT_CARD_TONES[tone];
  return (
    <Box className={classes.statCardWrapper}>
      <Box
        className={classes.statCardIconBox}
        sx={{ backgroundColor: toneCfg.bg, border: `1px solid ${toneCfg.border}` }}
      >
        <Icon sx={{ color: toneCfg.color, fontSize: '1.25rem' }} />
      </Box>
      <Box>
        {valueNode ?? (
          <Typography className={classes.statCardValue}>{value}</Typography>
        )}
        <Typography className={classes.statCardLabel}>{label}</Typography>
      </Box>
    </Box>
  );
};

const TimesheetIconPill = ({
  color,
  children,
  classes,
}: {
  color: string;
  children: React.ReactNode;
  classes: Record<string, string>;
}) => (
  <Box
    className={classes.timesheetIconPill}
    style={{ background: `${color}18` } as React.CSSProperties}
  >
    {children}
  </Box>
);

const DAY_KEY_MAP: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const DAY_SHORT: Record<string, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

const buildWeek = (offset: number): DayEntry[] => {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1 + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = DAY_KEY_MAP[d.getDay()];
    return {
      key,
      day: DAY_SHORT[key],
      date: `${d.getDate()}`,
      hours: 0,
    };
  });
};

const APPROVAL_HISTORY: ApprovalEntry[] = [
  {
    id: 'appr-1',
    period: '04-Oct-2026 – 10-Oct-2026',
    status: 'approved',
    submittedOn: '11-Oct-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: 'Srinivas Penumalla',
  },
  {
    id: 'appr-2',
    period: '27-Sep-2026 – 03-Oct-2026',
    status: 'approved',
    submittedOn: '04-Oct-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: 'Srinivas Penumalla',
  },
  {
    id: 'appr-3',
    period: '20-Sep-2026 – 26-Sep-2026',
    status: 'pending',
    submittedOn: '27-Sep-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: '—',
  },
];

const seedLines = (week: DayEntry[]): TimesheetLine[] => {
  const keys = week.map((d) => d.key);
  const days = (vals: number[]) =>
    vals.reduce(
      (acc, v, i) => {
        acc[keys[i]] = v;
        return acc;
      },
      {} as Record<string, number>,
    );

  return [
    {
      id: 'line-1',
      client: 'Hive Implementation',
      task: 'Development',
      externalNote: '',
      internalNote: '',
      billable: true,
      dayValues: days([8, 8, 0, 0, 0, 0, 0]),
      status: 'pending',
      liked: false,
      favourited: false,
    },
    {
      id: 'line-2',
      client: 'Hive Implementation',
      task: 'Internal calls',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([1, 1, 0, 0, 0, 0, 0]),
      status: 'pending',
    },
    {
      id: 'line-3',
      client: 'Administrative',
      task: 'Vacation',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([0, 0, 0, 0, 0, 0, 0]),
      status: 'pending',
    },
    {
      id: 'line-4',
      client: 'Administrative',
      task: 'Fixed holidays',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([0, 0, 0, 0, 0, 0, 0]),
      status: 'approved',
    },
  ];
};

/* ── Note dialog: type-differentiated header & theme per kind ── */
const NoteDialog = ({
  kind,
  draft,
  onClose,
  onSave,
  onDraftChange,
  modalFooterClass,
}: {
  kind: NoteKind;
  draft: string;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (d: string) => void;
  modalFooterClass?: string;
}) => {
  const cfg = NOTE_TYPE_CONFIG[kind];

  return (
    <Modal
      open
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${cfg.color}22 0%, ${cfg.color}44 100%)`}
      headerTextColor={cfg.color}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: `${cfg.color}22`,
              border: `1px solid ${cfg.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {kind === 'external' ? (
              <PublicIcon sx={{ fontSize: '1rem', color: cfg.color }} />
            ) : (
              <LockIcon sx={{ fontSize: '1rem', color: cfg.color }} />
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
              {cfg.dialogTitle}
            </Typography>
            <Typography
              sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}
            >
              {cfg.dialogSubtitle}
            </Typography>
          </Box>
        </Box>
      }
      maxWidth='xs'
      footer={
        <Stack direction='row' spacing={1} justifyContent='center'>
          <Button variant='outlined' size='small' label='Cancel' onClick={onClose} />
          <Button
            variant='contained'
            size='small'
            label='Save'
            onClick={onSave}
            sx={{ bgcolor: cfg.color, '&:hover': { bgcolor: `${cfg.color}dd` } }}
          />
        </Stack>
      }
    >
      <Box sx={{ p: 1 }}>
        <RichTextEditor
          value={{ segments: parseRichText(draft).segments }}
          onChange={(value) => onDraftChange(serializeRichText(value.segments))}
          showFooterActions={false}
          title={cfg.editorTitle}
        />
      </Box>
    </Modal>
  );
};

/* ── Note cell button: same layout, clearly different per type ── */
const NoteCellButton = ({
  kind,
  hasValue,
  disabled,
  onOpen,
}: {
  kind: NoteKind;
  hasValue: boolean;
  disabled?: boolean;
  onOpen: () => void;
}) => {
  const cfg = NOTE_TYPE_CONFIG[kind];
  return (
    <Box
      className='noteButton'
      onClick={onOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        border: `1px solid ${cfg.color}`,
        borderRadius: 10,
        p: '4px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        background: hasValue ? `${cfg.color}10` : 'transparent',
        transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          boxShadow: `0 0 0 3px ${cfg.color}22`,
          backgroundColor: `${cfg.color}08`,
        },
      }}
    >
      <Stack direction='row' spacing={0.5} alignItems='center'>
        {/* type badge */}
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: 2,
            backgroundColor: hasValue ? cfg.color : 'transparent',
            border: `1px solid ${cfg.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {kind === 'external' ? (
            <PublicIcon sx={{ fontSize: '0.8rem', color: hasValue ? '#fff' : cfg.color }} />
          ) : (
            <LockIcon sx={{ fontSize: '0.8rem', color: hasValue ? '#fff' : cfg.color }} />
          )}
        </Box>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: hasValue ? cfg.color : 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {hasValue ? cfg.filledLabel : cfg.emptyLabel}
        </Typography>
      </Stack>
      <EditIcon
        sx={{
          fontSize: '1.15rem',
          color: cfg.color,
          transform: 'rotate(-45deg)',
        }}
      />
    </Box>
  );
};

const Timesheet = () => {
  const { classes, cx } = useStyles();
  const notify = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => buildWeek(weekOffset), [weekOffset]);

  const [lines, setLines] = useState<TimesheetLine[]>(() => seedLines(buildWeek(0)));
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [showDetailedTotals, setShowDetailedTotals] = useState(true);
  const [showAdvancedNotes, setShowAdvancedNotes] = useState(false);
  const [selectedLineIds, setSelectedLineIds] = useState<Record<string, boolean>>({});

  // ── Note dialog state ──────────────────────────────────────────
  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    lineId: string;
    kind: NoteKind;
    draft: string;
  }>({ open: false, lineId: '', kind: 'external', draft: '' });

  const openNoteDialog = (lineId: string, kind: NoteKind) => {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;
    setNoteDialog({
      open: true,
      lineId,
      kind,
      draft: kind === 'external' ? line.externalNote : line.internalNote,
    });
  };

  const closeNoteDialog = () =>
    setNoteDialog((prev) => ({ ...prev, open: false, lineId: '', draft: '' }));

  const saveNoteDialog = () => {
    updateLine(noteDialog.lineId, {
      [noteDialog.kind === 'external' ? 'externalNote' : 'internalNote']: noteDialog.draft,
    });
    closeNoteDialog();
  };

  const allLinesSelected = lines.length > 0 && lines.every((l) => selectedLineIds[l.id]);
  const someLinesSelected = lines.some((l) => selectedLineIds[l.id]);

  const toggleSelectAll = () => {
    setSelectedLineIds(allLinesSelected ? {} : Object.fromEntries(lines.map((l) => [l.id, true])));
  };

  const toggleSelectLine = (id: string) => {
    setSelectedLineIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const weekRangeLabel = useMemo(() => {
    const base = new Date();
    const startOfThisWeek = new Date(base);
    startOfThisWeek.setDate(base.getDate() - base.getDay() + 1);
    const startOfWeek = new Date(startOfThisWeek);
    startOfWeek.setDate(startOfThisWeek.getDate() + weekOffset * 7);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt(startOfWeek)}  -  ${fmt(new Date(startOfWeek.getTime() + 6 * 86400000))}`;
  }, [weekOffset]);

  const handleCopyFromPreviousWeek = () => {
    const prevWeek = buildWeek(weekOffset - 1);
    const prevKeys = prevWeek.map((d) => d.key);
    const curKeys = week.map((d) => d.key);
    const keyMap: Record<string, string> = {};
    curKeys.forEach((k, i) => {
      keyMap[k] = prevKeys[i];
    });
    setLines((prev) =>
      prev.map((line) => {
        const dayValues = { ...line.dayValues };
        for (const curKey of curKeys) {
          const srcKey = keyMap[curKey];
          dayValues[curKey] = dayValues[srcKey] ?? 0;
        }
        return { ...line, dayValues };
      }),
    );
    notify.success('Copied hours from previous week');
  };

  const updateLine = (id: string, patch: Partial<TimesheetLine>) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const updateDayValue = (id: string, dayKey: string, value: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, dayValues: { ...line.dayValues, [dayKey]: value } } : line,
      ),
    );
  };

  const handleDeleteLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
    notify.info('Timesheet line deleted');
  };

  const totals = useMemo(() => {
    const perDay = week.map((d) => {
      let all = 0;
      let billable = 0;
      let nonBillable = 0;
      lines.forEach((line) => {
        const v = line.dayValues[d.key] ?? 0;
        all += v;
        if (line.billable) billable += v;
        else nonBillable += v;
      });
      return { all, billable, nonBillable };
    });
    const grand = {
      all: perDay.reduce((sum, d) => sum + d.all, 0),
      billable: perDay.reduce((sum, d) => sum + d.billable, 0),
      nonBillable: perDay.reduce((sum, d) => sum + d.nonBillable, 0),
    };
    const billableRatio =
      grand.all > 0 ? `${Math.round((grand.billable / grand.all) * 100)}%` : '—';

    // Status counts across all lines (for the summary cards)
    const statusCounts = lines.reduce(
      (acc, line) => {
        switch (line.status) {
          case 'approved':
            acc.approved += 1;
            break;
          case 'submitted':
            acc.pending += 1;
            break;
          default:
            acc.draft += 1;
        }
        return acc;
      },
      { draft: 0, pending: 0, approved: 0, rejected: 0 },
    );

    return { perDay, grand, billableRatio, statusCounts };
  }, [lines, week]);

  /* Overall status for the KPI "Status" card:
     Approved → only when EVERY line is approved
     Pending  → any line awaiting review (pending / submitted)
     Draft    → nothing entered / no line is in review yet */
  const overallStatus = useMemo(() => {
    if (lines.length === 0) return 'Draft';
    if (lines.every((l) => l.status === 'approved')) return 'Approved';
    if (lines.some((l) => l.status === 'pending' || l.status === 'submitted'))
      return 'Pending';
    return 'Draft';
  }, [lines]);

  /* Holiday / leave hours for lines that still exist */
  const holidayHours = Object.entries(HOLIDAYS_HOURS).reduce(
    (sum, [id, hours]) => (lines.some((l) => l.id === id) ? sum + hours : sum),
    0,
  );
  const leaveHours = Object.entries(LEAVES_HOURS).reduce(
    (sum, [id, hours]) => (lines.some((l) => l.id === id) ? sum + hours : sum),
    0,
  );

  const handleSave = () => {
    notify.success('Timesheet saved');
  };

  const handleSubmit = () => {
    setSubmitModalOpen(false);
    notify.success('Timesheet submitted for approval');
  };

  const toolbarActions = [
    {
      label: 'New line',
      icon: AddIcon,
      color: '#1976d2',
      onClick: () => notify.info('New line coming soon'),
    },
    {
      label: 'Edit',
      icon: EditIcon,
      color: '#1d4ed8',
      onClick: () => notify.info('Edit coming soon'),
    },
    {
      label: 'Remove line',
      icon: DeleteIcon,
      color: '#dc2626',
      onClick: () => notify.info('Remove line coming soon'),
    },
    {
      label: 'Copy from favourite',
      icon: StarIcon,
      color: '#7c3aed',
      onClick: () => notify.info('Copy from favourite coming soon'),
    },
    {
      label: 'Copy from timesheet',
      icon: ContentCopyIcon,
      color: '#1d4ed8',
      onClick: handleCopyFromPreviousWeek,
    },
    {
      label: 'Add to favourites',
      icon: StickyNote2Icon,
      color: '#ca8a04',
      onClick: () => notify.info('Line added to favourites'),
    },
    {
      label: 'Copy to a timesheet',
      icon: LinkIcon,
      color: '#059669',
      onClick: () => notify.info('Copy to a timesheet coming soon'),
    },
    {
      label: 'Add attachment',
      icon: AttachFileIcon,
      color: '#92400e',
      onClick: () => notify.info('Attachment coming soon'),
    },
    {
      label: 'Use advanced notes',
      icon: CommentIcon,
      color: '#0d9488',
      onClick: () => setShowAdvancedNotes((v) => !v),
    },
    {
      label: 'Show detailed totals',
      icon: AssessmentIcon,
      color: '#0284c7',
      onClick: () => setShowDetailedTotals((v) => !v),
    },
    {
      label: 'Manage favourites',
      icon: BookmarkIcon,
      color: '#d97706',
      onClick: () => notify.info('Manage favourites coming soon'),
    },
  ];

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Timesheet'
        description='Log your hours per task for the selected week.'
        className={classes.pageHeader}
      />

      {/* ── Top bar: tabs + actions ───────────────────────────── */}
      <Box className={classes.topBar}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} className={classes.tabsBar}>
          <Tab label='Timesheet' />
          <Tab label='Approval History' />
        </Tabs>

        <Stack direction='row' spacing={1}>
          <Button
            variant='outlined'
            size='small'
            label='My Allocation'
            className={classes.topAction}
            onClick={() => notify.info('My Allocation coming soon')}
          />
          <Button
            variant='outlined'
            size='small'
            startIcon={<ArrowBackIcon />}
            label='Back'
            className={classes.topAction}
            onClick={() => navigate(constants.BasePath.TIMESHEET)}
          />
        </Stack>
      </Box>

      {activeTab === 0 ? (
        <>
          {/* ── Stat cards: all in a single row ───────────────── */}
          <Box className={classes.statCardsRow}>
            <StatCard
              tone='green'
              icon={PaidIcon}
              value={`${totals.grand.all}h`}
              label='Total Hours'
              classes={classes}
            />
            <StatCard
              tone={overallStatus === 'Approved' ? 'green' : 'amber'}
              icon={LocalOfferIcon}
              value={overallStatus}
              label='Status'
              classes={classes}
            />
            <StatCard
              tone='cyan'
              icon={BeachAccessIcon}
              value={`${totals.grand.billable}h`}
              label='Billable Hours'
              classes={classes}
            />
            <StatCard
              tone='blue'
              icon={EventBusyIcon}
              value={`${totals.grand.nonBillable}h`}
              label='Non-Billable Hours'
              classes={classes}
            />
            <StatCard
              tone='teal'
              icon={BeachAccessIcon}
              value={`${holidayHours}h`}
              label='Holidays'
              classes={classes}
            />
            <StatCard
              tone='indigo'
              icon={ScheduleIcon}
              value={`${leaveHours}h`}
              label='Leaves'
              classes={classes}
            />
            <StatCard
              tone='purple'
              icon={PercentIcon}
              value={totals.billableRatio}
              label='Billable Ratio'
              classes={classes}
            />
          </Box>

          {/* ── Toolbar: icon-pill actions ─────────────────────── */}
          <Box className={classes.linesToolbar}>
            {toolbarActions.map((btn) => (
              <Box key={btn.label} className={classes.timesheetActionButton} onClick={btn.onClick}>
                <TimesheetIconPill color={btn.color} classes={classes}>
                  <btn.icon sx={{ ...TIMESHEET_ICON_SX, color: btn.color }} />
                </TimesheetIconPill>
                <Typography className={classes.timesheetActionLabel}>{btn.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* ── Person / period bar ───────────────────────────── */}
          <Box className={classes.periodBar}>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              className={classes.periodControls}
            >
              <Button
                variant='contained'
                size='small'
                startIcon={<NavigateBeforeIcon />}
                className={classes.periodNav}
                onClick={() => setWeekOffset((o) => o - 1)}
              />
              <Typography variant='body2' className={classes.periodLabel}>
                {weekRangeLabel}
              </Typography>
              <Button
                variant='contained'
                size='small'
                endIcon={<NavigateNextIcon />}
                className={classes.periodNav}
                onClick={() => setWeekOffset((o) => o + 1)}
              />
            </Stack>
          </Box>

          {/* ── Timesheet lines section ───────────────────────── */}
          <Box className={classes.linesSection}>
            {lines.length === 0 ? (
              <Box className={classes.emptyState}>
                <AddIcon className={classes.emptyIcon} />
                <Typography variant='body1' color='text.secondary'>
                  No timesheet lines yet. Click &ldquo;New line&rdquo; to add one.
                </Typography>
              </Box>
            ) : (
              /* ── Timesheet grid ─────────────────────────────── */
              <TableContainer className={classes.tableContainer}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell className={cx(classes.headerCell, classes.selectCell)}>
                        <Checkbox
                          checked={allLinesSelected}
                          indeterminate={someLinesSelected && !allLinesSelected}
                          onChange={toggleSelectAll}
                          size='small'
                          className={classes.checkbox}
                        />
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.cellSelectHeader)}>
                        Client
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.cellSelectHeader)}>
                        Project
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.cellSelectHeader)}>
                        Task
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.noteCell)}>
                        External Note
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.noteCell)}>
                        Internal Note
                      </TableCell>
                      <TableCell className={classes.headerCell}>Billable</TableCell>
                      {week.map((d) => (
                        <TableCell
                          key={d.key}
                          className={cx(classes.headerCell, classes.dayColumn)}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {d.day}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {d.date}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell className={classes.headerCell}>Total Hours</TableCell>
                      <TableCell className={classes.headerCell}>Status</TableCell>
                      <TableCell className={classes.headerCell}>Line actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line) => {
                      const lineTotal = week.reduce(
                        (sum, d) => sum + (line.dayValues[d.key] ?? 0),
                        0,
                      );
                      const isApproved = line.status === 'approved';
                      return (
                        <TableRow key={line.id} className={classes.dataRow}>
                          <TableCell className={classes.selectCell}>
                            <Checkbox
                              checked={!!selectedLineIds[line.id]}
                              onChange={() => toggleSelectLine(line.id)}
                              size='small'
                              className={classes.checkbox}
                            />
                          </TableCell>
                          <TableCell>
                            <ClientSearchField
                              value={line.client}
                              onChange={(client) => updateLine(line.id, { client })}
                              disabled={isApproved}
                            />
                          </TableCell>
                          <TableCell>
                            <ProjectSearchField
                              value={line.project ?? ''}
                              onChange={(project) => updateLine(line.id, { project })}
                              disabled={isApproved}
                            />
                          </TableCell>
                          <TableCell>
                            <OptionsSearchField
                              label='Task'
                              value={line.task}
                              options={TASK_OPTIONS}
                              onChange={(task) => updateLine(line.id, { task })}
                              disabled={isApproved}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  height: 30,
                                  fontSize: '0.8rem',
                                },
                                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <NoteCellButton
                              kind='external'
                              hasValue={Boolean(line.externalNote)}
                              disabled={isApproved}
                              onOpen={() => openNoteDialog(line.id, 'external')}
                            />
                          </TableCell>
                          <TableCell>
                            <NoteCellButton
                              kind='internal'
                              hasValue={Boolean(line.internalNote)}
                              disabled={isApproved}
                              onOpen={() => openNoteDialog(line.id, 'internal')}
                            />
                          </TableCell>
                          <TableCell>
                            <Toggle
                              checked={line.billable}
                              disabled={isApproved}
                              onChange={() => updateLine(line.id, { billable: !line.billable })}
                              size='small'
                              className={cx(classes.billableSwitch, classes.billableCell)}
                            />
                          </TableCell>
                          {week.map((d) => (
                            <TableCell key={d.key} className={classes.dayColumn}>
                              <TextField
                                variant='outlined'
                                size='small'
                                type='number'
                                inputProps={{ min: 0, step: 0.5 }}
                                value={line.dayValues[d.key] ?? 0}
                                onChange={(e) =>
                                  updateDayValue(
                                    line.id,
                                    d.key,
                                    e.target.value === '' ? 0 : Number(e.target.value),
                                  )
                                }
                                disabled={isApproved}
                                className={classes.dayCellField}
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {lineTotal}
                            </Typography>
                          </TableCell>
                          <TableCell className={classes.statusCell}>
                            <Stack
                              direction='row'
                              spacing={0.75}
                              alignItems='center'
                              justifyContent='center'
                            >
                              <StatusDot
                                style={{
                                  backgroundColor: isApproved ? theme_success : theme_warning,
                                }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell className={classes.actionsCell}>
                            <Stack direction='row' spacing={0.5} alignItems='center'>
                              <IconButton
                                size='small'
                                className={classes.actionIconButton}
                                onClick={() =>
                                  notify.info(
                                    isApproved ? 'Line is approved' : 'Timesheet line deleted',
                                  )
                                }
                              >
                                {isApproved ? (
                                  <DeleteIcon sx={{ fontSize: '1rem', color: theme_success }} />
                                ) : (
                                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                                )}
                              </IconButton>
                              <IconButton
                                size='small'
                                className={classes.actionIconButton}
                                onClick={() => updateLine(line.id, { liked: !line.liked })}
                              >
                                {line.liked ? (
                                  <StarIcon sx={{ fontSize: '1rem', color: theme_success }} />
                                ) : (
                                  <StarBorderIcon sx={{ fontSize: '1rem' }} />
                                )}
                              </IconButton>
                              <IconButton
                                size='small'
                                className={classes.actionIconButton}
                                onClick={() =>
                                  updateLine(line.id, { favourited: !line.favourited })
                                }
                              >
                                <BookmarkIcon
                                  sx={{
                                    fontSize: '1rem',
                                    color: line.favourited ? theme_success : undefined,
                                  }}
                                />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* ── Totals (Total Hours always shown) ─────────── */}
                    <TableRow className={classes.totalsRow}>
                      <TableCell colSpan={7}>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          Total Hours
                        </Typography>
                      </TableCell>
                      {totals.perDay.map((d, i) => (
                        <TableCell key={week[i].key} className={classes.dayColumn}>
                          {d.all}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {totals.grand.all}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                    </TableRow>

                    {showDetailedTotals && (
                      <>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={7}>
                            <Typography variant='body2' color='text.secondary'>
                              Total billable hours
                            </Typography>
                          </TableCell>
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {d.billable}
                            </TableCell>
                          ))}
                          <TableCell>{totals.grand.billable}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={7}>
                            <Typography variant='body2' color='text.secondary'>
                              Total non-billable hours
                            </Typography>
                          </TableCell>
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {d.nonBillable}
                            </TableCell>
                          ))}
                          <TableCell>{totals.grand.nonBillable}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={7}>
                            <Typography variant='body2' color='text.secondary'>
                              Billable hours ratio
                            </Typography>
                          </TableCell>
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {d.all > 0 ? `${Math.round((d.billable / d.all) * 100)}%` : '0%'}
                            </TableCell>
                          ))}
                          <TableCell>{totals.billableRatio}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* ── Status legend ─────────────────────────────────── */}
            <Box className={classes.statusLegend}>
              {STATUS_LEGEND.map((item) => (
                <Stack
                  key={item.label}
                  direction='row'
                  spacing={0.75}
                  alignItems='center'
                  className={classes.statusLegendItem}
                >
                  <StatusDot style={{ backgroundColor: item.color }} />
                  <Typography variant='body2'>{item.label}</Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        </>
      ) : (
        /* ── Approval History tab ─────────────────────────────── */
        <Box className={classes.linesSection}>
          <TableContainer className={classes.tableContainer}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.headerCell}>Period</TableCell>
                  <TableCell className={classes.headerCell}>Status</TableCell>
                  <TableCell className={classes.headerCell}>Submitted On</TableCell>
                  <TableCell className={classes.headerCell}>Submitted By</TableCell>
                  <TableCell className={classes.headerCell}>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {APPROVAL_HISTORY.map((entry) => (
                  <TableRow key={entry.id} hover className={classes.dataRow}>
                    <TableCell>{entry.period}</TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <StatusDot
                          style={{
                            backgroundColor:
                              entry.status === 'approved' ? theme_success : theme_warning,
                          }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          {entry.status === 'approved' ? 'Approved' : 'Pending'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{entry.submittedOn}</TableCell>
                    <TableCell>{entry.submittedBy}</TableCell>
                    <TableCell>{entry.approvedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Footer actions ────────────────────────────────────── */}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='flex-end'
        className={classes.footerActions}
      >
        <Button
          variant='outlined'
          color='primary'
          label='Close'
          onClick={() => notify.info('Timesheet closed')}
        />
        <Button variant='contained' label='Save' onClick={handleSave} />
        <Button variant='contained' label='Submit' onClick={() => setSubmitModalOpen(true)} />
      </Stack>

      {/* ── Submit confirmation modal ── */}
      <Modal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title='Confirm'
        maxWidth='xs'
        footer={
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            className={classes.modalFooter}
          >
            <Button
              variant='contained'
              color='error'
              size='small'
              label='Submit'
              onClick={handleSubmit}
            />
            <Button
              variant='outlined'
              size='small'
              label='Cancel'
              onClick={() => setSubmitModalOpen(false)}
            />
          </Stack>
        }
      >
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center' }}>
          Are you sure you want to submit?
        </Typography>
      </Modal>

      {/* ── Note (external / internal) dialog — type-differentiated ── */}
      {noteDialog.open && (
        <NoteDialog
          kind={noteDialog.kind}
          draft={noteDialog.draft}
          onClose={closeNoteDialog}
          onDraftChange={(d) => setNoteDialog((prev) => ({ ...prev, draft: d }))}
          onSave={saveNoteDialog}
        />
      )}
    </Box>
  );
};

export default Timesheet;
