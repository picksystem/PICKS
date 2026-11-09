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
  StarIcon,
  IconButton,
  TextField,
  Checkbox,
  BookmarkIcon,
  CommentIcon,
  AssessmentIcon,
  Tooltip,
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
  Radio,
  RadioGroup,
  FormControlLabel,
  alpha,
  darken,
} from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
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
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '../Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { APPROVED_ESTIMATES_ACCENT } from '../Configuration/sections/General/components/ApprovedEstimates/shared/ApprovedEstimatesConfig';
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
    tooltipText: string;
    dialogTitle: string;
    dialogSubtitle: string;
    editorTitle: string;
  }
> = {
  external: {
    color: '#1d4ed8',
    emptyLabel: 'Add External comment',
    tooltipText: 'Click to add or view the External comment — the comment box will open.',
    dialogTitle: 'Add External comment',
    dialogSubtitle: 'Visible to the client — use plain, client-friendly language.',
    editorTitle: 'External Comment',
  },
  internal: {
    color: theme_warning,
    emptyLabel: 'Add Internal comment',
    tooltipText: 'Click to add or view the Internal comment — the comment box will open.',
    dialogTitle: 'Add Internal comment',
    dialogSubtitle: 'Visible to your team only — never shown to the client.',
    editorTitle: 'Internal Comment',
  },
};

/* Open = the default, in-work state until a line is saved or submitted. */
const theme_open = '#0ea5e9';

/* status -> color, used for the per-row status dot and the Status card. */
const statusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return theme_success;
    case 'rejected':
      return theme_error;
    case 'pending':
    case 'submitted':
      return theme_warning;
    case 'open':
    default:
      return theme_open;
  }
};

const STATUS_LEGEND: { label: string; color: string }[] = [
  { label: 'Open', color: theme_open },
  { label: 'Draft', color: theme_draft },
  { label: 'Pending', color: theme_warning },
  { label: 'Approved', color: theme_success },
  { label: 'Rejected', color: theme_error },
];

/* Human-readable status text (shown in the per-row status-dot tooltip) plus a
   short description of what that state means, so the dot's color is self-
   explaining on hover. */
const STATUS_LABEL: Record<string, { label: string; hint: string }> = {
  open: { label: 'Open', hint: 'In progress — the line has not been saved or submitted yet.' },
  draft: { label: 'Draft', hint: 'Saved but not yet submitted for review.' },
  pending: { label: 'Pending', hint: 'Awaiting manager review / approval.' },
  submitted: { label: 'Pending', hint: 'Submitted and waiting in the approval queue.' },
  approved: { label: 'Approved', hint: 'Approved by the manager and locked.' },
  rejected: { label: 'Rejected', hint: 'Rejected — changes requested by the approver.' },
};
const statusLabel = (status: string) => STATUS_LABEL[status] ?? STATUS_LABEL.open;

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
        {valueNode ?? <Typography className={classes.statCardValue}>{value}</Typography>}
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

/* Lines are added/removed dynamically at runtime ("New line" / "Remove
   line"), so the table starts empty. This builds a fresh blank line with
   a unique id; dayValues start empty and read as 0 (00:00) per day. */
let newLineSeq = 0;
const createNewLine = (): TimesheetLine => {
  newLineSeq += 1;
  return {
    id: `line-${Date.now()}-${newLineSeq}`,
    client: '',
    project: '',
    task: '',
    externalNote: '',
    internalNote: '',
    billable: true,
    dayValues: {},
    status: 'open',
    liked: false,
    favourited: false,
  };
};

/* ── Note dialog: mirrors the ConfigFormDialog look of the "Add Approved
   Estimate" dialog — same APPROVED_ESTIMATES_ACCENT header gradient, icon
   tile, Cancel/Save actions and md width. Icon & subtitle still differ
   per note kind (globe/external vs lock/internal). ── */
const NoteDialog = ({
  kind,
  draft,
  onClose,
  onSave,
  onDraftChange,
}: {
  kind: NoteKind;
  draft: string;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (d: string) => void;
}) => {
  const cfg = NOTE_TYPE_CONFIG[kind];
  const isEdit = draft.trim().length > 0;

  return (
    <ConfigFormDialog
      open
      onClose={onClose}
      onSubmit={onSave}
      isEdit={isEdit}
      icon={
        kind === 'external' ? (
          <PublicIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
        ) : (
          <LockIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
        )
      }
      accent={APPROVED_ESTIMATES_ACCENT}
      title={cfg.editorTitle}
      subtitle={cfg.dialogSubtitle}
      submitLabel='Save'
      maxWidth='md'
    >
      <Box sx={{ borderRadius: 1 }}>
        <RichTextEditor
          value={{ segments: parseRichText(draft).segments }}
          onChange={(value) => onDraftChange(serializeRichText(value.segments))}
          showFooterActions={false}
          title={cfg.editorTitle}
        />
      </Box>
    </ConfigFormDialog>
  );
};

/* ── Advanced notes dialog: week-level external + internal comments for the
   entire timesheet of the selected week (opened by the "Use advanced notes"
   toolbar action). These are distinct from the per-line note cells, which
   stay project/line-specific. Both fields use the same rich-text editor as
   the existing "Add External/Internal comment" fields. */
