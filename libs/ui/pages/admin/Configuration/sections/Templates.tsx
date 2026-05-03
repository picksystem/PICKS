import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Link,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Checkbox,
  Chip,
  Switch,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  IConfigTicketUpdateTemplate,
  IConfigResolutionTemplate,
  IConfigTimeEntryTemplate,
  IConfigTimeEntryLine,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';

// ── Shared cell renderers ─────────────────────────────────────────────────────

const mkCell =
  (bold = false) =>
  (v: unknown): React.ReactNode => (
    <Typography variant='body2' fontWeight={bold ? 600 : 500} fontSize='0.82rem'>
      {String(v || '—')}
    </Typography>
  );

const TruncCell = (v: unknown): React.ReactNode => (
  <Typography
    variant='body2'
    color='text.secondary'
    fontSize='0.8rem'
    noWrap
    sx={{ maxWidth: 200 }}
  >
    {String(v || '—')}
  </Typography>
);

const ActiveCell = (v: unknown): React.ReactNode => {
  const on = Boolean(v);
  return (
    <Chip
      label={on ? 'Active' : 'Inactive'}
      size='small'
      sx={{
        bgcolor: on ? '#dcfce7' : '#f1f5f9',
        color: on ? '#166534' : '#64748b',
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 20,
        borderRadius: '6px',
      }}
    />
  );
};

const mkBoolCell =
  (accent: string) =>
  (v: unknown): React.ReactNode =>
    Boolean(v) ? (
      <Chip
        label='Yes'
        size='small'
        sx={{
          bgcolor: alpha(accent, 0.1),
          color: accent,
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 20,
          borderRadius: '6px',
        }}
      />
    ) : (
      <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
        —
      </Typography>
    );

// ── Shared form types ─────────────────────────────────────────────────────────

type TemplateForm = {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  subjectLine: string;
  commentDescription: string;
  internalNote: boolean;
  notifyAssigneesOnly: boolean;
  selfNote: boolean;
  appendToResolution: boolean;
};

type BoolFormKey = 'internalNote' | 'notifyAssigneesOnly' | 'selfNote' | 'appendToResolution';

const EMPTY_FORM: TemplateForm = {
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  subjectLine: '',
  commentDescription: '',
  internalNote: false,
  notifyAssigneesOnly: false,
  selfNote: false,
  appendToResolution: false,
};

const BOOL_FIELDS: { key: BoolFormKey; label: string; hint: string }[] = [
  { key: 'internalNote', label: 'Internal Note', hint: 'Visible to agents only' },
  { key: 'notifyAssigneesOnly', label: 'Notify Assignees Only', hint: 'Limit email notifications' },
  { key: 'selfNote', label: 'Self Note', hint: 'Only visible to you' },
  {
    key: 'appendToResolution',
    label: 'Append to Resolution',
    hint: 'Add content to resolution notes',
  },
];

// ── Shared TemplateSection accordion ─────────────────────────────────────────

