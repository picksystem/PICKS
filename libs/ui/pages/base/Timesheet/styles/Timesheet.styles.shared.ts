import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    /* light grey page backdrop so the white cards (stat cards, toolbar,
       table) stand out instead of blending into a flat white page */
    backgroundColor: '#f8f9fb',
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2) },
  },

  pageHeader: {
    marginBottom: theme.spacing(2.5),
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    position: 'relative' as const,
    border: '1px solid #e5e7eb',
    overflow: 'hidden' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  /* ── Top bar (tabs + actions) ─────────────────────────────── */
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
    /* NOTE: this theme sets xs: 0, so down('xs') compiles to
       @media (max-width:-0.05px) and NEVER matches — always use
       down('sm') (<=576.95px) for phone rules in this codebase. */
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'flex-start' as const,
    },
  },

  tabsBar: {
    gap: 0,
    /* give the tab bar a soft bottom rule that doubles as the indicator
       track, so the tabs read as a proper segmented control rather than
       bare text on a flat page */
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTab': {
      textTransform: 'none',
      fontWeight: 600,
      minHeight: 44,
      padding: theme.spacing(1, 2),
      fontSize: '0.9rem',
      color: theme.palette.text.secondary,
      '&:hover': { color: theme.palette.primary.main, backgroundColor: 'transparent' },
      '&.Mui-selected': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiTabs-indicator': {
      height: 3,
      borderRadius: 3,
      backgroundColor: theme.palette.primary.main,
    },
    '& .MuiTabs-scrollButtons': {
      display: 'none',
    },
  },

  topAction: {
    '& .MuiButton-startIcon': { marginRight: theme.spacing(0.75) },
  },

  /* ── Person / period bar ───────────────────────────────────── */
  /* Period band: its own full-width row directly under the tab row, with the
     ‹ › nav buttons and the selected week range centered inside it (matches
     the reference layout where the week range sits on the line below the tabs) */
  periodPill: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* roomy padding around the ‹ › buttons and the week-range label */
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#ffffff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
      padding: theme.spacing(0.75, 1),
      borderRadius: 10,
    },
  },

  personName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#111827',
  },

  periodNav: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#1e3a8a',
    minWidth: 40,
    height: 40,
    /* generous internal padding so the chevron has room to breathe */
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    '&:hover': {
      backgroundColor: '#f3f4f6',
      border: '1px solid #9ca3af',
    },
  },

  periodLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap' as const,
    /* padding around the date text so it isn't cramped against the chevrons */
    padding: theme.spacing(0.5, 1.5),
  },

  /* ── Summary stat cards (top of page, below topBar) ────────── */
  statCardsRow: {
    display: 'flex' as const,
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
    /* phone: two-up grid. NOTE — this theme's breakpoints start at xs: 0,
       so MUI's down('xs') compiles to max-width:-0.05px (never matches);
       down('sm') is the first key that actually targets phones. */
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
      display: 'grid' as const,
      gridTemplateColumns: '1fr 1fr',
    },
  },

  statCardWrapper: {
    flex: '1 1 140px',
    minWidth: 140,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.5),
    display: 'flex' as const,
    alignItems: 'center',
    gap: theme.spacing(1.25),
    /* the phone grid above needs the cards to be able to shrink */
    [theme.breakpoints.down('sm')]: {
      minWidth: 0,
      borderRadius: 10,
      padding: theme.spacing(1, 1.25),
    },
  },

  statCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  statCardValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.1,
  },

  statCardLabel: {
    marginTop: 1,
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: 500,
    lineHeight: 1.3,
  },

  /* ── Totals row detail label cell ─────────────────────────── */
  totalsDetailLabelCell: {
    textAlign: 'right' as const,
    paddingLeft: theme.spacing(2),
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },

  statCardRow2: {
    display: 'flex' as const,
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
  },

  /* ── Summary card ────────────────────────────────────────────── */
  summaryCard: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    marginBottom: theme.spacing(2),
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    position: 'relative' as const,
    overflow: 'hidden' as const,
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2), borderRadius: 8 },
  },

  summaryRow: {
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap' as const,
  },

  pageTitle: {
    fontWeight: 800,
    color: '#1e293b',
    fontSize: '1.5rem',
    letterSpacing: '-0.01em',
  },

  metaFields: {
    gap: theme.spacing(1),
  },

  periodBox: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: theme.spacing(1, 1.5),
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },

  statsRow: {
    flexWrap: 'wrap' as const,
    gap: theme.spacing(2),
  },

  statCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: theme.spacing(1.5, 2),
    minWidth: 200,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
  },

  statIcon: {
    color: theme.palette.text.secondary,
  },

  statField: {
    minWidth: 150,
    '& .MuiOutlinedInput-root': {
      height: 38,
      fontSize: '0.85rem',
    },
    '& .MuiInputBase-input': { padding: '6px 10px' },
  },

  /* ── Lines section ───────────────────────────────────────────── */
  linesSection: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(1.5, 2),
  },

  linesHeader: {
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    gap: theme.spacing(1),
  },

  addLineBar: {
    display: 'flex' as const,
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end' as const,
  },

  addLineField: {
    minWidth: 180,
  },

  /* ── Table ───────────────────────────────────────────────────── */
  tableContainer: {
    overflowX: 'auto' as const,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },

  /* ── Phone / tablet (< md): one card per line, in place of the wide grid
     (rendered via the showCards flag in Timesheet.tsx).
       The card reuses the exact field components of the desktop table
       (ClientSearchField / ProjectSearchField / OptionsSearchField /
       NoteCellButton / DayCellField), so only the layout is different. */
  mobileLineList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(1.5),
  },

  mobileLineCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.5),
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
  },

  mobileLineCardHead: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },

  mobileLineCardHeadText: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 2,
    flex: '1 1 auto',
    minWidth: 0,
  },

  /* 3 × 2 rows keeps each search field wide enough to be usable on a phone;
     a tablet has the room for one row of all six fields */
  mobileLineFields: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(0.75, 1),
    [theme.breakpoints.between('sm', 'md')]: {
      gridTemplateColumns: 'repeat(6, 1fr)',
    },
  },

  /* the seven day inputs flow as 4 + 3 on a phone; a full Mon–Sun row on
     a tablet */
  mobileDayGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(0.75, 1),
    [theme.breakpoints.between('sm', 'md')]: {
      gridTemplateColumns: 'repeat(7, 1fr)',
    },
  },

  mobileFieldStack: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 3,
    minWidth: 0,
  },

  mobileFieldLabel: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: theme.palette.text.secondary,
  },

  mobileTotalLine: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: theme.palette.primary.dark,
  },

  /* ── Mobile totals summary (the detail rows live under the table) ── */
  mobileTotalsGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },

  mobileTotalsCell: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 2,
    padding: theme.spacing(0.75, 1),
    backgroundColor: '#f8fafc',
    border: '1px solid #eef2f7',
    borderRadius: 8,
  },

  mobileTotalsCellLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },

  mobileTotalsCellValue: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  headerCell: {
    fontWeight: 700,
    fontSize: '0.72rem',
    letterSpacing: '0.03em',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    whiteSpace: 'nowrap' as const,
    borderBottom: `2px solid ${theme.palette.divider}`,
    /* mirrors the data-row padding so column headers line up with the
       fields beneath them */
    padding: theme.spacing(1, 1),
  },

  dataRow: {
    '&:hover': {
      backgroundColor: 'rgba(37,99,235,0.03)',
    },
    '& td': {
      /* uniform 8px gutter around every cell, so every search/text field
         and the day inputs share the same gap between neighbours */
      padding: theme.spacing(0.75, 1),
      verticalAlign: 'middle' as const,
    },
  },

  /* ── Uniform cell fields: same width/height for Client, Project, Task ── */
  cellField: {
    '& .MuiOutlinedInput-root': {
      height: 34,
      /* 100% of the cell: the table stretches to full page width and
         distributes the leftover space across columns — a fixed px width
         would leave a visible gap; filling the cell keeps fields flush */
      width: '100%',
      borderRadius: 8,
      backgroundColor: '#ffffff',
      '&.Mui-disabled': { backgroundColor: '#f3f4f6' },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.85rem',
      padding: '7px 12px',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis',
    },
  },

  selectCell: {
    width: '3%',
    /* position relative so the absolutely-positioned checkbox centering box
       (CenteredCheckbox in Timesheet.tsx) spans exactly the cell's content
       area — deterministic horizontal AND vertical centering regardless of
       row height, since height: 100% is not reliable inside table cells */
    position: 'relative' as const,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
  },

  /* full-content-area flex box that centers the checkbox in selectCell */
  selectCheckboxBox: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Column widths for the lines table. The table uses table-layout: fixed
     at exactly 100% of the container width (see Timesheet.tsx) with these
     percentage widths, so the grid always fits its parent — no horizontal
     scroll. The five field columns (Client / Project / Task / notes) take
     the bulk of the space and their text truncates inside the fields
     (ellipsis) instead of stretching the table.
     3 + 5×10.3 + 3.5 + 7×4 + 4.5 + 4 + 5.5 = 100% — the five field
     columns (Client / Project / Task / notes) are all identical */
  clientCell: {
    width: '10.3%',
  },

  cellSelectHeader: {
    width: '10.3%',
  },

  cellSelect: {
    width: '10.3%',
  },

  noteCell: {
    width: '10.3%',
  },

  billableColumn: {
    width: '3.5%',
    textAlign: 'center' as const,
    paddingLeft: 0,
    paddingRight: 0,
  },

  totalHoursCell: {
    width: '4.5%',
    /* center the figure in the column, matching the centered day inputs */
    textAlign: 'center' as const,
  },

  checkbox: {
    cursor: 'pointer' as const,
    color: theme.palette.primary.main,
  },

  dayCellField: {
    /* fill the whole day column so the input's edges align with the
       centered header (Mon/2) and the per-day totals below — the HH:MM
       text itself stays centered inside the input */
    '& .MuiOutlinedInput-root': {
      height: 32,
      width: '100%',
      borderRadius: 8,
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-input': {
      textAlign: 'center' as const,
      padding: '2px 3px',
      fontSize: '0.8rem',
    },
  },

  dayCell: {
    textAlign: 'center' as const,
    fontSize: '0.8rem',
  },

  totalsGrandCell: {
    color: theme.palette.primary.dark,
  },

  /* ── Day cell with sub-total ───────────────────────────────── */
  dayColumn: {
    width: '4%',
    textAlign: 'center' as const,
  },

  daySubTotal: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginTop: theme.spacing(0.25),
  },

  /* ── Action toolbar (Copy / Add to favourites / notes / totals) ── */
  linesToolbar: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(0.5, 0.75),
    flexWrap: 'wrap' as const,
    background: '#ffffff',
    border: '1px solid rgba(226, 232, 255, 0.8)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
    padding: theme.spacing(0.75, 1.25),
    /* phone: a single horizontally scrollable strip beats 6 rows of pills
       (down('sm') = <=576.95px; down('xs') would never match in this theme) */
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'nowrap' as const,
      overflowX: 'auto' as const,
      overflowY: 'hidden' as const,
      gap: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      /* stop the scrollbar eating vertical space on desktop-like devices */
      scrollbarWidth: 'thin' as const,
    },
  },

  timesheetIconPill: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease',
    flexShrink: 0,
    '.timesheetActionButton:hover &': {
      transform: 'scale(1.08)',
    },
  },

  timesheetActionButton: {
    flex: '0 0 auto',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5, 0.75),
    gap: 3,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 10,
    minWidth: 60,
    position: 'relative' as const,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      minWidth: 46,
      padding: theme.spacing(0.375, 0.5),
      gap: 2,
    },

    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(99, 102, 241, 0.07)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    },

    '&:active': {
      transform: 'translateY(0)',
      background: 'rgba(99, 102, 241, 0.12)',
    },
  },

  timesheetActionLabel: {
    fontSize: '0.7rem',
    lineHeight: 1.2,
    color: '#475569',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
    letterSpacing: '0.2px',
  },

  toolbarTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(0.5),
    whiteSpace: 'nowrap' as const,
  },

  /* ── Billable toggle cell ───────────────────────────────────── */
  billableCell: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0.75),
  },

  billableSwitch: {
    '& .MuiSwitch-switchBase': {
      padding: 2,
    },
    '& .MuiSwitch-thumb': {
      width: 14,
      height: 14,
    },
  },

  noteInput: {
    '& .MuiOutlinedInput-root': {
      height: 30,
      fontSize: '0.8rem',
      backgroundColor: '#f8fafc',
    },
    '& .MuiInputBase-input': {
      padding: '3px 8px',
      fontSize: '0.8rem',
    },
    '& .MuiIconButton-standard': {
      fontSize: '1.05rem',
    },
  },

  /* ── Note buttons (Add external / internal comment) ───────── */
  noteButton: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: theme.spacing(0.5, 1),
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
    '&:hover': {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
      backgroundColor: `${theme.palette.primary.main}08`,
    },
  },

  noteButtonLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis',
  },

  /* ── Status pill ────────────────────────────────────────────── */
  statusCell: {
    width: '4%',
    whiteSpace: 'nowrap' as const,
  },

  statusPill: {
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: 'rgba(255,152,0,0.12)',
    color: '#b45309',
  },

  statusPillApproved: {
    backgroundColor: 'rgba(0,138,0,0.1)',
    color: '#008a00',
  },

  /* ── Line actions cell ──────────────────────────────────────── */
  actionsCell: {
    width: '5.5%',
  },

  actionIconButton: {
    p: 0.5,
    borderRadius: 6,
  },

  /* ── Detail totals rows ─────────────────────────────────────── */
  totalsBody: {
    '& tr:last-child td': {
      paddingBottom: 0,
    },
  },

  totalsRow: {
    '& td': {
      borderTop: `1px dashed ${theme.palette.divider}`,
      paddingTop: 0,
      paddingBottom: 0,
      height: 34,
      backgroundColor: theme.palette.background.paper,
      /* keep the per-day figures centered under their day-column inputs */
      textAlign: 'center' as const,
      '&:first-child': { paddingLeft: theme.spacing(2) },
    },
    '&:hover td': {
      backgroundColor: theme.palette.background.paper,
    },
  },

  totalsLabelCell: {
    textAlign: 'right' as const,
    paddingLeft: theme.spacing(2),
    whiteSpace: 'nowrap' as const,
    fontSize: '0.8rem',
    color: theme.palette.text.primary,
  },

  totalsDayCell: {
    display: 'flex' as const,
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    '& .MuiOutlinedInput-root': {
      height: 26,
      maxWidth: 44,
      minWidth: 36,
      borderStyle: 'dashed' as const,
      '& .MuiOutlinedInput-input': {
        padding: '2px 4px',
        fontSize: '0.78rem',
      },
    },
  },

  totalsRatioCell: {
    color: theme.palette.text.secondary,
  },

  /* ── Day column width helper ────────────────────────────────── */
  dayColumnWidth: {
    minWidth: 76,
  },

  /* ── Totals row label ──────────────────────────────────────── */
  totalsRowLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  /* ── Empty state ─────────────────────────────────────────────── */
  emptyState: {
    textAlign: 'center' as const,
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    border: '2px dashed',
    borderColor: theme.palette.divider,
    borderRadius: (theme.shape.borderRadius as number) * 3,
  },

  emptyIcon: {
    fontSize: '40px !important',
    color: `${theme.palette.text.disabled} !important`,
    marginBottom: `${theme.spacing(1)}!important`,
  },

  /* ── Status legend (below the lines table) ─────────────────── */
  statusLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap' as const,
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    borderTop: `1px dashed ${theme.palette.divider}`,
  },

  statusLegendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },

  /* ── Footer actions (on phone it stacks full-width — direction is
     handled in JSX via a breakpoint sx, since Stack's own class sets
     flex-direction) ─────────────────────────────────────────────── */
  footerActions: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },

  postSubmit: {
    marginTop: theme.spacing(2),
    textAlign: 'center' as const,
  },

  modalFooter: {
    justifyContent: 'center' as const,
  },
});