const NoteField = ({
  kind,
  value,
  onChange,
}: {
  kind: NoteKind;
  value: string;
  onChange: (v: string) => void;
}) => {
  const cfg = NOTE_TYPE_CONFIG[kind];
  return (
    <Box sx={{ borderRadius: 1 }}>
      <RichTextEditor
        value={{ segments: parseRichText(value).segments }}
        onChange={(v) => onChange(serializeRichText(v.segments))}
        showFooterActions={false}
        title={cfg.editorTitle}
        placeholder={cfg.emptyLabel}
      />
    </Box>
  );
};

const AdvancedNotesDialog = ({
  open,
  externalNote,
  internalNote,
  onClose,
  onSave,
}: {
  open: boolean;
  externalNote: string;
  internalNote: string;
  onClose: () => void;
  onSave: (external: string, internal: string) => void;
}) => {
  const [extDraft, setExtDraft] = useState(externalNote);
  const [intDraft, setIntDraft] = useState(internalNote);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(extDraft, intDraft)}
      isEdit
      icon={<StickyNote2Icon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APPROVED_ESTIMATES_ACCENT}
      title='Advanced notes'
      editTitle='Advanced notes'
      subtitle='Applies to the entire timesheet for this week — shared across all lines.'
      submitLabel='Save'
      maxWidth='md'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <NoteField kind='external' value={extDraft} onChange={setExtDraft} />
        <NoteField kind='internal' value={intDraft} onChange={setIntDraft} />
      </Box>
    </ConfigFormDialog>
  );
};

/* Renders the saved week-level advanced notes (external + internal) as a
   compact read-only strip under the toolbar, so the user can see the notes
   that apply to the whole week without reopening the dialog. */
