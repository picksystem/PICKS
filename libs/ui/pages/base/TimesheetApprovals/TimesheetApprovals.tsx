import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  PageHeader,
  Column,
  Button,
  IconButton,
  Tooltip,
  TextField,
} from '../../../components';
import { Checkbox, Stack } from '@mui/material';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { GenericPanel, type TableConfig } from '@serviceops/genericpanel';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { useAuth, useNotification, useAppNavigation } from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import {
  RichTextEditor,
  parseRichText,
  serializeRichText,
} from '../Configuration/shared/RichTextEditor';
import { APPROVED_ESTIMATES_ACCENT } from '../Configuration/sections/General/components/ApprovedEstimates/shared/ApprovedEstimatesConfig';
import { OptionsSearchField } from '../Configuration/shared/GenericPanel/components/OptionsSearchField/OptionsSearchField';
import { useStyles } from './styles';
import {
  APPROVALS_ACCENT,
  approvalTabs,
  type ActionDecision,
  type ApprovalType,
  type TimesheetDetail,
} from './timesheetApprovals.config';
import TimesheetViewDialog from './TimesheetViewDialog';

/* The searchable Action dropdown on the Timesheet Approval table */
const ACTION_OPTIONS: ActionDecision[] = ['Approve', 'Reject', 'Info Required', 'Change Approver'];

/* Row type for the history panel (decided requests) */
interface HistoryRow {
  id: string;
  employee: string;
  project: string;
  date: string;
  status: string;
  reason: string;
  decisionBy: string;
}

const VALID_KEYS: ApprovalType[] = approvalTabs.map((t) => t.key);

/* Stable id for a generic panel row (rows are Record<string, unknown>). */
const rowKey = (r: Record<string, unknown>) => String(r.id ?? '');

/* Same preview rule as the Timesheet page's NoteCellButton: show the first
   line of a rich-text note, truncated, as the field's placeholder text. */
const commentPreview = (note: string, maxLen = 32): string => {
  const text = parseRichText(note).segments[0]?.text?.trim() ?? '';
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
};

/* ── Comment dialog: mirrors the Timesheet page's note dialog — same
   ConfigFormDialog shell, accent header, and the Configuration
   RichTextEditor. Used by the Comment column so a manager can read/edit
   the request's comment the same way the Timesheet submit page's comment
   field works. */