interface TemplateSectionProps {
  title: string;
  subtitle: string;
  accent: string;
  gradientEnd: string;
  idPrefix: string;
  Icon: React.ElementType;
  defaultExpanded?: boolean;
  boolFields?: { key: BoolFormKey; label: string; hint: string }[];
  rows: IConfigTicketUpdateTemplate[];
  onSave: (next: IConfigTicketUpdateTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
}

const TemplateSection = ({
  title,
  subtitle,
  accent,
  gradientEnd,
  idPrefix,
  Icon,
  defaultExpanded = false,
  boolFields = BOOL_FIELDS,
  rows,
  onSave,
  statusItems,
}: TemplateSectionProps) => {
  const { classes } = useStyles();

  // ── Table state ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.ticketStatus.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  // ── Dialog state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigTicketUpdateTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<TemplateForm>({ ...EMPTY_FORM });

  useEffect(() => {
    if (!editOpen) return;
    setForm(
      editingRow
        ? {
            name: editingRow.name,
            description: editingRow.description,
            active: editingRow.active,
            ticketStatus: editingRow.ticketStatus,
            subjectLine: editingRow.subjectLine,
            commentDescription: editingRow.commentDescription,
            internalNote: editingRow.internalNote,
            notifyAssigneesOnly: editingRow.notifyAssigneesOnly,
            selfNote: editingRow.selfNote,
            appendToResolution: editingRow.appendToResolution,
          }
        : { ...EMPTY_FORM },
    );
  }, [editOpen, editingRow]);

  const openNew = () => {
    setEditingRow(null);
    setEditOpen(true);
  };
  const openEdit = () => {
    if (selectedRow) {
      setEditingRow(selectedRow);
      setEditOpen(true);
    }
  };
  const closeDialog = () => {
    setEditOpen(false);
    setEditingRow(null);
  };
  const toggleBool = (key: BoolFormKey) => setForm((f) => ({ ...f, [key]: !f[key] }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    let next: IConfigTicketUpdateTemplate[];
    if (editingRow) {
      next = rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTicketUpdateTemplate = { id: `${idPrefix}_${Date.now()}`, ...form };
      next = [...rows, n];
      setSelectedId(n.id);
    }
    onSave(next);
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const BoolCell = mkBoolCell(accent);

  const columns: Column<IConfigTicketUpdateTemplate>[] = [
    { id: 'name', label: 'Name', minWidth: 160, format: mkCell(true) },
    { id: 'description', label: 'Description', minWidth: 180, format: TruncCell },
    { id: 'active', label: 'Active', minWidth: 80, format: ActiveCell },
    { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: mkCell() },
    {
      id: 'subjectLine',
      label: 'Subject Line',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' noWrap sx={{ maxWidth: 180 }}>
          {String(v || '—')}
        </Typography>
      ),
    },
    { id: 'commentDescription', label: 'Description', minWidth: 160, format: TruncCell },
    {
      id: 'internalNote',
      label: boolFields.find((f) => f.key === 'internalNote')?.label ?? 'Internal Note',
      minWidth: 130,
      format: BoolCell,
    },
    { id: 'notifyAssigneesOnly', label: 'Notify Assignees Only', minWidth: 170, format: BoolCell },
    { id: 'selfNote', label: 'Self Note', minWidth: 90, format: BoolCell },
    { id: 'appendToResolution', label: 'Append Solution', minWidth: 130, format: BoolCell },
  ];

  return (
    <>
      <Accordion
        defaultExpanded={defaultExpanded}
        className={classes.sectionAccordion}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>{title}</Typography>
              <Typography className={classes.sectionSubtitle}>{subtitle}</Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* ── Toolbar ── */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow ? (
                <Tooltip title={`Add new ${title.toLowerCase()}`}>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openNew}
                    sx={{
                      textTransform: 'none',
                      bgcolor: accent,
                      '&:hover': { bgcolor: alpha(accent, 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<EditIcon />}
                    onClick={openEdit}
                    sx={{
                      textTransform: 'none',
                      bgcolor: accent,
                      '&:hover': { bgcolor: alpha(accent, 0.85) },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                  <Divider
                    orientation='vertical'
                    flexItem
                    className={classes.toolbarDivider}
                    sx={{ mx: 0.5 }}
                  />
                </>
              )}
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* ── Table ── */}
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable
              columns={columns}
              data={filtered}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ══ New / Edit Dialog ══════════════════════════════════════════════════ */}
      <Dialog
        open={editOpen}
        onClose={closeDialog}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Header banner */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${accent} 0%, ${gradientEnd} 100%)`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: '#fff', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              {editingRow ? `Edit ${title}` : `New ${title}`}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              {editingRow
                ? `Editing "${editingRow.name}"`
                : `Configure a reusable ${title.toLowerCase()}`}
            </Typography>
          </Box>
        </Box>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* ── Basic Info ── */}
            <TextField
              label='Name'
              size='small'
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='e.g. On Hold – Awaiting Customer'
            />

            <TextField
              label='Description'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder='Brief description of when to use this template'
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              <FormControl size='small' sx={{ flex: 1 }}>
                <InputLabel>Ticket Status</InputLabel>
                <Select
                  label='Ticket Status'
                  value={form.ticketStatus}
                  onChange={(e) => setForm((f) => ({ ...f, ticketStatus: e.target.value }))}
                >
                  {statusItems.length === 0 ? (
                    <MenuItem disabled value=''>
                      <em>No statuses configured</em>
                    </MenuItem>
                  ) : (
                    statusItems.map((s) => (
                      <MenuItem key={s.id} value={s.name} sx={{ fontSize: '0.82rem' }}>
                        {s.displayName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Active toggle */}
              <Box
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: form.active ? alpha('#16a34a', 0.4) : 'divider',
                  bgcolor: form.active ? alpha('#16a34a', 0.06) : 'grey.50',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  minWidth: 120,
                  '&:hover': { borderColor: form.active ? alpha('#16a34a', 0.6) : 'text.disabled' },
                }}
              >
                <Switch
                  size='small'
                  checked={form.active}
                  onChange={() => {}}
                  sx={{
                    pointerEvents: 'none',
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#16a34a',
                    },
                  }}
                />
                <Typography
                  variant='body2'
                  fontWeight={700}
                  fontSize='0.82rem'
                  color={form.active ? '#166534' : 'text.secondary'}
                >
                  {form.active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>

            {/* ── Comment (Customer Visible) ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: alpha(accent, 0.07),
                    borderRadius: 1,
                    border: `1px solid ${alpha(accent, 0.2)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      color: accent,
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                    }}
                  >
                    Comment (Customer Visible)
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label='Subject Line'
                  size='small'
                  fullWidth
                  value={form.subjectLine}
                  onChange={(e) => setForm((f) => ({ ...f, subjectLine: e.target.value }))}
                  placeholder='e.g. Your ticket is on hold pending your response'
                />
                <TextField
                  label='Description'
                  size='small'
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.commentDescription}
                  onChange={(e) => setForm((f) => ({ ...f, commentDescription: e.target.value }))}
                  placeholder='Template body visible to the customer…'
                />

                {/* Boolean options 2×2 grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {boolFields.map(({ key, label, hint }) => {
                    const checked = form[key];
                    return (
                      <Box
                        key={key}
                        onClick={() => toggleBool(key)}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          bgcolor: checked ? alpha(accent, 0.06) : 'transparent',
                          border: '1px solid',
                          borderColor: checked ? alpha(accent, 0.28) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(accent, 0.05),
                            borderColor: alpha(accent, 0.2),
                          },
                        }}
                      >
                        <Checkbox
                          size='small'
                          checked={checked}
                          onChange={() => {}}
                          sx={{
                            p: 0,
                            mt: 0.1,
                            pointerEvents: 'none',
                            color: alpha(accent, 0.5),
                            '&.Mui-checked': { color: accent },
                          }}
                        />
                        <Box>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            fontSize='0.8rem'
                            lineHeight={1.3}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            fontSize='0.7rem'
                            lineHeight={1.4}
                          >
                            {hint}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: accent,
              '&:hover': { bgcolor: alpha(accent, 0.85) },
              minWidth: 120,
            }}
          >
            {editingRow ? 'Save Changes' : 'Add Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Delete Confirmation ════════════════════════════════════════════════ */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha('#dc2626', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeleteIcon sx={{ color: '#dc2626', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize='0.95rem'>
              Delete {title}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 1, pb: 1.5 }}>
          <Typography variant='body2' color='text.secondary'>
            Are you sure you want to delete{' '}
            <Typography component='span' fontWeight={700} color='text.primary' variant='body2'>
              {selectedRow?.name}
            </Typography>
            ? All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Resolution Template section ───────────────────────────────────────────────

const ACCENT_RES = '#d97706';

const EMPTY_RES_FORM: IConfigResolutionTemplate = {
  id: '',
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  application: '',
  applicationCategory: '',
  applicationSubCategory: '',
  receivedCustomerInformation: false,
  recurringIssue: false,
  rootCauseIdentified: false,
  rootCause: '',
  resolutionCode: '',
  resolution: '',
  resolutionInternalNote: '',
};

interface ResolutionSectionProps {
  rows: IConfigResolutionTemplate[];
  onSave: (next: IConfigResolutionTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
  applications: { id: string; name: string }[];
  applicationCategories: { id: string; applicationName: string; categoryName: string }[];
  applicationSubCategories: {
    id: string;
    applicationCategoryName: string;
    subCategoryName: string;
  }[];
}

const ResolutionSection = ({
  rows,
  onSave,
  statusItems,
  applications,
  applicationCategories,
  applicationSubCategories,
}: ResolutionSectionProps) => {
  const { classes } = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.ticketStatus.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigResolutionTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<IConfigResolutionTemplate>({ ...EMPTY_RES_FORM });

  const filteredCategories = applicationCategories.filter(
    (c) => !form.application || c.applicationName === form.application,
  );
  const filteredSubCategories = applicationSubCategories.filter(
    (s) => !form.applicationCategory || s.applicationCategoryName === form.applicationCategory,
  );

  useEffect(() => {
    if (!editOpen) return;
    setForm(editingRow ? { ...editingRow } : { ...EMPTY_RES_FORM });
  }, [editOpen, editingRow]);

  const openNew = () => {
    setEditingRow(null);
    setEditOpen(true);
  };
  const openEdit = () => {
    if (selectedRow) {
      setEditingRow(selectedRow);
      setEditOpen(true);
    }
  };
  const closeDialog = () => {
    setEditOpen(false);
    setEditingRow(null);
  };

  const setF = <K extends keyof IConfigResolutionTemplate>(
    key: K,
    value: IConfigResolutionTemplate[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    let next: IConfigResolutionTemplate[];
    if (editingRow) {
      next = rows.map((r) => (r.id === editingRow.id ? { ...form, id: editingRow.id } : r));
      setSelectedId(editingRow.id);
    } else {
      const n = { ...form, id: `res_${Date.now()}` };
      next = [...rows, n];
      setSelectedId(n.id);
    }
    onSave(next);
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const BoolChip = (v: unknown): React.ReactNode =>
    Boolean(v) ? (
      <Chip
        label='Yes'
        size='small'
        sx={{
          bgcolor: alpha(ACCENT_RES, 0.12),
          color: ACCENT_RES,
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 20,
          borderRadius: '6px',
        }}
      />
    ) : (
      <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
        —
      </Typography>
    );

  const columns: Column<IConfigResolutionTemplate>[] = [
    { id: 'name', label: 'Name', minWidth: 150, format: mkCell(true) },
    { id: 'description', label: 'Description', minWidth: 160, format: TruncCell },
    { id: 'active', label: 'Active', minWidth: 80, format: ActiveCell },
    { id: 'ticketStatus', label: 'Ticket Status', minWidth: 120, format: mkCell() },
    { id: 'application', label: 'Application', minWidth: 130, format: mkCell() },
    { id: 'applicationCategory', label: 'Application Category', minWidth: 160, format: mkCell() },
    {
      id: 'applicationSubCategory',
      label: 'Application Sub-Category',
      minWidth: 180,
      format: mkCell(),
    },
    {
      id: 'receivedCustomerInformation',
      label: 'Received Customer Info',
      minWidth: 170,
      format: BoolChip,
    },
    { id: 'recurringIssue', label: 'Recurring Issue', minWidth: 130, format: BoolChip },
    { id: 'rootCauseIdentified', label: 'Root Cause Identified', minWidth: 160, format: BoolChip },
    { id: 'rootCause', label: 'Root Cause', minWidth: 150, format: TruncCell },
    { id: 'resolutionCode', label: 'Resolution Code', minWidth: 130, format: mkCell() },
    { id: 'resolution', label: 'Resolution', minWidth: 160, format: TruncCell },
    {
      id: 'resolutionInternalNote',
      label: 'Resolution Internal Note',
      minWidth: 190,
      format: TruncCell,
    },
  ];

  const BOOL_OPTIONS: {
    key: 'receivedCustomerInformation' | 'recurringIssue' | 'rootCauseIdentified';
    label: string;
    hint: string;
  }[] = [
    {
      key: 'receivedCustomerInformation',
      label: 'Received Customer Information',
      hint: 'Customer provided sufficient details',
    },
    { key: 'recurringIssue', label: 'Recurring Issue', hint: 'This issue has occurred before' },
    {
      key: 'rootCauseIdentified',
      label: 'Root Cause Identified',
      hint: 'Root cause has been determined',
    },
  ];

  return (
    <>
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: ACCENT_RES,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCopyIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Resolution Template</Typography>
              <Typography className={classes.sectionSubtitle}>
                Define reusable resolution templates with root cause and resolution details
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* Toolbar */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow ? (
                <Tooltip title='Add new resolution template'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openNew}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_RES,
                      '&:hover': { bgcolor: alpha(ACCENT_RES, 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<EditIcon />}
                    onClick={openEdit}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_RES,
                      '&:hover': { bgcolor: alpha(ACCENT_RES, 0.85) },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                  <Divider
                    orientation='vertical'
                    flexItem
                    className={classes.toolbarDivider}
                    sx={{ mx: 0.5 }}
                  />
                </>
              )}
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* Table */}
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable
              columns={columns}
              data={filtered}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ── New / Edit Dialog ── */}
      <Dialog
        open={editOpen}
        onClose={closeDialog}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${ACCENT_RES} 0%, #b45309 100%)`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCopyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              {editingRow ? 'Edit Resolution Template' : 'New Resolution Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              {editingRow
                ? `Editing "${editingRow.name}"`
                : 'Configure a reusable resolution template'}
            </Typography>
          </Box>
        </Box>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Basic Info */}
            <TextField
              label='Name'
              size='small'
              fullWidth
              required
              value={form.name}
              onChange={(e) => setF('name', e.target.value)}
              placeholder='e.g. Hardware Fault Resolution'
            />

            <TextField
              label='Description'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setF('description', e.target.value)}
              placeholder='Brief description of this resolution template'
            />

            {/* Status + Active */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              <FormControl size='small' sx={{ flex: 1 }}>
                <InputLabel>Ticket Status</InputLabel>
                <Select
                  label='Ticket Status'
                  value={form.ticketStatus}
                  onChange={(e) => setF('ticketStatus', e.target.value)}
                >
                  {statusItems.length === 0 ? (
                    <MenuItem disabled value=''>
                      <em>No statuses configured</em>
                    </MenuItem>
                  ) : (
                    statusItems.map((s) => (
                      <MenuItem key={s.id} value={s.name} sx={{ fontSize: '0.82rem' }}>
                        {s.displayName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Box
                onClick={() => setF('active', !form.active)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  minWidth: 120,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  borderColor: form.active ? alpha('#16a34a', 0.4) : 'divider',
                  bgcolor: form.active ? alpha('#16a34a', 0.06) : 'grey.50',
                  '&:hover': { borderColor: form.active ? alpha('#16a34a', 0.6) : 'text.disabled' },
                }}
              >
                <Switch
                  size='small'
                  checked={form.active}
                  onChange={() => {}}
                  sx={{
                    pointerEvents: 'none',
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#16a34a',
                    },
                  }}
                />
                <Typography
                  variant='body2'
                  fontWeight={700}
                  fontSize='0.82rem'
                  color={form.active ? '#166534' : 'text.secondary'}
                >
                  {form.active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>

            {/* Application + Category */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size='small' sx={{ flex: 1 }}>
                <InputLabel>Application</InputLabel>
                <Select
                  label='Application'
                  value={form.application}
                  onChange={(e) => {
                    setF('application', e.target.value);
                    setF('applicationCategory', '');
                    setF('applicationSubCategory', '');
                  }}
                >
                  {applications.length === 0 ? (
                    <MenuItem disabled value=''>
                      <em>No applications configured</em>
                    </MenuItem>
                  ) : (
                    applications.map((a) => (
                      <MenuItem key={a.id} value={a.name} sx={{ fontSize: '0.82rem' }}>
                        {a.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ flex: 1 }} disabled={!form.application}>
                <InputLabel>Application Category</InputLabel>
                <Select
                  label='Application Category'
                  value={form.applicationCategory}
                  onChange={(e) => {
                    setF('applicationCategory', e.target.value);
                    setF('applicationSubCategory', '');
                  }}
                >
                  {filteredCategories.length === 0 ? (
                    <MenuItem disabled value=''>
                      <em>{form.application ? 'No categories' : 'Select application first'}</em>
                    </MenuItem>
                  ) : (
                    filteredCategories.map((c) => (
                      <MenuItem key={c.id} value={c.categoryName} sx={{ fontSize: '0.82rem' }}>
                        {c.categoryName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Sub-Category */}
            <FormControl size='small' fullWidth disabled={!form.applicationCategory}>
              <InputLabel>Application Sub-Category</InputLabel>
              <Select
                label='Application Sub-Category'
                value={form.applicationSubCategory}
                onChange={(e) => setF('applicationSubCategory', e.target.value)}
              >
                {filteredSubCategories.length === 0 ? (
                  <MenuItem disabled value=''>
                    <em>
                      {form.applicationCategory ? 'No sub-categories' : 'Select category first'}
                    </em>
                  </MenuItem>
                ) : (
                  filteredSubCategories.map((s) => (
                    <MenuItem key={s.id} value={s.subCategoryName} sx={{ fontSize: '0.82rem' }}>
                      {s.subCategoryName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Resolution Details divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: alpha(ACCENT_RES, 0.07),
                  borderRadius: 1,
                  border: `1px solid ${alpha(ACCENT_RES, 0.2)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    color: ACCENT_RES,
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}
                >
                  Resolution Details
                </Typography>
              </Box>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            {/* Boolean checkboxes — 3 across */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 1,
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {BOOL_OPTIONS.map(({ key, label, hint }) => {
                const checked = form[key];
                return (
                  <Box
                    key={key}
                    onClick={() => setF(key, !checked)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      bgcolor: checked ? alpha(ACCENT_RES, 0.06) : 'transparent',
                      border: '1px solid',
                      borderColor: checked ? alpha(ACCENT_RES, 0.28) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(ACCENT_RES, 0.05),
                        borderColor: alpha(ACCENT_RES, 0.2),
                      },
                    }}
                  >
                    <Checkbox
                      size='small'
                      checked={checked}
                      onChange={() => {}}
                      sx={{
                        p: 0,
                        mt: 0.1,
                        pointerEvents: 'none',
                        color: alpha(ACCENT_RES, 0.5),
                        '&.Mui-checked': { color: ACCENT_RES },
                      }}
                    />
                    <Box>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        fontSize='0.78rem'
                        lineHeight={1.3}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontSize='0.68rem'
                        lineHeight={1.4}
                      >
                        {hint}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Root Cause */}
            <TextField
              label='Root Cause'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.rootCause}
              onChange={(e) => setF('rootCause', e.target.value)}
              placeholder='Describe the identified root cause…'
            />

            {/* Resolution Code + Resolution */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='Resolution Code'
                size='small'
                sx={{ flex: '0 0 160px' }}
                value={form.resolutionCode}
                onChange={(e) => setF('resolutionCode', e.target.value)}
                placeholder='e.g. HW-FAULT-01'
              />
              <TextField
                label='Resolution'
                size='small'
                fullWidth
                multiline
                minRows={1}
                value={form.resolution}
                onChange={(e) => setF('resolution', e.target.value)}
                placeholder='Brief resolution summary…'
              />
            </Box>

            {/* Resolution Internal Note */}
            <TextField
              label='Resolution Internal Note'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.resolutionInternalNote}
              onChange={(e) => setF('resolutionInternalNote', e.target.value)}
              placeholder='Internal notes for agents only…'
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: ACCENT_RES,
              '&:hover': { bgcolor: alpha(ACCENT_RES, 0.85) },
              minWidth: 120,
            }}
          >
            {editingRow ? 'Save Changes' : 'Add Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha('#dc2626', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeleteIcon sx={{ color: '#dc2626', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize='0.95rem'>
              Delete Resolution Template
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 1, pb: 1.5 }}>
          <Typography variant='body2' color='text.secondary'>
            Are you sure you want to delete{' '}
            <Typography component='span' fontWeight={700} color='text.primary' variant='body2'>
              {selectedRow?.name}
            </Typography>
            ? All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Internal Note Template overrides ─────────────────────────────────────────

const INTERNAL_NOTE_BOOL_FIELDS: { key: BoolFormKey; label: string; hint: string }[] = [
  {
    key: 'internalNote',
    label: 'Comment (Customer Visible)',
    hint: 'Comment visible to the customer',
  },
  { key: 'notifyAssigneesOnly', label: 'Notify Assignees Only', hint: 'Limit email notifications' },
  { key: 'selfNote', label: 'Self Note', hint: 'Only visible to you' },
  {
    key: 'appendToResolution',
    label: 'Append to Resolution',
    hint: 'Add content to resolution notes',
  },
];

// ── Time Entry Template section ───────────────────────────────────────────────

const ACCENT_TE = '#be185d';

const ACTIVITY_OPTIONS = [
  'Analysis',
  'Development',
  'Testing',
  'Meeting',
  'Support',
  'Documentation',
  'Deployment',
  'Training',
  'Administration',
  'Other',
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = (typeof DAYS)[number];

type DayTime = { h: number; m: number };

const toMonday = (d: Dayjs): Dayjs => {
  const dow = d.day();
  const offset = dow === 0 ? -6 : 1 - dow;
  return d.add(offset, 'day').startOf('day');
};

const fmtHoursDecimal = (h: number): string => {
  if (!h) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

type TimeEntryLineForm = {
  id: string;
  billingCode: string;
  activityTask: string;
  nonBillable: boolean;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
};

const EMPTY_LINE: TimeEntryLineForm = {
  id: '',
  billingCode: '',
  activityTask: '',
  nonBillable: false,
  mon: 0,
  tue: 0,
  wed: 0,
  thu: 0,
  fri: 0,
  sat: 0,
  sun: 0,
};

const EMPTY_DAY_TIMES: Record<DayKey, DayTime> = {
  mon: { h: 0, m: 0 },
  tue: { h: 0, m: 0 },
  wed: { h: 0, m: 0 },
  thu: { h: 0, m: 0 },
  fri: { h: 0, m: 0 },
  sat: { h: 0, m: 0 },
  sun: { h: 0, m: 0 },
};

type TimeEntryTemplateForm = {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  weekStartDate: string;
  entries: TimeEntryLineForm[];
  externalComment: string;
  internalComment: string;
};

const EMPTY_TE_FORM: TimeEntryTemplateForm = {
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  weekStartDate: '',
  entries: [],
  externalComment: '',
  internalComment: '',
};

interface TimeEntrySectionProps {
  rows: IConfigTimeEntryTemplate[];
  onSave: (next: IConfigTimeEntryTemplate[]) => void;
  statusItems: { id: string; name: string; displayName: string }[];
  billingCodes: { id: string; code: string; description: string }[];
}

const TimeEntrySection = ({ rows, onSave, statusItems, billingCodes }: TimeEntrySectionProps) => {
  const { classes } = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.ticketStatus.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigTimeEntryTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<TimeEntryTemplateForm>({ ...EMPTY_TE_FORM });

  // Line add/edit state
  const [showLineForm, setShowLineForm] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineForm, setLineForm] = useState<TimeEntryLineForm>({ ...EMPTY_LINE });
  const [dayTimes, setDayTimes] = useState<Record<DayKey, DayTime>>({ ...EMPTY_DAY_TIMES });

  // Computed week dates from form.weekStartDate
  const weekStart = form.weekStartDate ? dayjs(form.weekStartDate) : toMonday(dayjs());
  const weekDates = DAYS.map((_, i) => weekStart.add(i, 'day'));

  // Summary metrics
  const totalHours = form.entries.reduce(
    (s, e) => s + DAYS.reduce((t, d) => t + (e[d] ?? 0), 0),
    0,
  );
  const nonBillableHours = form.entries
    .filter((e) => e.nonBillable)
    .reduce((s, e) => s + DAYS.reduce((t, d) => t + (e[d] ?? 0), 0), 0);
  const billableHours = totalHours - nonBillableHours;
  const pctBillable = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  useEffect(() => {
    if (!editOpen) return;
    if (editingRow) {
      setForm({
        name: editingRow.name,
        description: editingRow.description,
        active: editingRow.active,
        ticketStatus: editingRow.ticketStatus,
        weekStartDate: editingRow.weekStartDate,
        entries: editingRow.entries.map((e) => ({ ...e })),
        externalComment: editingRow.externalComment,
        internalComment: editingRow.internalComment,
      });
    } else {
      setForm({ ...EMPTY_TE_FORM });
    }
    setShowLineForm(false);
    setEditingLineId(null);
    setLineForm({ ...EMPTY_LINE });
    setDayTimes({ ...EMPTY_DAY_TIMES });
  }, [editOpen, editingRow]);

  const openNew = () => {
    setEditingRow(null);
    setEditOpen(true);
  };
  const openEdit = () => {
    if (selectedRow) {
      setEditingRow(selectedRow);
      setEditOpen(true);
    }
  };
  const closeDialog = () => {
    setEditOpen(false);
    setEditingRow(null);
  };
  const setF = <K extends keyof TimeEntryTemplateForm>(key: K, value: TimeEntryTemplateForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openAddLine = () => {
    setEditingLineId(null);
    setLineForm({ ...EMPTY_LINE });
    setDayTimes({ ...EMPTY_DAY_TIMES });
    setShowLineForm(true);
  };

  const openEditLine = (line: TimeEntryLineForm) => {
    setEditingLineId(line.id);
    setLineForm({ ...line });
    const dt: Record<DayKey, DayTime> = { ...EMPTY_DAY_TIMES };
    DAYS.forEach((d) => {
      const total = line[d] ?? 0;
      const h = Math.floor(total);
      const rawM = Math.round((total - h) * 60);
      const snap = [0, 15, 30, 45].reduce(
        (prev, cur) => (Math.abs(cur - rawM) < Math.abs(prev - rawM) ? cur : prev),
        0,
      );
      dt[d] = { h, m: snap };
    });
    setDayTimes(dt);
    setShowLineForm(true);
  };

  const cancelLine = () => {
    setShowLineForm(false);
    setEditingLineId(null);
    setLineForm({ ...EMPTY_LINE });
    setDayTimes({ ...EMPTY_DAY_TIMES });
  };

  const saveLine = () => {
    const resolved: TimeEntryLineForm = { ...lineForm };
    DAYS.forEach((d) => {
      resolved[d] = (dayTimes[d]?.h ?? 0) + (dayTimes[d]?.m ?? 0) / 60;
    });
    if (editingLineId) {
      setF(
        'entries',
        form.entries.map((e) => (e.id === editingLineId ? { ...resolved, id: editingLineId } : e)),
      );
    } else {
      setF('entries', [...form.entries, { ...resolved, id: `line_${Date.now()}` }]);
    }
    cancelLine();
  };

  const deleteLine = (id: string) =>
    setF(
      'entries',
      form.entries.filter((e) => e.id !== id),
    );

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const template: IConfigTimeEntryTemplate = {
      id: editingRow ? editingRow.id : `te_${Date.now()}`,
      name: form.name,
      description: form.description,
      active: form.active,
      ticketStatus: form.ticketStatus,
      weekStartDate: form.weekStartDate,
      entries: form.entries,
      externalComment: form.externalComment,
      internalComment: form.internalComment,
    };
    let next: IConfigTimeEntryTemplate[];
    if (editingRow) {
      next = rows.map((r) => (r.id === editingRow.id ? template : r));
      setSelectedId(editingRow.id);
    } else {
      next = [...rows, template];
      setSelectedId(template.id);
    }
    onSave(next);
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigTimeEntryTemplate>[] = [
    { id: 'name', label: 'Name', minWidth: 150, format: mkCell(true) },
    { id: 'description', label: 'Description', minWidth: 160, format: TruncCell },
    { id: 'active', label: 'Active', minWidth: 80, format: ActiveCell },
    { id: 'ticketStatus', label: 'Ticket Status', minWidth: 120, format: mkCell() },
    {
      id: 'weekStartDate',
      label: 'Week Start',
      minWidth: 130,
      format: (v): React.ReactNode => {
        const s = String(v || '');
        if (!s)
          return (
            <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
              —
            </Typography>
          );
        return (
          <Typography variant='body2' fontSize='0.82rem'>
            {dayjs(s).format('DD/MM/YYYY')}
          </Typography>
        );
      },
    },
    {
      id: 'entries',
      label: 'Total Hours',
      minWidth: 110,
      format: (v): React.ReactNode => {
        const ents = (v as IConfigTimeEntryLine[]) ?? [];
        const tot = ents.reduce(
          (s, e) =>
            s + DAYS.reduce((t, d) => t + ((e as unknown as Record<string, number>)[d] ?? 0), 0),
          0,
        );
        return (
          <Typography
            variant='body2'
            fontSize='0.82rem'
            fontWeight={600}
            color={tot > 0 ? ACCENT_TE : 'text.disabled'}
          >
            {fmtHoursDecimal(tot)}
          </Typography>
        );
      },
    },
  ];

  const DayHeader = ({ idx }: { idx: number }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant='caption'
        fontWeight={700}
        fontSize='0.7rem'
        color='text.secondary'
        display='block'
        sx={{ textTransform: 'uppercase' }}
      >
        {weekDates[idx].format('ddd')}
      </Typography>
      <Typography variant='caption' fontSize='0.65rem' color='text.disabled'>
        {weekDates[idx].format('DD/MM/YYYY')}
      </Typography>
    </Box>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 0.5 }}>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          bgcolor: alpha(ACCENT_TE, 0.07),
          borderRadius: 1,
          border: `1px solid ${alpha(ACCENT_TE, 0.2)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: 0.8,
            color: ACCENT_TE,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );

  return (
    <>
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: ACCENT_TE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCopyIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Time Entry Template</Typography>
              <Typography className={classes.sectionSubtitle}>
                Define reusable weekly time entry templates with billing codes and activity defaults
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow ? (
                <Tooltip title='Add new time entry template'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={openNew}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_TE,
                      '&:hover': { bgcolor: alpha(ACCENT_TE, 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<EditIcon />}
                    onClick={openEdit}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_TE,
                      '&:hover': { bgcolor: alpha(ACCENT_TE, 0.85) },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                  <Divider
                    orientation='vertical'
                    flexItem
                    className={classes.toolbarDivider}
                    sx={{ mx: 0.5 }}
                  />
                </>
              )}
              <TextField
                size='small'
                placeholder='Search…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable
              columns={columns}
              data={filtered}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedId ?? undefined}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* ══ New / Edit Dialog ══════════════════════════════════════════════════ */}
      <Dialog
        open={editOpen}
        onClose={closeDialog}
        maxWidth='lg'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${ACCENT_TE} 0%, #9d174d 100%)`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCopyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              {editingRow ? 'Edit Time Entry Template' : 'New Time Entry Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              {editingRow
                ? `Editing "${editingRow.name}"`
                : 'Configure a reusable weekly time entry template'}
            </Typography>
          </Box>
        </Box>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* ── Basic Info ── */}
            <TextField
              label='Name'
              size='small'
              fullWidth
              required
              value={form.name}
              onChange={(e) => setF('name', e.target.value)}
              placeholder='e.g. Sprint Week – Development'
            />
            <TextField
              label='Description'
              size='small'
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setF('description', e.target.value)}
              placeholder='Brief description of this time entry template'
            />

            {/* ── Status + Week + Active ── */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <FormControl size='small' sx={{ flex: 1, minWidth: 160 }}>
                <InputLabel>Ticket Status</InputLabel>
                <Select
                  label='Ticket Status'
                  value={form.ticketStatus}
                  onChange={(e) => setF('ticketStatus', e.target.value)}
                >
                  {statusItems.length === 0 ? (
                    <MenuItem disabled value=''>
                      <em>No statuses configured</em>
                    </MenuItem>
                  ) : (
                    statusItems.map((s) => (
                      <MenuItem key={s.id} value={s.name} sx={{ fontSize: '0.82rem' }}>
                        {s.displayName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Week Starting (Monday)'
                  value={form.weekStartDate ? dayjs(form.weekStartDate) : null}
                  onChange={(d: Dayjs | null) => {
                    if (d && d.isValid()) setF('weekStartDate', toMonday(d).format('YYYY-MM-DD'));
                    else setF('weekStartDate', '');
                  }}
                  slotProps={{ textField: { size: 'small', sx: { flex: 1, minWidth: 200 } } }}
                />
              </LocalizationProvider>

              <Box
                onClick={() => setF('active', !form.active)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  minWidth: 120,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  borderColor: form.active ? alpha('#16a34a', 0.4) : 'divider',
                  bgcolor: form.active ? alpha('#16a34a', 0.06) : 'grey.50',
                  '&:hover': { borderColor: form.active ? alpha('#16a34a', 0.6) : 'text.disabled' },
                }}
              >
                <Switch
                  size='small'
                  checked={form.active}
                  onChange={() => {}}
                  sx={{
                    pointerEvents: 'none',
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: '#16a34a',
                    },
                  }}
                />
                <Typography
                  variant='body2'
                  fontWeight={700}
                  fontSize='0.82rem'
                  color={form.active ? '#166534' : 'text.secondary'}
                >
                  {form.active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>

            {/* ── Time Summary ── */}
            <SectionLabel label='Time Summary' />

            {/* Add / Edit Line form */}
            {showLineForm && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(ACCENT_TE, 0.04),
                  borderRadius: 2,
                  border: `1px solid ${alpha(ACCENT_TE, 0.2)}`,
                }}
              >
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color={ACCENT_TE}
                  sx={{
                    mb: 1.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                    letterSpacing: 0.8,
                  }}
                >
                  {editingLineId ? 'Edit Line' : 'Add Line'}
                </Typography>
                {/* Billing + Activity + Non-Billable */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    mb: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <FormControl size='small' sx={{ minWidth: 160 }} disabled={lineForm.nonBillable}>
                    <InputLabel>Billing Code</InputLabel>
                    <Select
                      label='Billing Code'
                      value={lineForm.billingCode}
                      onChange={(e) => setLineForm((f) => ({ ...f, billingCode: e.target.value }))}
                    >
                      <MenuItem value='' sx={{ fontSize: '0.82rem' }}>
                        <em>None</em>
                      </MenuItem>
                      {billingCodes.map((b) => (
                        <MenuItem key={b.id} value={b.code} sx={{ fontSize: '0.82rem' }}>
                          {b.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size='small' sx={{ minWidth: 160 }}>
                    <InputLabel>Activity / Task</InputLabel>
                    <Select
                      label='Activity / Task'
                      value={lineForm.activityTask}
                      onChange={(e) => setLineForm((f) => ({ ...f, activityTask: e.target.value }))}
                    >
                      <MenuItem value='' sx={{ fontSize: '0.82rem' }}>
                        <em>Select…</em>
                      </MenuItem>
                      {ACTIVITY_OPTIONS.map((a) => (
                        <MenuItem key={a} value={a} sx={{ fontSize: '0.82rem' }}>
                          {a}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box
                    onClick={() =>
                      setLineForm((f) => ({
                        ...f,
                        nonBillable: !f.nonBillable,
                        billingCode: !f.nonBillable ? '' : f.billingCode,
                      }))
                    }
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.5,
                      border: '1px solid',
                      cursor: 'pointer',
                      userSelect: 'none',
                      bgcolor: lineForm.nonBillable ? alpha(ACCENT_TE, 0.06) : 'grey.50',
                      borderColor: lineForm.nonBillable ? alpha(ACCENT_TE, 0.3) : 'divider',
                    }}
                  >
                    <Checkbox
                      size='small'
                      checked={lineForm.nonBillable}
                      onChange={() => {}}
                      sx={{
                        p: 0,
                        pointerEvents: 'none',
                        color: alpha(ACCENT_TE, 0.5),
                        '&.Mui-checked': { color: ACCENT_TE },
                      }}
                    />
                    <Typography variant='body2' fontWeight={600} fontSize='0.8rem'>
                      Non-Billable
                    </Typography>
                  </Box>
                </Box>
                {/* Day inputs – 7-column grid */}
                <Box
                  sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1.5 }}
                >
                  {DAYS.map((d, i) => (
                    <Box
                      key={d}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='caption'
                        fontWeight={700}
                        fontSize='0.68rem'
                        color='text.secondary'
                        sx={{ textTransform: 'uppercase' }}
                      >
                        {weekDates[i].format('ddd')}
                      </Typography>
                      <Typography variant='caption' fontSize='0.63rem' color='text.disabled'>
                        {weekDates[i].format('DD/MM')}
                      </Typography>
                      <TextField
                        size='small'
                        type='number'
                        label='h'
                        value={dayTimes[d].h === 0 ? '' : dayTimes[d].h}
                        onChange={(e) => {
                          const h = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                          setDayTimes((prev) => ({ ...prev, [d]: { ...prev[d], h } }));
                        }}
                        slotProps={{ input: { inputProps: { min: 0, max: 23 } } }}
                        sx={{
                          width: '100%',
                          '& input': { textAlign: 'center', px: '4px', fontSize: '0.8rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                        }}
                      />
                      <FormControl size='small' fullWidth>
                        <InputLabel sx={{ fontSize: '0.75rem' }}>m</InputLabel>
                        <Select
                          label='m'
                          value={dayTimes[d].m}
                          onChange={(e) =>
                            setDayTimes((prev) => ({
                              ...prev,
                              [d]: { ...prev[d], m: Number(e.target.value) },
                            }))
                          }
                          sx={{
                            fontSize: '0.8rem',
                            '& .MuiSelect-select': { py: '6px', textAlign: 'center' },
                          }}
                        >
                          {[0, 15, 30, 45].map((min) => (
                            <MenuItem key={min} value={min} sx={{ fontSize: '0.8rem' }}>
                              {min.toString().padStart(2, '0')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size='small' onClick={cancelLine} sx={{ textTransform: 'none' }}>
                    Cancel
                  </Button>
                  <Button
                    size='small'
                    variant='contained'
                    onClick={saveLine}
                    sx={{
                      textTransform: 'none',
                      bgcolor: ACCENT_TE,
                      '&:hover': { bgcolor: alpha(ACCENT_TE, 0.85) },
                    }}
                  >
                    {editingLineId ? 'Update Line' : 'Add Line'}
                  </Button>
                </Box>
              </Box>
            )}

            {!showLineForm && (
              <Button
                size='small'
                startIcon={<AddIcon />}
                onClick={openAddLine}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  color: ACCENT_TE,
                  '&:hover': { bgcolor: alpha(ACCENT_TE, 0.06) },
                }}
              >
                Add Line
              </Button>
            )}

            {/* ── Weekly entries table ── */}
            <TableContainer
              component={Paper}
              variant='outlined'
              sx={{ borderRadius: 1.5, overflow: 'auto' }}
            >
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(ACCENT_TE, 0.04) }}>
                    {(['Actions', 'Billing Code', 'Activity / Task'] as const).map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          p: '6px 8px',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          borderBottom: `2px solid ${alpha(ACCENT_TE, 0.2)}`,
                          minWidth: h === 'Actions' ? 72 : 130,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                    {DAYS.map((d, i) => (
                      <TableCell
                        key={d}
                        sx={{
                          p: '4px 6px',
                          textAlign: 'center',
                          borderBottom: `2px solid ${alpha(ACCENT_TE, 0.2)}`,
                          minWidth: 80,
                        }}
                      >
                        <DayHeader idx={i} />
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        p: '6px 8px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        color: 'text.secondary',
                        textAlign: 'right',
                        borderBottom: `2px solid ${alpha(ACCENT_TE, 0.2)}`,
                        minWidth: 70,
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.entries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        sx={{
                          textAlign: 'center',
                          py: 3,
                          color: 'text.disabled',
                          fontSize: '0.82rem',
                        }}
                      >
                        No time entries yet — click "Add Line" to start
                      </TableCell>
                    </TableRow>
                  ) : (
                    form.entries.map((entry) => {
                      const rowTotal = DAYS.reduce((s, d) => s + (entry[d] ?? 0), 0);
                      return (
                        <TableRow
                          key={entry.id}
                          hover
                          sx={{
                            bgcolor:
                              editingLineId === entry.id ? alpha(ACCENT_TE, 0.04) : 'inherit',
                          }}
                        >
                          <TableCell sx={{ p: '2px 4px' }}>
                            <Box sx={{ display: 'flex' }}>
                              <IconButton
                                size='small'
                                onClick={() => openEditLine(entry)}
                                sx={{
                                  color: ACCENT_TE,
                                  '&:hover': { bgcolor: alpha(ACCENT_TE, 0.1) },
                                }}
                              >
                                <EditIcon sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => deleteLine(entry.id)}
                                sx={{
                                  color: '#dc2626',
                                  '&:hover': { bgcolor: alpha('#dc2626', 0.1) },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ p: '4px 8px' }}>
                            {entry.nonBillable ? (
                              <Chip
                                label='Non-Billable'
                                size='small'
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(ACCENT_TE, 0.1),
                                  color: ACCENT_TE,
                                }}
                              />
                            ) : (
                              <Typography variant='body2' fontSize='0.8rem' fontWeight={500}>
                                {entry.billingCode || '—'}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ p: '4px 8px' }}>
                            <Typography variant='body2' fontSize='0.8rem'>
                              {entry.activityTask || '—'}
                            </Typography>
                          </TableCell>
                          {DAYS.map((d) => (
                            <TableCell key={d} sx={{ p: '4px 6px', textAlign: 'center' }}>
                              <Typography
                                variant='body2'
                                fontSize='0.8rem'
                                color={entry[d] > 0 ? 'text.primary' : 'text.disabled'}
                              >
                                {entry[d] > 0 ? fmtHoursDecimal(entry[d]) : '—'}
                              </Typography>
                            </TableCell>
                          ))}
                          <TableCell sx={{ p: '4px 8px', textAlign: 'right' }}>
                            <Typography
                              variant='body2'
                              fontSize='0.8rem'
                              fontWeight={700}
                              color={ACCENT_TE}
                            >
                              {fmtHoursDecimal(rowTotal)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ── Summary metrics ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
              {[
                {
                  label: 'Total Hours',
                  value: fmtHoursDecimal(totalHours),
                  color: 'text.primary' as const,
                },
                {
                  label: 'Non-Billable Hours',
                  value: fmtHoursDecimal(nonBillableHours),
                  color: '#dc2626',
                },
                {
                  label: 'Billable Hours',
                  value: fmtHoursDecimal(billableHours),
                  color: '#16a34a',
                },
                {
                  label: '% Billable Hours',
                  value: totalHours > 0 ? `${pctBillable}%` : '—',
                  color: pctBillable >= 80 ? '#16a34a' : pctBillable >= 50 ? '#ca8a04' : '#dc2626',
                },
              ].map(({ label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant='h6' fontWeight={800} fontSize='1.1rem' color={color}>
                    {value}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' fontSize='0.72rem'>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* ── Comments ── */}
            <SectionLabel label='Comments' />

            <TextField
              label='External Comment'
              size='small'
              fullWidth
              multiline
              minRows={3}
              value={form.externalComment}
              onChange={(e) => setF('externalComment', e.target.value)}
              placeholder='Comment visible to the customer…'
              helperText='Visible to the customer on the ticket'
              slotProps={{ formHelperText: { sx: { mx: 0, mt: 0.5, fontSize: '0.72rem' } } }}
            />
            <TextField
              label='Internal Comment'
              size='small'
              fullWidth
              multiline
              minRows={3}
              value={form.internalComment}
              onChange={(e) => setF('internalComment', e.target.value)}
              placeholder='Internal note for agents only…'
              helperText='Only visible to agents and consultants'
              slotProps={{ formHelperText: { sx: { mx: 0, mt: 0.5, fontSize: '0.72rem' } } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: ACCENT_TE,
              '&:hover': { bgcolor: alpha(ACCENT_TE, 0.85) },
              minWidth: 120,
            }}
          >
            {editingRow ? 'Save Changes' : 'Add Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha('#dc2626', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeleteIcon sx={{ color: '#dc2626', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize='0.95rem'>
              Delete Time Entry Template
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>
        <DialogContent sx={{ px: 2.5, pt: 1, pb: 1.5 }}>
          <Typography variant='body2' color='text.secondary'>
            Are you sure you want to delete{' '}
            <Typography component='span' fontWeight={700} color='text.primary' variant='body2'>
              {selectedRow?.name}
            </Typography>
            ? All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Page root ─────────────────────────────────────────────────────────────────

const Templates = () => {
  const {
    ticketUpdateTemplates: tutApi,
    commentTemplates: ctApi,
    internalNoteTemplates: intApi,
    resolutionTemplates: resApi,
    timeEntryTemplates: teApi,
    statuses,
    categorization,
    saveSection,
  } = useConfiguration();
  const statusItems = statuses?.items ?? [];
  const applications = categorization?.applications ?? [];
  const applicationCategories = categorization?.applicationCategories ?? [];
  const applicationSubCategories = categorization?.applicationSubCategories ?? [];

  const [ticketUpdateRows, setTicketUpdateRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [commentRows, setCommentRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [internalNoteRows, setInternalNoteRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [resolutionRows, setResolutionRows] = useState<IConfigResolutionTemplate[]>([]);
  const [timeEntryRows, setTimeEntryRows] = useState<IConfigTimeEntryTemplate[]>([]);

  useEffect(() => {
    if (tutApi) setTicketUpdateRows(tutApi.items ?? []);
  }, [tutApi]);
  useEffect(() => {
    if (ctApi) setCommentRows(ctApi.items ?? []);
  }, [ctApi]);
  useEffect(() => {
    if (intApi) setInternalNoteRows(intApi.items ?? []);
  }, [intApi]);
  useEffect(() => {
    if (resApi) setResolutionRows(resApi.items ?? []);
  }, [resApi]);
  useEffect(() => {
    if (teApi) setTimeEntryRows(teApi.items ?? []);
  }, [teApi]);

  const saveTUT = (next: IConfigTicketUpdateTemplate[]) => {
    setTicketUpdateRows(next);
    saveSection('ticketUpdateTemplates', { items: next });
  };
  const saveCT = (next: IConfigTicketUpdateTemplate[]) => {
    setCommentRows(next);
    saveSection('commentTemplates', { items: next });
  };
  const saveINT = (next: IConfigTicketUpdateTemplate[]) => {
    setInternalNoteRows(next);
    saveSection('internalNoteTemplates', { items: next });
  };
  const saveRES = (next: IConfigResolutionTemplate[]) => {
    setResolutionRows(next);
    saveSection('resolutionTemplates', { items: next });
  };
  const saveTE = (next: IConfigTimeEntryTemplate[]) => {
    setTimeEntryRows(next);
    saveSection('timeEntryTemplates', { items: next });
  };

  // Collect all billing codes across all applications for the dropdown
  const billingCodes = applications.flatMap((a) => a.billingCodes ?? []);

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <TemplateSection
        title='Ticket Update Template'
        subtitle='Define reusable templates for ticket status updates and customer notifications'
        accent='#4f46e5'
        gradientEnd='#7c3aed'
        idPrefix='tut'
        Icon={FileCopyIcon}
        defaultExpanded
        rows={ticketUpdateRows}
        onSave={saveTUT}
        statusItems={statusItems}
      />
      <TemplateSection
        title='Comment Template'
        subtitle='Define reusable comment templates for internal notes and customer replies'
        accent='#0891b2'
        gradientEnd='#0e7490'
        idPrefix='ct'
        Icon={CommentIcon}
        rows={commentRows}
        onSave={saveCT}
        statusItems={statusItems}
      />
      <TemplateSection
        title='Internal Note Template'
        subtitle='Define reusable internal note templates with customer-visible comment options'
        accent='#059669'
        gradientEnd='#047857'
        idPrefix='int'
        Icon={CommentIcon}
        boolFields={INTERNAL_NOTE_BOOL_FIELDS}
        rows={internalNoteRows}
        onSave={saveINT}
        statusItems={statusItems}
      />
      <ResolutionSection
        rows={resolutionRows}
        onSave={saveRES}
        statusItems={statusItems}
        applications={applications}
        applicationCategories={applicationCategories}
        applicationSubCategories={applicationSubCategories}
      />
      <TimeEntrySection
        rows={timeEntryRows}
        onSave={saveTE}
        statusItems={statusItems}
        billingCodes={billingCodes}
      />
    </Box>
  );
};

export default Templates;
