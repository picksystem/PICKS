import { Box, Typography, IconButton, Tooltip } from '../../../components';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import {
  APPROVALS_ACCENT,
  type TimesheetDetail,
  type TimesheetViewLine,
} from './timesheetApprovals.config';

interface TimesheetViewDialogProps {
  open: boolean;
  onClose: () => void;
  detail: TimesheetDetail | null;
}

const formatHours = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');

const lineTotal = (line: TimesheetViewLine) =>
  Object.values(line.dayValues).reduce((sum, v) => sum + (v || 0), 0);

/* Pastel KPI cards — same language as the Timesheet page's stat cards. */
const STAT_TONES = {
  green: { bg: '#d1fae5', color: '#059669' },
  amber: { bg: '#fef3c7', color: '#d97706' },
  cyan: { bg: '#e0f2fe', color: '#0284c7' },
  teal: { bg: '#ccfbf1', color: '#0d9488' },
  indigo: { bg: '#e0e7ff', color: '#4f46e5' },
  purple: { bg: '#ede9fe', color: '#7c3aed' },
} as const;

const StatBox = ({
  tone,
  value,
  label,
}: {
  tone: keyof typeof STAT_TONES;
  value: string;
  label: string;
}) => (
  <Box
    sx={{
      flex: '1 1 90px',
      backgroundColor: STAT_TONES[tone].bg,
      borderRadius: 1.5,
      p: 1,
      textAlign: 'center',
      minWidth: 80,
    }}
  >
    <Typography
      variant='subtitle1'
      sx={{ fontWeight: 700, color: STAT_TONES[tone].color, lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
      {label}
    </Typography>
  </Box>
);

/* Pastel note card — the Timesheet page colours its external (blue,
   client-visible) and internal (amber, team-only) notes, so each card
   carries a soft tinted background with a coloured title. */
const NOTE_TONES = {
  external: { bg: '#eff6ff', border: '#bfdbfe', title: '#1d4ed8' },
  internal: { bg: '#fffbeb', border: '#fde68a', title: '#b45309' },
} as const;

const NoteCard = ({ tone, value }: { tone: keyof typeof NOTE_TONES; value: string }) => (
  <Box
    sx={{
      flex: '1 1 260px',
      minWidth: 240,
      backgroundColor: NOTE_TONES[tone].bg,
      border: `1px solid ${NOTE_TONES[tone].border}`,
      borderRadius: 1.5,
      p: 1.5,
    }}
  >
    <Typography
      variant='body2'
      sx={{ fontWeight: 700, fontSize: '0.72rem', color: NOTE_TONES[tone].title, mb: 0.5 }}
    >
      {tone === 'external' ? 'External Note' : 'Internal Note'}
    </Typography>
    <Typography variant='body2' sx={{ color: 'text.primary', lineHeight: 1.5 }}>
      {value}
    </Typography>
  </Box>
);

/**
 * Read-only view of a submitted timesheet, opened from the eye icon in the
 * Timesheet Approval table. Mirrors the Timesheet submit page so a manager
 * has everything needed to decide: the stat cards (status, totals, billable
 * ratio, holidays/leaves), the day-by-day line grid with per-day totals,
 * the week notes, and approve/reject actions.
 */
const TimesheetViewDialog = ({ open, onClose, detail }: TimesheetViewDialogProps) => {
  /* Derived totals — the same rules the Timesheet page uses: holidays come
     from "Fixed holidays" lines, leaves from "Vacation" lines. */
  const total = detail ? detail.lines.reduce((s, l) => s + lineTotal(l), 0) : 0;
  const billable = detail
    ? detail.lines.filter((l) => l.billable).reduce((s, l) => s + lineTotal(l), 0)
    : 0;
  const holidayHours = detail
    ? detail.lines.filter((l) => l.task === 'Fixed holidays').reduce((s, l) => s + lineTotal(l), 0)
    : 0;
  const leaveHours = detail
    ? detail.lines.filter((l) => l.task === 'Vacation').reduce((s, l) => s + lineTotal(l), 0)
    : 0;
  const billableRatio = total > 0 ? `${Math.round((billable / total) * 100)}%` : '—';

  const statusLabel =
    detail?.status === 'approved'
      ? 'Approved'
      : detail?.status === 'rejected'
        ? 'Rejected'
        : 'Submitted';

  /* Per-day totals row under the line grid (same math as the submit page) */
  const perDayTotals = detail
    ? detail.weekDays.map((d) => {
        let all = 0;
        detail.lines.forEach((line) => {
          all += line.dayValues[d.key] ?? 0;
        });
        return { ...d, all };
      })
    : [];

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={onClose}
      isEdit={false}
      icon={<MoreTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APPROVALS_ACCENT}
      title='Timesheet'
      newTitle='View Timesheet'
      subtitle={detail ? `${detail.submittedBy} · ${detail.period}` : 'Submitted timesheet'}
      hideActions
      maxWidth='lg'
      headerActions={
        <Tooltip title='Close' placement='bottom'>
          <IconButton size='small' onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      }
    >
      {detail ? (
        <>
          {/* Submission date, pinned right (the Status stat card below
              already carries the decision state) */}
          <Stack direction='row' justifyContent='flex-end' sx={{ mb: 1.5 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: APPROVALS_ACCENT,
                bgcolor: `${APPROVALS_ACCENT}14`,
                border: `1px solid ${APPROVALS_ACCENT}33`,
                borderRadius: 1.5,
                px: 1.25,
                py: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              Submitted on {detail.submittedOn}
            </Typography>
          </Stack>

          {/* KPI stat cards — the same set as the Timesheet submit page */}
          <Stack direction='row' spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <StatBox
              tone={detail.status === 'approved' ? 'green' : 'amber'}
              value={statusLabel}
              label='Status'
            />
            <StatBox tone='cyan' value={`${formatHours(total)}h`} label='Total Hours' />
            <StatBox tone='green' value={`${formatHours(billable)}h`} label='Billable Hours' />
            <StatBox
              tone='amber'
              value={`${formatHours(total - billable)}h`}
              label='Non-Billable Hours'
            />
            <StatBox tone='teal' value={`${formatHours(holidayHours)}h`} label='Holidays' />
            <StatBox tone='indigo' value={`${formatHours(leaveHours)}h`} label='Leaves' />
            <StatBox tone='purple' value={billableRatio} label='Billable Ratio' />
          </Stack>

          {/* Line grid — day-by-day like the Timesheet submit page, read-only.
              No per-line External Note column: the notes live in the week
              notes section below. */}
          <TableContainer
            sx={{
              border: '1px solid #e5e7eb',
              borderRadius: 1.5,
              overflow: 'hidden',
              overflowX: 'auto',
            }}
          >
            <Table size='small' sx={{ tableLayout: 'fixed', width: '100%', minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', width: '14%' }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', width: '14%' }}>
                    Project
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', width: '12%' }}>
                    Task
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textAlign: 'center',
                      width: '8%',
                    }}
                  >
                    Billable
                  </TableCell>
                  {detail.weekDays.map((d) => (
                    <TableCell
                      key={d.key}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textAlign: 'center',
                        width: '6%',
                      }}
                    >
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {d.day}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {d.date}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: '0.78rem', textAlign: 'right', width: '8%' }}
                  >
                    Total Hours
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.lines.map((l) => (
                  <TableRow key={l.id} hover>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{l.client}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{l.project}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{l.task}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {l.billable ? (
                        <CheckCircleOutlineIcon sx={{ color: '#008a00', fontSize: 18 }} />
                      ) : (
                        <CancelIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                      )}
                    </TableCell>
                    {detail.weekDays.map((d) => (
                      <TableCell
                        key={d.key}
                        sx={{
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          color: (l.dayValues[d.key] ?? 0) > 0 ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {(l.dayValues[d.key] ?? 0) > 0 ? formatHours(l.dayValues[d.key]!) : '—'}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', fontWeight: 600 }}>
                      {formatHours(lineTotal(l))}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Per-day totals row — mirrors the submit page's totals */}
                <TableRow sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
                  <TableCell colSpan={4} sx={{ fontSize: '0.8rem' }}>
                    Daily Totals
                  </TableCell>
                  {perDayTotals.map((d) => (
                    <TableCell
                      key={d.key}
                      sx={{
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        color: d.all > 0 ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {d.all > 0 ? formatHours(d.all) : '—'}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{ fontSize: '0.8rem', textAlign: 'right', color: APPROVALS_ACCENT }}
                  >
                    {formatHours(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Week-level notes — accent note cards (blue = client-visible
              external, amber = team-only internal, matching the Timesheet
              page's note colours). One card per note that has content. */}
          {(detail.externalNote || detail.internalNote) && (
            <Stack direction='row' spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {detail.externalNote && <NoteCard tone='external' value={detail.externalNote} />}
              {detail.internalNote && <NoteCard tone='internal' value={detail.internalNote} />}
            </Stack>
          )}
        </>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            No timesheet data to display.
          </Typography>
        </Box>
      )}
    </ConfigFormDialog>
  );
};

export default TimesheetViewDialog;
