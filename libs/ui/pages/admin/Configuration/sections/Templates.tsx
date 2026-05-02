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
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { IConfigTicketUpdateTemplate } from '@serviceops/interfaces';
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
    { id: 'internalNote', label: 'Internal Note', minWidth: 110, format: BoolCell },
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
                  {BOOL_FIELDS.map(({ key, label, hint }) => {
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

// ── Page root ─────────────────────────────────────────────────────────────────

const Templates = () => {
  const {
    ticketUpdateTemplates: tutApi,
    commentTemplates: ctApi,
    statuses,
    saveSection,
  } = useConfiguration();
  const statusItems = statuses?.items ?? [];

  const [ticketUpdateRows, setTicketUpdateRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [commentRows, setCommentRows] = useState<IConfigTicketUpdateTemplate[]>([]);

  useEffect(() => {
    if (tutApi) setTicketUpdateRows(tutApi.items ?? []);
  }, [tutApi]);

  useEffect(() => {
    if (ctApi) setCommentRows(ctApi.items ?? []);
  }, [ctApi]);

  const saveTUT = (next: IConfigTicketUpdateTemplate[]) => {
    setTicketUpdateRows(next);
    saveSection('ticketUpdateTemplates', { items: next });
  };

  const saveCT = (next: IConfigTicketUpdateTemplate[]) => {
    setCommentRows(next);
    saveSection('commentTemplates', { items: next });
  };

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
    </Box>
  );
};

export default Templates;