const AdvancedNotesSummary = ({
  externalNote,
  internalNote,
}: {
  externalNote: string;
  internalNote: string;
}) => {
  const extText = notePreviewText(externalNote, 80);
  const intText = notePreviewText(internalNote, 80);
  const hasExternal = extText.length > 0;
  const hasInternal = intText.length > 0;
  if (!hasExternal && !hasInternal) return null;
  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        borderRadius: 3,
        p: 1.5,
        mb: 2,
      }}
    >
      <Typography
        variant='body2'
        sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, letterSpacing: '0.02em' }}
      >
        Advanced notes for this week
      </Typography>
      <Stack spacing={0.5}>
        {hasExternal && (
          <Stack direction='row' spacing={1} alignItems='flex-start'>
            <Box sx={{ flexShrink: 0, mt: 0.25 }}>
              <PublicIcon sx={{ fontSize: '0.95rem', color: NOTE_TYPE_CONFIG.external.color }} />
            </Box>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {extText}
            </Typography>
          </Stack>
        )}
        {hasInternal && (
          <Stack direction='row' spacing={1} alignItems='flex-start'>
            <Box sx={{ flexShrink: 0, mt: 0.25 }}>
              <LockIcon sx={{ fontSize: '0.95rem', color: NOTE_TYPE_CONFIG.internal.color }} />
            </Box>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {intText}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

/* ── Attachments dialog: mirrors the TicketDetail AttachmentModal pattern
   (existing list + dashed "Choose file" dropzone + pending files + footer),
   scoped to the in-memory timesheet lines. File names are what is stored, so
   this is a UI prototype — no network upload. */
const ATTACHMENT_ACCENT = '#0369a1';

const TimesheetAttachmentDialog = ({
  open,
  targetCount,
  existing,
  onClose,
  onAttach,
  onRemove,
}: {
  open: boolean;
  targetCount: number;
  existing: string[];
  onClose: () => void;
  onAttach: (names: string[]) => void;
  onRemove: (name: string) => void;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    event.target.value = '';
  };

  const handleAttach = () => {
    if (selectedFiles.length === 0) return;
    onAttach(selectedFiles.map((f) => f.name));
    setSelectedFiles([]);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  const existingCount = existing.length;

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}
            >
              Attachments
            </Typography>
            <Typography
              sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}
            >
              {targetCount > 1
                ? `Manage attachments for ${targetCount} selected lines`
                : 'Manage attachments for this line'}
            </Typography>
          </Box>
        </Box>
      }
      headerTextColor='#fff'
      headerBackground={`linear-gradient(135deg, ${darken(ATTACHMENT_ACCENT, 0.18)} 0%, ${ATTACHMENT_ACCENT} 100%)`}
      maxWidth='sm'
      footer={
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            onClick={handleCancel}
            variant='outlined'
            size='small'
            label='Cancel'
            sx={{
              textTransform: 'none',
              borderColor: alpha(ATTACHMENT_ACCENT, 0.4),
              color: darken(ATTACHMENT_ACCENT, 0.15),
              '&:hover': {
                borderColor: ATTACHMENT_ACCENT,
                bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
              },
            }}
          />
          <Button
            onClick={handleAttach}
            disabled={selectedFiles.length === 0}
            variant='contained'
            size='small'
            label='Attach'
            sx={{
              textTransform: 'none',
              bgcolor: ATTACHMENT_ACCENT,
              '&:hover': { bgcolor: darken(ATTACHMENT_ACCENT, 0.15) },
              '&.Mui-disabled': { bgcolor: alpha(ATTACHMENT_ACCENT, 0.4) },
            }}
          />
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px', p: 1 }}>
        {existingCount > 0 && (
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600, color: '#374151' }}>
              Existing Attachments ({existingCount})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {existing.map((name) => (
                <Box
                  key={name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(226, 232, 255, 0.9)',
                    background: '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      background: '#f8faff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '8px',
                      background: '#eef2ff',
                      border: '1px solid rgba(99,102,241,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                  </Box>
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={name}
                  >
                    {name}
                  </Typography>
                  <Tooltip title='Remove attachment' arrow placement='top'>
                    <IconButton
                      size='small'
                      onClick={() => onRemove(name)}
                      sx={{
                        width: 34,
                        height: 34,
                        color: '#dc2626',
                        flexShrink: 0,
                        '&:hover': { background: '#fef2f2', borderRadius: '8px' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600, color: '#374151' }}>
            Add New Attachments
          </Typography>
          <Box
            onClick={() =>
              document.querySelector<HTMLInputElement>('.timesheet-attachment-input')?.click()
            }
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 1,
              p: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              bgcolor: alpha(ATTACHMENT_ACCENT, 0.02),
              '&:hover': {
                borderColor: ATTACHMENT_ACCENT,
                bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
              },
            }}
          >
            <input
              type='file'
              className='timesheet-attachment-input'
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Box sx={{ mb: 0.75 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
            </Box>
            <Button
              variant='contained'
              size='small'
              label='Choose file'
              sx={{
                bgcolor: ATTACHMENT_ACCENT,
                '&:hover': { bgcolor: darken(ATTACHMENT_ACCENT, 0.15) },
                textTransform: 'none',
                px: 3,
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />
          </Box>
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              Attached Files ({selectedFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {selectedFiles.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                    border: '1px solid #e5e7eb',
                    bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <CloudUploadOutlinedIcon
                      sx={{ fontSize: '1.1rem', color: ATTACHMENT_ACCENT }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      p: 0.5,
                      borderRadius: 1,
                      color: '#dc2626',
                      '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

/* Collapses a serialized rich-text note to a short single-line preview
   (first line, markers stripped), so a filled note cell shows at least
   some of its content instead of a generic label. */
const notePreviewText = (note: string, maxLen = 32): string => {
  const text = parseRichText(note).segments[0]?.text?.trim() ?? '';
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
};

/* ── Note cell button: same layout, clearly different per type ── */
const NoteCellButton = ({
  kind,
  note,
  disabled,
  onOpen,
}: {
  kind: NoteKind;
  note: string;
  disabled?: boolean;
  onOpen: () => void;
}) => {
  const cfg = NOTE_TYPE_CONFIG[kind];
  const preview = notePreviewText(note);
  /* Rendered as a real (read-only) TextField so the note fields are
     pixel-identical to the Client / Project / Task search fields:
     same height, width, border and radius. Clicking opens the note
     dialog instead of typing. Empty lines show the "Add … comment"
     placeholder; filled lines preview their first content line.
     A tooltip on hover explains that clicking opens the comment box. */
  return (
    <Tooltip
      title={disabled ? 'This line is approved and cannot be edited' : cfg.tooltipText}
      placement='top'
    >
      <Box onClick={onOpen}>
        <TextField
          size='small'
          variant='outlined'
          fullWidth
          value={preview}
          placeholder={cfg.emptyLabel}
          icon={<EditIcon sx={{ fontSize: '1rem', color: disabled ? undefined : '#616161' }} />}
          iconAlignment='right'
          inputProps={{ readOnly: true }}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-input': {
              cursor: disabled ? 'not-allowed' : 'pointer',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

/* Renders a decimal hour count the way the day columns display it, e.g.
   8 -> "08:00", 0 -> "00:00", 1.5 -> "01:30". Used by the day inputs and
   the per-day / grand totals so every hour figure on the page reads the
   same. */
const formatDayHours = (hours: number): string => {
  const safe = Number.isFinite(hours) && hours > 0 ? hours : 0;
  const h = Math.floor(safe);
  const m = Math.round((safe - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/* A day-cell input that keeps the underlying value as decimal hours but
   displays it as HH:MM ("00:00" by default). Clicking the field shows the
   formatted time (selected, ready to type over); the value only changes
   once the user actually types — they may enter decimal hours ("8.5") or
   a time ("08:30") — and it snaps back to HH:MM on blur. */
const DayCellField = ({
  value,
  onChange,
  disabled,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const handleChange = (raw: string) => {
    setEditing(true);
    setDraft(raw);
    let next: number;
    if (raw.includes(':')) {
      const [h, m] = raw.split(':');
      next = Number(h) + Number(m || 0) / 60;
    } else {
      const cleaned = raw.replace(/[^0-9.]/g, '');
      next = cleaned === '' ? 0 : Number(cleaned);
    }
    onChange(Number.isFinite(next) ? next : 0);
  };

  return (
    <TextField
      variant='outlined'
      size='small'
      /* while focused and untouched the field still shows the HH:MM form;
         only a keystroke switches it to the raw editable text */
      value={editing ? draft : formatDayHours(value)}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={(e) => {
        setEditing(false);
        /* select the displayed HH:MM so typing immediately replaces it */
        e.target.select();
      }}
      onBlur={() => setEditing(false)}
      disabled={disabled}
      className={className}
    />
  );
};

/* Wraps a table checkbox so it is centered in the cell both horizontally
   and vertically. MUI's checkbox carries its own left padding and
   height: 100% is not reliable inside table cells, so the wrapper is
   absolutely positioned over the whole cell content area (the cell is
   position: relative, see selectCell) — deterministic centering
   regardless of row height. */
const CenteredCheckbox = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => <Box className={className}>{children}</Box>;

const Timesheet = () => {
  const { classes, cx } = useStyles();
  const notify = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => buildWeek(weekOffset), [weekOffset]);

  /* Tab 2 (My Allocation) is not built yet — keep the tab but surface a
     placeholder panel instead of a dead button, as in the reference UI */
  const handleTabChange = (_: unknown, value: number) => {
    setActiveTab(value);
  };

  /* start with a single blank line; more are added via the "New line"
     toolbar action and removed via the row checkboxes + "Remove line" */
  const [lines, setLines] = useState<TimesheetLine[]>(() => [createNewLine()]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  /* Pending line deletion awaiting the confirmation dialog: the label is
     shown in the dialog body and the action runs only after "Delete" */
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    label: string;
    action: () => void;
  }>({ open: false, label: '', action: () => {} });
  const [showDetailedTotals, setShowDetailedTotals] = useState(true);
  const [selectedLineIds, setSelectedLineIds] = useState<Record<string, boolean>>({});

  // ── Note dialog state ──────────────────────────────────────────
  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    lineId: string;
    kind: NoteKind;
    draft: string;
  }>({ open: false, lineId: '', kind: 'external', draft: '' });

  /* "Use advanced notes": week-level external + internal comments that apply
     to the entire timesheet of the selected week (not per line). The dialog
     is opened by the toolbar action; the saved values are shown in a compact
     strip under the toolbar and reused each time the dialog opens. */
  const [advancedNotesOpen, setAdvancedNotesOpen] = useState(false);
  const [weekExternalNote, setWeekExternalNote] = useState('');
  const [weekInternalNote, setWeekInternalNote] = useState('');

  /* "Edit" (toolbar) opens a selection dialog to target the affected line(s) */
  const [editSelectionOpen, setEditSelectionOpen] = useState(false);

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

  const closeNoteDialog = () => {
    setNoteDialog((prev) => ({ ...prev, open: false, lineId: '', draft: '' }));
    /* MUI Modal restores focus to the element that was focused before the
       dialog opened — the note cell's read-only input — leaving it visibly
       focused after save/cancel. Drop focus back to body on the next frame
       (after MUI has finished its restore) so the field doesn't keep a
       focus ring. */
    requestAnimationFrame(() => {
      const el = document.activeElement as HTMLElement | null;
      el?.blur();
    });
  };

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

  /* "New line": append a blank line to the table */
  const handleAddLine = () => {
    setLines((prev) => [...prev, createNewLine()]);
  };

  /* ── Line deletion: nothing is actually removed until the user confirms
       in the delete-confirmation dialog. Each handler only opens it,
       passing the action that will run on "Delete". */
  const askToDelete = (label: string, action: () => void) => {
    setDeleteConfirm({ open: true, label, action });
  };
  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, label: '', action: () => {} });
    /* MUI Modal restores focus to the trigger; drop it back to body so the
       row / toolbar button does not keep a visible focus ring */
    requestAnimationFrame(() => {
      const el = document.activeElement as HTMLElement | null;
      el?.blur();
    });
  };
  const confirmDelete = () => {
    deleteConfirm.action();
    closeDeleteConfirm();
  };

  /* "Remove line": delete every line whose checkbox is ticked (or, when
     nothing is selected, the single line) */
  const handleRemoveSelectedLines = () => {
    const selected = lines.filter((l) => selectedLineIds[l.id]).map((l) => l.id);
    const count = selected.length > 0 ? selected.length : lines.length;
    askToDelete(count > 1 ? `${count} timesheet lines` : 'this timesheet line', () => {
      const idsToRemove = selected.length > 0 ? selected : lines.map((l) => l.id);
      setLines((prev) => prev.filter((line) => !idsToRemove.includes(line.id)));
      setSelectedLineIds({});
      notify.success(count > 1 ? `${count} timesheet lines removed` : 'Timesheet line removed');
    });
  };

  /* per-row trash button: delete just that line */
  const handleDeleteLine = (id: string) => {
    askToDelete('this timesheet line', () => {
      setLines((prev) => prev.filter((line) => line.id !== id));
      setSelectedLineIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      notify.success('Timesheet line removed');
    });
  };

  /* per-row duplicate button: clone the line (client / project / task /
     notes / billable / day hours) into a fresh open line inserted directly
     below the original. */
  const handleDuplicateLine = (id: string) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const src = prev[idx];
      newLineSeq += 1;
      const copy: TimesheetLine = {
        ...src,
        id: `line-${Date.now()}-${newLineSeq}`,
        status: 'open',
        dayValues: { ...src.dayValues },
        liked: false,
        favourited: false,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    notify.success('Line duplicated');
  };

  /* ── Toolbar actions, wired to the table state ────────────── */

  const selectedCount = lines.filter((l) => selectedLineIds[l.id]).length;

  /* "Edit" picks a target scope, then selects that line's checkbox so the
     table row below is the active edit target (editing is inline in the grid). */
  const [editTarget, setEditTarget] = useState<string>(selectedCount > 0 ? 'selected' : 'all');
  const handleEdit = () => setEditSelectionOpen(true);
  const confirmEditSelection = () => {
    const target = editTarget === 'all' ? lines : lines.filter((l) => selectedLineIds[l.id]);
    const ids = target.length > 0 ? target.map((l) => l.id) : lines.map((l) => l.id);
    setSelectedLineIds(Object.fromEntries(ids.map((id) => [id, true])));
    setEditSelectionOpen(false);
    notify.info(`${ids.length} line${ids.length > 1 ? 's' : ''} selected for editing`);
  };

  /* "Copy from favourite": clone the first favourited line into a fresh open
     line. Without a favourite there is nothing to copy. */
  const handleCopyFromFavourite = () => {
    const src = lines.find((l) => l.favourited);
    if (!src) {
      notify.info('No favourite lines yet — mark a line as favourite first');
      return;
    }
    newLineSeq += 1;
    const copy: TimesheetLine = {
      ...src,
      id: `line-${Date.now()}-${newLineSeq}`,
      status: 'open',
      dayValues: { ...src.dayValues },
      liked: false,
      favourited: false,
    };
    setLines((prev) => [...prev, copy]);
    notify.success(`New line copied from favourite${src.client ? `: ${src.client}` : ''}`);
  };

  /* "Add to favourites": mark the selected lines (or all, when nothing is
     selected) as favourites so they can be quickly copied / managed later. */
  const handleAddToFavourites = () => {
    const targets = selectedCount > 0 ? lines.filter((l) => selectedLineIds[l.id]) : lines;
    if (targets.length === 0) {
      notify.info('No lines to favourite yet');
      return;
    }
    const ids = new Set(targets.map((l) => l.id));
    setLines((prev) => prev.map((l) => (ids.has(l.id) ? { ...l, favourited: true } : l)));
    notify.success(`${targets.length} line${targets.length > 1 ? 's' : ''} added to favourites`);
  };

  /* "Copy to a timesheet": duplicate the selected lines (or all when nothing
     is selected) into new open lines — the realistic in-page equivalent of
     copying these lines onto another sheet. */
  const handleCopyToTimesheet = () => {
    const sources = selectedCount > 0 ? lines.filter((l) => selectedLineIds[l.id]) : lines;
    if (sources.length === 0) {
      notify.info('Nothing to copy yet');
      return;
    }
    setLines((prev) => {
      const copies = sources.map((src, i) => {
        newLineSeq += 1;
        return {
          ...src,
          id: `line-${Date.now()}-${newLineSeq}-${i}`,
          status: 'open' as const,
          dayValues: { ...src.dayValues },
          liked: false,
          favourited: false,
        };
      });
      return [...prev, ...copies];
    });
    notify.success(
      `${sources.length} line${sources.length > 1 ? 's' : ''} copied to a new timesheet`,
    );
  };

  /* "Add attachment" opens the Attachments dialog (see
     TimesheetAttachmentDialog below) scoped to the target lines: the selected
     lines, or every line when nothing is selected. The per-row paperclip can
     open it scoped to a single line via openAttachmentDialog([line.id]). */
  const [attachmentDialog, setAttachmentDialog] = useState<{
    open: boolean;
    targetLineIds: string[];
  }>({ open: false, targetLineIds: [] });

  const openAttachmentDialog = (lineIds?: string[]) => {
    const ids =
      lineIds && lineIds.length > 0
        ? lineIds
        : selectedCount > 0
          ? lines.filter((l) => selectedLineIds[l.id]).map((l) => l.id)
          : lines.map((l) => l.id);
    setAttachmentDialog({ open: true, targetLineIds: ids });
  };
  const closeAttachmentDialog = () => setAttachmentDialog({ open: false, targetLineIds: [] });

  /* Attach the chosen file names to every target line (shown per-row via the
     paperclip indicator). Runs from the dialog's "Attach" action. */
  const attachFilesToLines = (names: string[]) => {
    const idSet = new Set(attachmentDialog.targetLineIds);
    setLines((prev) =>
      prev.map((l) =>
        idSet.has(l.id)
          ? { ...l, attachments: Array.from(new Set([...(l.attachments ?? []), ...names])) }
          : l,
      ),
    );
    notify.success(
      `${names.length} attachment${names.length > 1 ? 's' : ''} added to ${idSet.size} line${
        idSet.size > 1 ? 's' : ''
      }`,
    );
  };

  /* Remove an existing attachment name from every target line. */
  const removeAttachmentFromLines = (name: string) => {
    const idSet = new Set(attachmentDialog.targetLineIds);
    setLines((prev) =>
      prev.map((l) =>
        idSet.has(l.id)
          ? { ...l, attachments: (l.attachments ?? []).filter((n) => n !== name) }
          : l,
      ),
    );
    notify.success(`Removed attachment "${name}"`);
  };

  /* "Manage favourites": a small dialog listing favourited lines, where the
     user can unfavourite or remove them. */
  const [favouritesOpen, setFavouritesOpen] = useState(false);
  const favouritedLines = lines.filter((l) => l.favourited);
  const handleManageFavourites = () => setFavouritesOpen(true);
  const handleUnfavourite = (id: string) => updateLine(id, { favourited: false });
  const handleDeleteFavourite = (id: string) => handleDeleteLine(id);

  /* "Use advanced notes": save the week-level external + internal comments.
     These describe the whole week's timesheet and are independent of the
     per-line (project-specific) note cells. */
  const handleSaveAdvancedNotes = (external: string, internal: string) => {
    setWeekExternalNote(external);
    setWeekInternalNote(internal);
    setAdvancedNotesOpen(false);
    const anySaved = external.trim().length > 0 || internal.trim().length > 0;
    notify.success(
      anySaved ? 'Advanced notes saved for this week' : 'Advanced notes cleared for this week',
    );
  };
  const hasAdvancedNotes = weekExternalNote.trim().length > 0 || weekInternalNote.trim().length > 0;

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
          case 'open':
            acc.open += 1;
            break;
          default:
            acc.draft += 1;
        }
        return acc;
      },
      { open: 0, draft: 0, pending: 0, approved: 0, rejected: 0 },
    );

    return { perDay, grand, billableRatio, statusCounts };
  }, [lines, week]);

  /* Overall status for the KPI "Status" card:
     Open     → default, work-in-progress state until the sheet is saved or
                submitted (fresh / unsaved lines)
     Approved → only when EVERY line is approved
     Pending  → any line awaiting review (pending / submitted) */
  const overallStatus = useMemo(() => {
    if (lines.length === 0) return 'Open';
    if (lines.every((l) => l.status === 'approved')) return 'Approved';
    if (lines.some((l) => l.status === 'pending' || l.status === 'submitted')) return 'Pending';
    return 'Open';
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

  /* Save moves the sheet from Open to Pending (saved, awaiting review). */
  const handleSave = () => {
    setLines((prev) => prev.map((l) => (l.status === 'open' ? { ...l, status: 'pending' } : l)));
    notify.success('Timesheet saved');
  };

  /* Submit moves the sheet to Submitted (in the approval queue). */
  const handleSubmit = () => {
    setSubmitModalOpen(false);
    setLines((prev) => prev.map((l) => ({ ...l, status: 'submitted' })));
    notify.success('Timesheet submitted for approval');
  };

  const toolbarActions = [
    {
      label: 'New line',
      icon: AddIcon,
      color: '#1976d2',
      onClick: handleAddLine,
    },
    {
      label: 'Edit',
      icon: EditIcon,
      color: '#1d4ed8',
      onClick: handleEdit,
    },
    {
      label: 'Remove line',
      icon: DeleteIcon,
      color: '#dc2626',
      onClick: handleRemoveSelectedLines,
    },
    {
      label: 'Copy from favourite',
      icon: StarIcon,
      color: '#7c3aed',
      onClick: handleCopyFromFavourite,
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
      onClick: handleAddToFavourites,
    },
    {
      label: 'Copy to a timesheet',
      icon: LinkIcon,
      color: '#059669',
      onClick: handleCopyToTimesheet,
    },
    {
      label: 'Add attachment',
      icon: AttachFileIcon,
      color: '#92400e',
      onClick: () => openAttachmentDialog(),
    },
    {
      label: 'Use advanced notes',
      icon: CommentIcon,
      color: '#0d9488',
      onClick: () => setAdvancedNotesOpen(true),
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
      onClick: handleManageFavourites,
    },
  ];

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Timesheet'
        description='Log your hours per task for the selected week.'
        className={classes.pageHeader}
      />

      {/* ── Row 1: tabs (left) + actions (right) ─────────────── */}
      <Box className={classes.topBar}>
        <Tabs value={activeTab} onChange={handleTabChange} className={classes.tabsBar}>
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

      {/* ── Row 2: full-width period band (Timesheet tab only) ── */}
      {activeTab === 0 && (
        <Stack
          direction='row'
          spacing={1}
          alignItems='center'
          justifyContent='center'
          className={classes.periodPill}
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
      )}

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
              tone={
                overallStatus === 'Approved'
                  ? 'green'
                  : overallStatus === 'Pending'
                    ? 'amber'
                    : 'cyan' /* Open */
              }
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

          {/* ── Week-level advanced notes (view of the saved dialog values) ── */}
          {hasAdvancedNotes && (
            <AdvancedNotesSummary externalNote={weekExternalNote} internalNote={weekInternalNote} />
          )}

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
                {/* table-layout: fixed at 100% of the container: the column
                    percentages in Timesheet.styles.shared.ts always sum to
                    100%, so the grid fits its parent at any screen size —
                    no horizontal scroll. Field text truncates inside the
                    inputs instead of stretching the table. */}
                <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell className={cx(classes.headerCell, classes.selectCell)}>
                        <CenteredCheckbox className={classes.selectCheckboxBox}>
                          <Checkbox
                            checked={allLinesSelected}
                            indeterminate={someLinesSelected && !allLinesSelected}
                            onChange={toggleSelectAll}
                            size='small'
                            className={classes.checkbox}
                          />
                        </CenteredCheckbox>
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.clientCell)}>
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
                      <TableCell className={cx(classes.headerCell, classes.billableColumn)}>
                        Billable
                      </TableCell>
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
                      <TableCell className={cx(classes.headerCell, classes.totalHoursCell)}>
                        Total Hours
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.statusCell)}>
                        Status
                      </TableCell>
                      <TableCell className={cx(classes.headerCell, classes.actionsCell)}>
                        Line actions
                      </TableCell>
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
                            <CenteredCheckbox className={classes.selectCheckboxBox}>
                              <Checkbox
                                checked={!!selectedLineIds[line.id]}
                                onChange={() => toggleSelectLine(line.id)}
                                size='small'
                                className={classes.checkbox}
                              />
                            </CenteredCheckbox>
                          </TableCell>
                          <TableCell className={cx(classes.clientCell, classes.cellField)}>
                            <ClientSearchField
                              value={line.client}
                              onChange={(client) => updateLine(line.id, { client })}
                              disabled={isApproved}
                            />
                          </TableCell>
                          <TableCell className={cx(classes.cellSelect, classes.cellField)}>
                            <ProjectSearchField
                              value={line.project ?? ''}
                              onChange={(project) => updateLine(line.id, { project })}
                              disabled={isApproved}
                            />
                          </TableCell>
                          <TableCell className={cx(classes.cellSelect, classes.cellField)}>
                            <OptionsSearchField
                              label='Task'
                              value={line.task}
                              options={TASK_OPTIONS}
                              onChange={(task) => updateLine(line.id, { task })}
                              disabled={isApproved}
                            />
                          </TableCell>
                          <TableCell className={cx(classes.noteCell, classes.cellField)}>
                            <NoteCellButton
                              kind='external'
                              note={line.externalNote}
                              disabled={isApproved}
                              onOpen={() => openNoteDialog(line.id, 'external')}
                            />
                          </TableCell>
                          <TableCell className={cx(classes.noteCell, classes.cellField)}>
                            <NoteCellButton
                              kind='internal'
                              note={line.internalNote}
                              disabled={isApproved}
                              onOpen={() => openNoteDialog(line.id, 'internal')}
                            />
                          </TableCell>
                          <TableCell className={classes.billableColumn}>
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
                              <DayCellField
                                value={line.dayValues[d.key] ?? 0}
                                onChange={(v) => updateDayValue(line.id, d.key, v)}
                                disabled={isApproved}
                                className={classes.dayCellField}
                              />
                            </TableCell>
                          ))}
                          <TableCell className={classes.totalHoursCell}>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {formatDayHours(lineTotal)}
                            </Typography>
                          </TableCell>
                          <TableCell className={classes.statusCell}>
                            <Stack
                              direction='row'
                              spacing={0.75}
                              alignItems='center'
                              justifyContent='center'
                              sx={{ width: '100%' }}
                            >
                              <Tooltip title={statusLabel(line.status).label}>
                                <Box sx={{ cursor: 'pointer', display: 'inline-flex' }}>
                                  <StatusDot
                                    style={{
                                      backgroundColor: statusColor(line.status),
                                    }}
                                  />
                                </Box>
                              </Tooltip>
                              {(line.attachments?.length ?? 0) > 0 && (
                                <Tooltip
                                  title={`${line.attachments!.length} attachment${
                                    line.attachments!.length > 1 ? 's' : ''
                                  }`}
                                  arrow
                                >
                                  <Box
                                    sx={{ cursor: 'pointer', display: 'inline-flex' }}
                                    onClick={() => openAttachmentDialog([line.id])}
                                  >
                                    <AttachFileIcon
                                      sx={{ fontSize: '0.95rem', color: theme_warning }}
                                    />
                                  </Box>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell className={classes.actionsCell}>
                            <Stack
                              direction='row'
                              spacing={0.5}
                              alignItems='center'
                              justifyContent='center'
                              sx={{ width: '100%' }}
                            >
                              {/* Duplicate: clone this line into a new open line
                                  inserted directly below it. */}
                              <Tooltip title='Duplicate this line — copies client, project, task, notes and hours into a new line below'>
                                <IconButton
                                  size='small'
                                  className={classes.actionIconButton}
                                  onClick={() => handleDuplicateLine(line.id)}
                                >
                                  <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>

                              {/* Favourite: mark this line for quick copy /
                                  manage later (used by the toolbar favourite
                                  actions). */}
                              <Tooltip
                                title={
                                  line.favourited
                                    ? 'Remove this line from favourites'
                                    : 'Add this line to favourites'
                                }
                              >
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
                              </Tooltip>

                              {/* Delete: remove just this line. Approved lines
                                  are locked, and the last remaining line is
                                  protected so the table can never be emptied
                                  via the row trash button. */}
                              <Tooltip
                                title={
                                  isApproved
                                    ? 'This line is approved and cannot be removed'
                                    : lines.length <= 1
                                      ? 'Keep at least one timesheet line'
                                      : 'Remove this line'
                                }
                              >
                                <IconButton
                                  size='small'
                                  className={classes.actionIconButton}
                                  disabled={isApproved || lines.length <= 1}
                                  onClick={() => handleDeleteLine(line.id)}
                                >
                                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* ── Totals (Total Hours always shown) ─────────── */}
                    <TableRow className={classes.totalsRow}>
                      {/* label spans through the Internal Note column with the
                          text right-aligned under it; the empty Billable cell +
                          7 day figures keep those aligned under Mon–Sun */}
                      <TableCell colSpan={6} className={classes.totalsLabelCell}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1.5 }}>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            Total Hours
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell />
                      {totals.perDay.map((d, i) => (
                        <TableCell key={week[i].key} className={classes.dayColumn}>
                          {formatDayHours(d.all)}
                        </TableCell>
                      ))}
                      <TableCell className={classes.totalHoursCell}>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {formatDayHours(totals.grand.all)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                    </TableRow>

                    {showDetailedTotals && (
                      <>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={6} className={classes.totalsLabelCell}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1.5 }}>
                              <Typography variant='body2' color='text.secondary'>
                                Total billable hours
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell />
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {formatDayHours(d.billable)}
                            </TableCell>
                          ))}
                          <TableCell className={classes.totalHoursCell}>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {formatDayHours(totals.grand.billable)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={6} className={classes.totalsLabelCell}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1.5 }}>
                              <Typography variant='body2' color='text.secondary'>
                                Total non-billable hours
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell />
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {formatDayHours(d.nonBillable)}
                            </TableCell>
                          ))}
                          <TableCell className={classes.totalHoursCell}>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {formatDayHours(totals.grand.nonBillable)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                        <TableRow className={classes.totalsRow}>
                          <TableCell colSpan={6} className={classes.totalsLabelCell}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1.5 }}>
                              <Typography variant='body2' color='text.secondary'>
                                Billable hours ratio
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell />
                          {totals.perDay.map((d, i) => (
                            <TableCell key={week[i].key} className={classes.dayColumn}>
                              {d.all > 0 ? `${Math.round((d.billable / d.all) * 100)}%` : '0%'}
                            </TableCell>
                          ))}
                          <TableCell className={classes.totalHoursCell}>
                            {totals.billableRatio}
                          </TableCell>
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
      ) : activeTab === 1 ? (
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
      ) : (
        /* ── My Allocation tab (placeholder for now) ─────────── */
        <Box className={classes.linesSection}>
          <Box className={classes.emptyState}>
            <Typography variant='body1' color='text.secondary'>
              My Allocation coming soon.
            </Typography>
          </Box>
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

      {/* ── Delete-confirmation modal (per-row trash / Remove line) ── */}
      {/* shared delete-confirmation dialog, matching the Configuration
          admin-controls / table delete pattern (@serviceops/configdialogs) */}
      <ConfigDeleteDialog
        open={deleteConfirm.open}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        entityName='Timesheet line'
        itemName={deleteConfirm.label}
        message={
          <>
            Are you sure you want to delete {deleteConfirm.label}? It will be removed from the
            current week&rsquo;s timesheet.
          </>
        }
      />

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

      {/* ── Advanced notes dialog: week-level external + internal comments ── */}
      {advancedNotesOpen && (
        <AdvancedNotesDialog
          open={advancedNotesOpen}
          externalNote={weekExternalNote}
          internalNote={weekInternalNote}
          onClose={() => setAdvancedNotesOpen(false)}
          onSave={handleSaveAdvancedNotes}
        />
      )}

      {/* ── Attachments dialog (toolbar "Add attachment" / per-row paperclip) ── */}
      <TimesheetAttachmentDialog
        open={attachmentDialog.open}
        targetCount={attachmentDialog.targetLineIds.length}
        existing={Array.from(
          new Set(
            lines
              .filter((l) => attachmentDialog.targetLineIds.includes(l.id))
              .flatMap((l) => l.attachments ?? []),
          ),
        )}
        onClose={closeAttachmentDialog}
        onAttach={attachFilesToLines}
        onRemove={removeAttachmentFromLines}
      />

      {/* ── Edit target selection (toolbar "Edit") ── */}
      <Modal
        open={editSelectionOpen}
        onClose={() => setEditSelectionOpen(false)}
        title='Edit timesheet'
        headerBackground='linear-gradient(135deg, #1d4ed822 0%, #1d4ed844 100%)'
        headerTextColor='#1d4ed8'
        maxWidth='xs'
        footer={
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            className={classes.modalFooter}
          >
            <Button
              variant='outlined'
              size='small'
              label='Cancel'
              onClick={() => setEditSelectionOpen(false)}
            />
            <Button
              variant='contained'
              size='small'
              label='Select lines'
              onClick={confirmEditSelection}
              sx={{ bgcolor: '#1d4ed8', '&:hover': { bgcolor: '#1d4ed8dd' } }}
            />
          </Stack>
        }
      >
        <Box sx={{ p: 1 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Editing is done inline in the table. Pick which lines to target:
          </Typography>
          <RadioGroup value={editTarget} onChange={(e) => setEditTarget(e.target.value)}>
            <FormControlLabel
              value='all'
              control={<Radio size='small' color='primary' />}
              label={<Typography variant='body2'>All lines ({lines.length})</Typography>}
            />
            <FormControlLabel
              value='selected'
              control={<Radio size='small' color='primary' />}
              label={<Typography variant='body2'>Only selected lines ({selectedCount})</Typography>}
            />
          </RadioGroup>
        </Box>
      </Modal>

      {/* ── Manage favourites (toolbar "Manage favourites") ── */}
      <Modal
        open={favouritesOpen}
        onClose={() => setFavouritesOpen(false)}
        title='Manage favourites'
        headerBackground='linear-gradient(135deg, #d9770622 0%, #d9770644 100%)'
        headerTextColor='#d97706'
        maxWidth='sm'
        footer={
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            className={classes.modalFooter}
          >
            <Button
              variant='outlined'
              size='small'
              label='Close'
              onClick={() => setFavouritesOpen(false)}
            />
          </Stack>
        }
      >
        <Box sx={{ p: 1 }}>
          {favouritedLines.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 3 }}>
              No favourite lines yet. Use &ldquo;Add to favourites&rdquo; to pin a line.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {favouritedLines.map((line) => {
                const label =
                  [line.client, line.project, line.task].filter(Boolean).join(' · ') ||
                  'Untitled line';
                return (
                  <Box
                    key={line.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      border: '1px solid #fde68a',
                      borderRadius: 1.5,
                      backgroundColor: '#fffbeb',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <BookmarkIcon
                        sx={{ fontSize: '1rem', color: theme_success, flexShrink: 0 }}
                      />
                      <Typography
                        variant='body2'
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {label}
                      </Typography>
                    </Box>
                    <Stack direction='row' spacing={0.5}>
                      <Button
                        variant='outlined'
                        size='small'
                        label='Unfavourite'
                        onClick={() => handleUnfavourite(line.id)}
                      />
                      <Button
                        variant='outlined'
                        size='small'
                        color='error'
                        label='Remove'
                        onClick={() => handleDeleteFavourite(line.id)}
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Timesheet;