const CommentDialog = ({
  open,
  draft,
  onClose,
  onDraftChange,
}: {
  open: boolean;
  draft: string;
  onClose: () => void;
  onDraftChange: (d: string) => void;
}) => (
  <ConfigFormDialog
    open={open}
    onClose={onClose}
    onSubmit={onClose}
    isEdit
    icon={<CommentIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
    accent={APPROVED_ESTIMATES_ACCENT}
    title='Comment'
    editTitle='Comment'
    subtitle='Add a note to this request.'
    submitLabel='Save'
    maxWidth='md'
  >
    <Box sx={{ borderRadius: 1 }}>
      <RichTextEditor
        value={{ segments: parseRichText(draft).segments }}
        onChange={(value) => onDraftChange(serializeRichText(value.segments))}
        showFooterActions={false}
        title='Comment'
      />
    </Box>
  </ConfigFormDialog>
);

const TimesheetApprovals = () => {
  const { classes } = useStyles();
  const notify = useNotification();
  const { user } = useAuth();
  const { navigateToPath } = useAppNavigation();
  const { BasePath } = constants;
  const [searchParams] = useSearchParams();

  /* The ?type= query param picks which approval type this page shows —
     each dashboard "My Approvals" row deep-links its own type. */
  const requested = searchParams.get('type') as ApprovalType | null;
  const activeTab =
    approvalTabs.find((t) => t.key === requested && VALID_KEYS.includes(requested)) ??
    approvalTabs[0];

  /* Back to the timesheet page — the "My Approvals" dashboard section these
     approval pages deep-link out of. Every type shares this one header. */
  const handleBack = useCallback(() => {
    navigateToPath(BasePath.TIMESHEET);
  }, [navigateToPath, BasePath.TIMESHEET]);

  /* ── Panel configs for the shared GenericPanel component ── */
  type PanelRow = Record<string, unknown>;

  /* Manager decisions (local demo state until a backend module lands):
     rowId -> decision. Decided rows leave the pending queue and reappear
     in the history table with a "Decided By" stamp. "Info Required" and
     "Change Approver" keep the row in the pending queue (status only). */
  const [decisions, setDecisions] = useState<Record<string, ActionDecision>>({});

  /* Row selection for the pending table's checkbox column (drives bulk
     actions in the toolbar). */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* The eye icon (Timesheet Approval rows) opens the read-only timesheet
     view dialog for that row. */
  const [viewing, setViewing] = useState<{ rowId: string; detail: TimesheetDetail } | null>(null);

  /* The Comment cell (Timesheet Approval rows) opens the comment dialog —
     same field pattern as the Timesheet submit page's note cell. The
     dialog's editor is stateful (its draft lives in `commentRow`); per-row
     saved drafts live in `commentDrafts`. */
  const [commentRow, setCommentRow] = useState<{ rowId: string; draft: string } | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const openComment = useCallback((rowId: string, initial: string) => {
    setCommentRow({ rowId, draft: initial });
  }, []);
  const handleCommentDraftChange = useCallback((d: string) => {
    setCommentRow((prev) => (prev ? { ...prev, draft: d } : prev));
  }, []);
  const closeComment = useCallback(() => {
    if (commentRow) {
      setCommentDrafts((prev) => ({ ...prev, [commentRow.rowId]: commentRow.draft }));
    }
    setCommentRow(null);
  }, [commentRow]);

  /* Clear any row selection when the manager switches approval type, so a
     checkbox selection from one table never leaks into another. */
  useEffect(() => {
    setSelected(new Set());
  }, [activeTab.key]);

  const decidedBy = user
    ? `${user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()} (${
        user.employeeId || user.id
      })`
    : '—';

  /* Only a final decision (Approve/Reject) removes the row from the pending
     queue; Info Required / Change Approver keep it, updating the status. */
  const pendingData = useMemo(
    () =>
      activeTab.rows.filter((r) => {
        const d = decisions[rowKey(r)];
        return !d || d === 'Info Required' || d === 'Change Approver';
      }),
    [activeTab, decisions],
  );

  const historyData = useMemo(
    () => [
      ...activeTab.historyRows,
      ...activeTab.rows
        .filter((r) => decisions[rowKey(r)] === 'Approve' || decisions[rowKey(r)] === 'Reject')
        .map((r) => ({
          ...r,
          status: decisions[rowKey(r)] === 'Approve' ? 'Approved' : 'Rejected',
          decisionBy: decidedBy,
        })),
    ],
    [activeTab, decisions, decidedBy],
  );

  /* Row decision from the searchable Action dropdown (per-row or bulk). */
  const decide = useCallback(
    (rowId: string, action: ActionDecision) => {
      setDecisions((prev) => ({ ...prev, [rowId]: action }));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
      const name = activeTab.label.replace(' Approval', '');
      if (action === 'Approve') notify.success(`${name} request approved`);
      else if (action === 'Reject') notify.info(`${name} request rejected`);
      else notify.info(`${name}: ${action.toLowerCase()} flagged`);
    },
    [activeTab, notify],
  );

  const decideAll = useCallback(
    (action: 'Approve' | 'Reject') => {
      const targets = selected.size > 0 ? [...selected] : pendingData.map(rowKey);
      setDecisions((prev) => {
        const next = { ...prev };
        targets.forEach((id) => {
          if (id && id !== 'undefined') next[id] = action;
        });
        return next;
      });
      setSelected(new Set());
      if (action === 'Approve') notify.success(`All ${activeTab.label} requests approved`);
      else notify.info(`All ${activeTab.label} requests rejected`);
    },
    [activeTab, notify, selected, pendingData],
  );

  /* ── Checkbox selection for the pending queue (drives bulk actions) ── */
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === pendingData.length && pendingData.length > 0
        ? new Set<string>()
        : new Set(pendingData.map(rowKey)),
    );
  }, [pendingData]);

  const pendingColumns: Column<PanelRow>[] = useMemo(() => {
    const toColumn = (c: {
      id: string;
      label: string;
      minWidth: number;
      align?: 'left' | 'right' | 'center';
    }): Column<PanelRow> => ({
      id: c.id,
      label: c.label,
      minWidth: c.minWidth,
      ...(c.align ? { align: c.align } : {}),
      /* Plain header label (no sort arrow). The manager tables are review
         queues, not sortable data grids. */
      sortable: false,
    });

    const allSelected = pendingData.length > 0 && selected.size === pendingData.length;
    const someSelected = selected.size > 0 && !allSelected;

    /* Leading checkbox column: select-all in the header, a per-row box below */
    const selectColumn: Column<PanelRow> = {
      id: '_select',
      label: '',
      minWidth: 44,
      sortable: false,
      filterable: false,
      header: (
        <Checkbox
          size='small'
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleSelectAll}
          sx={{ p: 0 }}
        />
      ),
      format: (_v, row) => {
        const key = rowKey(row);
        return (
          <Box onClick={(e: ReactMouseEvent) => e.stopPropagation()}>
            <Checkbox
              size='small'
              checked={selected.has(key)}
              onChange={() => toggleSelect(key)}
              sx={{ p: 0 }}
            />
          </Box>
        );
      },
    };

    /* Searchable per-row action field — the same type-to-filter field used
       by the "Add Approved Estimate" Ticket Type field (OptionsSearchField):
       a search input with a filterable list + search/clear adornment. Approve
       / Reject / Info Required / Change Approver. Info Required + Change
       Approver keep the row in the pending queue; Approve/Reject move it to
       the history table. */
    const actionColumn: Column<PanelRow> = {
      id: 'action',
      label: 'Action',
      /* The field fills the cell (width: 100%) — under the fixed table
         layout the column is exactly this wide, so it must leave room for
         the "Select action" input plus its search adornment. */
      minWidth: 210,
      align: 'center',
      sortable: false,
      filterable: false,
      format: (_v, row) => {
        const key = rowKey(row);
        return (
          <Box onClick={(e: ReactMouseEvent) => e.stopPropagation()} sx={{ width: '100%' }}>
            <OptionsSearchField
              label=''
              placeholder='Select action'
              value={decisions[key] ?? ''}
              onChange={(val) => {
                if (val) decide(key, val as ActionDecision);
              }}
              options={ACTION_OPTIONS.map((a) => ({ value: a, label: a }))}
            />
          </Box>
        );
      },
    };

    /* Comment column — same field pattern as the Timesheet submit page's
       note cell (NoteCellButton): a read-only outlined field that previews
       the comment's first line, with an edit icon on the right. Clicking
       it opens the comment dialog (RichTextEditor inside a
       ConfigFormDialog, the same shell the note dialog uses there).
       Fixed at 200px — the leftover panel width is absorbed by the
       trailing Check column instead, so the field stays compact. */
    const commentColumn: Column<PanelRow> = {
      id: 'comment',
      label: 'Comment',
      minWidth: 200,
      align: 'left',
      sortable: false,
      filterable: false,
      format: (_v, row) => {
        const key = rowKey(row);
        const preview = commentPreview(commentDrafts[key] ?? String(row.comment ?? ''));
        const initial = commentDrafts[key] ?? String(row.comment ?? '');
        return (
          <Box
            onClick={(e: ReactMouseEvent) => {
              e.stopPropagation();
              openComment(key, initial);
            }}
          >
            <Tooltip
              title='Click to add or view the comment — the comment box will open.'
              placement='top'
            >
              <TextField
                size='small'
                variant='outlined'
                fullWidth
                value={preview}
                placeholder='Add comment'
                icon={<EditIcon sx={{ fontSize: '1rem', color: '#616161' }} />}
                iconAlignment='right'
                inputProps={{ readOnly: true }}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    cursor: 'pointer',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </Tooltip>
          </Box>
        );
      },
    };

    /* Trailing "Check" column: eye icon opens the read-only timesheet
       dialog. In the proportional fixed-layout table every column (this
       one included) gets its fair share of the panel width, so the icon
       sits at the panel's right edge with no giant empty stretch. */
    const checkColumn: Column<PanelRow> = {
      id: 'check',
      label: 'Check',
      minWidth: 60,
      align: 'right',
      sortable: false,
      filterable: false,
      format: (_v, row) => {
        const r = row as unknown as { timesheetDetail?: TimesheetDetail };
        const key = rowKey(row);
        const icon = r.timesheetDetail ? (
          <Tooltip title='View timesheet' placement='top'>
            <IconButton
              size='small'
              onClick={() => setViewing({ rowId: key, detail: r.timesheetDetail! })}
              sx={{ color: '#0369a1' }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <VisibilityIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
        );
        return <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{icon}</Box>;
      },
    };

    /* Timesheet Approval: the full manager-review header set the user asked
       for — checkbox, Emp Id … Time-Off Hours, searchable Action, Comment,
       and the Check (eye) column. */
    if (activeTab.withActionDecision) {
      const dataCols = activeTab.columns
        .filter((c) => c.id !== 'status' && c.id !== 'comment')
        .map(toColumn);
      return [selectColumn, ...dataCols, actionColumn, commentColumn, checkColumn];
    }

    /* Other approval types: their data columns + icon-based quick actions.
       The proportional fixed layout distributes the panel width across
       every column, so no single column needs to be flagged as a
       catch-all. */
    const dataColumns = activeTab.columns.map(toColumn);
    return [
      ...dataColumns,
      {
        id: 'action',
        label: 'Action',
        minWidth: 140,
        sortable: false,
        filterable: false,
        format: (_v, row) => {
          const r = row as unknown as { timesheetDetail?: TimesheetDetail };
          const key = rowKey(row);
          return (
            <Stack direction='row' spacing={0.5} alignItems='center'>
              {activeTab.key === 'timesheet' && r.timesheetDetail && (
                <Tooltip title='View timesheet' placement='top'>
                  <IconButton
                    size='small'
                    onClick={() => setViewing({ rowId: key, detail: r.timesheetDetail! })}
                    sx={{ color: '#0369a1' }}
                  >
                    <VisibilityIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title='Approve' placement='top'>
                <IconButton
                  size='small'
                  onClick={() => decide(key, 'Approve')}
                  sx={{ color: '#008a00' }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Reject' placement='top'>
                <IconButton
                  size='small'
                  onClick={() => decide(key, 'Reject')}
                  sx={{ color: '#d32f2f' }}
                >
                  <CancelIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ];
  }, [
    activeTab,
    selected,
    decisions,
    pendingData,
    decide,
    toggleSelect,
    toggleSelectAll,
    commentDrafts,
    openComment,
  ]);

  const historyColumns: Column<PanelRow>[] = useMemo(
    () => [
      ...activeTab.columns
        .filter((c) => c.id !== 'status')
        .map((c) => ({
          id: c.id,
          label: c.label,
          minWidth: c.minWidth,
          ...(c.align ? { align: c.align } : {}),
        })),
      { id: 'decisionBy', label: 'Decided By', minWidth: 160 },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        sortable: false,
        filterable: false,
        format: (_v, row) => {
          const r = row as unknown as HistoryRow;
          const approved = r.status === 'Approved';
          return (
            <Stack direction='row' spacing={0.5} alignItems='center'>
              {approved ? (
                <CheckCircleOutlineIcon sx={{ color: '#008a00', fontSize: 15 }} />
              ) : (
                <CancelIcon sx={{ color: '#d32f2f', fontSize: 15 }} />
              )}
              <Typography
                variant='caption'
                sx={{ color: approved ? '#008a00' : '#d32f2f', fontWeight: 700 }}
              >
                {r.status}
              </Typography>
            </Stack>
          );
        },
      },
    ],
    [activeTab],
  );

  const pendingConfig: TableConfig = {
    title: activeTab.panelTitle,
    subtitle: activeTab.panelSubtitle,
    accent: APPROVALS_ACCENT,
    icon: activeTab.icon,
    entity: activeTab.entity,
    accordionId: `${activeTab.accordionId}-pending`,
    fields: activeTab.searchFields,
  };

  const historyConfig: TableConfig = {
    title: `${activeTab.panelTitle} History`,
    subtitle: `${activeTab.panelTitle} decisions already taken`,
    accent: APPROVALS_ACCENT,
    icon: activeTab.icon,
    entity: `${activeTab.entity} History`,
    accordionId: `${activeTab.accordionId}-history`,
    fields: activeTab.searchFields,
  };

  return (
    <Box className={classes.container}>
      <PageHeader
        title={activeTab.label}
        description='Review and decide on the submissions that are waiting for your approval.'
        className={classes.pageHeader}
      />

      {/* Back button — below the page header, bottom-right corner. Every
          approval type shares this header, so one button covers all of
          them; clicking it returns to the timesheet page. */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size='small'
          variant='outlined'
          startIcon={<NavigateBeforeIcon sx={{ fontSize: 16 }} />}
          label='Back'
          onClick={handleBack}
        />
      </Box>

      <Box className={classes.panelStack}>
        <GenericPanel
          config={pendingConfig}
          data={pendingData as unknown as Record<string, unknown>[]}
          onSave={() => undefined}
          customColumns={pendingColumns}
          variant='plain'
          plainAsSection
          /* Fixed layout: the panel's full width is shared proportionally
             across every column, so the headers stay evenly packed (no
             gaps) and the table fills the panel edge-to-edge — it only
             scrolls horizontally when the declared widths don't fit. */
          fixedLayout
          /* Decisions happen in-cell (Action/Comment) — clicking a row must
             not highlight it or drive the toolbar. */
          disableRowSelection
          enableNewButton={false}
          enableEditButton={false}
          enableDeleteButton={false}
          enableSuccessMessage={false}
          toolbarExtra={
            pendingData.length > 0 ? (
              <Stack direction='row' spacing={1} alignItems='center'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#008a00',
                    '&:hover': { bgcolor: '#008a00' },
                  }}
                  label='Approve All'
                  onClick={() => decideAll('Approve')}
                />
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<CancelIcon />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#d32f2f' },
                  }}
                  label='Reject All'
                  onClick={() => decideAll('Reject')}
                />
              </Stack>
            ) : undefined
          }
        />

        <GenericPanel
          config={historyConfig}
          data={historyData as unknown as Record<string, unknown>[]}
          onSave={() => undefined}
          customColumns={historyColumns}
          variant='plain'
          plainAsSection
          /* Same fixed layout as the pending panel: tight headers, the
             "Decided By" column absorbs the leftover width. */
          fixedLayout
          /* Decided requests are read-only — no row highlight on click. */
          disableRowSelection
          enableNewButton={false}
          enableEditButton={false}
          enableDeleteButton={false}
          enableSuccessMessage={false}
        />
      </Box>

      {/* Read-only view of a submitted timesheet (opened by the eye icon
          in the Timesheet Approval table). Decisions are made in the table. */}
      <TimesheetViewDialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        detail={viewing?.detail ?? null}
      />

      {/* Comment editor (opened by the Comment field) — same dialog shell
          the Timesheet submit page uses for its note field. */}
      <CommentDialog
        open={!!commentRow}
        draft={commentRow?.draft ?? ''}
        onClose={closeComment}
        onDraftChange={handleCommentDraftChange}
      />
    </Box>
  );
};

export default TimesheetApprovals;
