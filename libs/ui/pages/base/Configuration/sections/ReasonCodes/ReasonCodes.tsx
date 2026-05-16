import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  Link,
  TextField,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Divider,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  IConfigPriorityChangeReasonCode,
  IConfigRoleChangeReasonCode,
  IConfigResolutionCode,
  IConfigCancellationReasonCode,
  IConfigReopenReasonCode,
  IConfigConversionReasonCode,
} from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';

const ACCENT = '#0f766e';

const EMPTY_FORM = { name: '', description: '' };

// ── Priority Change Reason Codes section ──────────────────────────────────────

const PriorityChangeReasonCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigPriorityChangeReasonCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigPriorityChangeReasonCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (apiRC?.priorityChangeReasonCodes) setRows(apiRC.priorityChangeReasonCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigPriorityChangeReasonCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: next,
      roleChangeReasonCodes: apiRC?.roleChangeReasonCodes ?? [],
      resolutionCodes: apiRC?.resolutionCodes ?? [],
      cancellationReasonCodes: apiRC?.cancellationReasonCodes ?? [],
      reopenReasonCodes: apiRC?.reopenReasonCodes ?? [],
      conversionReasonCodes: apiRC?.conversionReasonCodes ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigPriorityChangeReasonCode = { id: `prc_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigPriorityChangeReasonCode>[] = [
    {
      id: 'name',
      label: 'Priority Change Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CommentIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Priority Change Reason Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define reason codes used when changing the priority of a ticket
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new priority change reason code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT,
                    '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT,
                    '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CommentIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT}
        title='Priority Change Reason Code'
        subtitle='Define a reason code for priority change actions on tickets'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Priority Change Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Business Impact, Escalation Request'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this reason code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Priority Change Reason Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Role Change Reason Codes section ─────────────────────────────────────────

const ACCENT_ROLE = '#7c3aed';
const EMPTY_ROLE_FORM = { name: '', description: '' };

const RoleChangeReasonCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigRoleChangeReasonCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigRoleChangeReasonCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_ROLE_FORM);

  useEffect(() => {
    if (apiRC?.roleChangeReasonCodes) setRows(apiRC.roleChangeReasonCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_ROLE_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigRoleChangeReasonCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: apiRC?.priorityChangeReasonCodes ?? [],
      roleChangeReasonCodes: next,
      resolutionCodes: apiRC?.resolutionCodes ?? [],
      cancellationReasonCodes: apiRC?.cancellationReasonCodes ?? [],
      reopenReasonCodes: apiRC?.reopenReasonCodes ?? [],
      conversionReasonCodes: apiRC?.conversionReasonCodes ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigRoleChangeReasonCode = { id: `rrc_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigRoleChangeReasonCode>[] = [
    {
      id: 'name',
      label: 'Role Change Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_ROLE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ManageAccountsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Role Change Reason Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define reason codes used when changing the role of a user or assignee
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new role change reason code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_ROLE,
                    '&:hover': { bgcolor: alpha(ACCENT_ROLE, 0.85) },
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_ROLE,
                    '&:hover': { bgcolor: alpha(ACCENT_ROLE, 0.85) },
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ManageAccountsIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_ROLE}
        title='Role Change Reason Code'
        subtitle='Define a reason code for role change actions on users or assignees'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Role Change Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Reassignment, Skill Gap, Workload Balance'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this reason code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Role Change Reason Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Resolution Codes section ──────────────────────────────────────────────────

const ACCENT_RES = '#b45309';
const EMPTY_RES_FORM = { name: '', description: '' };

const ResolutionCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigResolutionCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigResolutionCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_RES_FORM);

  useEffect(() => {
    if (apiRC?.resolutionCodes) setRows(apiRC.resolutionCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_RES_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigResolutionCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: apiRC?.priorityChangeReasonCodes ?? [],
      roleChangeReasonCodes: apiRC?.roleChangeReasonCodes ?? [],
      resolutionCodes: next,
      cancellationReasonCodes: apiRC?.cancellationReasonCodes ?? [],
      reopenReasonCodes: apiRC?.reopenReasonCodes ?? [],
      conversionReasonCodes: apiRC?.conversionReasonCodes ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigResolutionCode = { id: `rc_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigResolutionCode>[] = [
    {
      id: 'name',
      label: 'Resolution Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
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
            <CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Resolution Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define resolution codes used when closing or resolving a ticket
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new resolution code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_RES}
        title='Resolution Code'
        subtitle='Define a resolution code used when closing or resolving tickets'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Resolution Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Fixed, Workaround Applied, Not Reproducible'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this resolution code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Resolution Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Cancellation Reason Codes section ────────────────────────────────────────

const ACCENT_CAN = '#dc2626';
const EMPTY_CAN_FORM = { name: '', description: '' };

const CancellationReasonCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigCancellationReasonCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigCancellationReasonCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAN_FORM);

  useEffect(() => {
    if (apiRC?.cancellationReasonCodes) setRows(apiRC.cancellationReasonCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_CAN_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigCancellationReasonCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: apiRC?.priorityChangeReasonCodes ?? [],
      roleChangeReasonCodes: apiRC?.roleChangeReasonCodes ?? [],
      resolutionCodes: apiRC?.resolutionCodes ?? [],
      cancellationReasonCodes: next,
      reopenReasonCodes: apiRC?.reopenReasonCodes ?? [],
      conversionReasonCodes: apiRC?.conversionReasonCodes ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigCancellationReasonCode = { id: `can_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigCancellationReasonCode>[] = [
    {
      id: 'name',
      label: 'Cancellation Reason Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_CAN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CancelOutlinedIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Cancellation Reason Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define reason codes used when cancelling a ticket
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new cancellation reason code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CAN,
                    '&:hover': { bgcolor: alpha(ACCENT_CAN, 0.85) },
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CAN,
                    '&:hover': { bgcolor: alpha(ACCENT_CAN, 0.85) },
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CancelOutlinedIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CAN}
        title='Cancellation Reason Code'
        subtitle='Define a reason code used when cancelling tickets'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Cancellation Reason Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Duplicate, No Longer Needed, Customer Withdrew'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this cancellation reason code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Cancellation Reason Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Reopen Reason Codes section ───────────────────────────────────────────────

const ACCENT_ROP = '#0891b2';
const EMPTY_ROP_FORM = { name: '', description: '' };

const ReopenReasonCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigReopenReasonCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigReopenReasonCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_ROP_FORM);

  useEffect(() => {
    if (apiRC?.reopenReasonCodes) setRows(apiRC.reopenReasonCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_ROP_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigReopenReasonCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: apiRC?.priorityChangeReasonCodes ?? [],
      roleChangeReasonCodes: apiRC?.roleChangeReasonCodes ?? [],
      resolutionCodes: apiRC?.resolutionCodes ?? [],
      cancellationReasonCodes: apiRC?.cancellationReasonCodes ?? [],
      reopenReasonCodes: next,
      conversionReasonCodes: apiRC?.conversionReasonCodes ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigReopenReasonCode = { id: `rop_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigReopenReasonCode>[] = [
    {
      id: 'name',
      label: 'Reopen Reason Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_ROP,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LockOpenIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Reopen Reason Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define reason codes used when reopening a previously closed or resolved ticket
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new reopen reason code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_ROP,
                    '&:hover': { bgcolor: alpha(ACCENT_ROP, 0.85) },
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_ROP,
                    '&:hover': { bgcolor: alpha(ACCENT_ROP, 0.85) },
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<LockOpenIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_ROP}
        title='Reopen Reason Code'
        subtitle='Define a reason code used when reopening closed or resolved tickets'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Reopen Reason Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Issue Recurred, Incomplete Fix, Customer Follow-up'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this reopen reason code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Reopen Reason Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Conversion Reason Codes section ──────────────────────────────────────────

const ACCENT_CON = '#6d28d9';
const EMPTY_CON_FORM = { name: '', description: '' };

const ConversionReasonCodes = () => {
  const { classes } = useStyles();
  const { reasonCodes: apiRC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigConversionReasonCode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigConversionReasonCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CON_FORM);

  useEffect(() => {
    if (apiRC?.conversionReasonCodes) setRows(apiRC.conversionReasonCodes);
  }, [apiRC]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow ? { name: editingRow.name, description: editingRow.description } : EMPTY_CON_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigConversionReasonCode[]) => {
    setRows(next);
    saveSection('reasonCodes', {
      priorityChangeReasonCodes: apiRC?.priorityChangeReasonCodes ?? [],
      roleChangeReasonCodes: apiRC?.roleChangeReasonCodes ?? [],
      resolutionCodes: apiRC?.resolutionCodes ?? [],
      cancellationReasonCodes: apiRC?.cancellationReasonCodes ?? [],
      reopenReasonCodes: apiRC?.reopenReasonCodes ?? [],
      conversionReasonCodes: next,
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigConversionReasonCode = { id: `con_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigConversionReasonCode>[] = [
    {
      id: 'name',
      label: 'Conversion Reason Code Name',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 280,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 340 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_CON,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SwapHorizIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Conversion Reason Code</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define reason codes used when converting a ticket from one type to another
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new conversion reason code'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CON,
                    '&:hover': { bgcolor: alpha(ACCENT_CON, 0.85) },
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
                  onClick={() => {
                    setEditingRow(selectedRow);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CON,
                    '&:hover': { bgcolor: alpha(ACCENT_CON, 0.85) },
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
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
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

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<SwapHorizIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CON}
        title='Conversion Reason Code'
        subtitle='Define a reason code used when converting tickets between types'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Conversion Reason Code Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Misclassified, Scope Change, Customer Request'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of when this conversion reason code applies'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Conversion Reason Code'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const ReasonCodes = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <PriorityChangeReasonCodes />
      <RoleChangeReasonCodes />
      <ResolutionCodes />
      <CancellationReasonCodes />
      <ReopenReasonCodes />
      <ConversionReasonCodes />
    </Box>
  );
};

export default ReasonCodes;
