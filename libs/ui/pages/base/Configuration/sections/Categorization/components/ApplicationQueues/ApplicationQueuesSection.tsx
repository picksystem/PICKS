import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  Switch,
  Chip,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  IConfigApplicationQueue,
  IConfigApproval,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigServiceLineTicketType,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { NoPick } from '../shared/NoPick';

const ACCENT_QAP = '#0369a1';
const ACCENT_QTT = '#0369a1';
const ACCENT_QTS = '#0369a1';
const ACCENT_QEX = '#0369a1';

const EMPTY_Q_FORM = {
  applicationId: '',
  applicationName: '',
  name: '',
  description: '',
  predecessor: '',
  successor: '',
  queueSpecificLead: '',
  managerLevel1: '',
  managerLevel2: '',
};
type QueueActivePanel = 'none' | 'approvals' | 'ticketTypes' | 'timesheet' | 'expenses';

type FlatQueueApRow = IConfigApproval & { queueId: string; queueName: string };
const EMPTY_QAP = {
  approverName: '',
  approverRole: '',
  approvalOrder: 1,
  isRequired: true,
};

type FlatQueueTSRow = IConfigTimesheetProject & { queueId: string; queueName: string };
const EMPTY_QTS = {
  queueId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};

type FlatQueueEXRow = IConfigExpenseProject & { queueId: string; queueName: string };
const EMPTY_QEX = {
  queueId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxAmountPerDay: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Approvals Panel
// ─────────────────────────────────────────────────────────────────────────────

const QueueApprovalsPanel = ({
  queues,
  defaultQueueId,
  onSave,
}: {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatQueueApRow[] = queues.flatMap((q) =>
    (q.approvals ?? []).map((a) => ({ ...a, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueApRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'> & { queueId: string }>({
    ...EMPTY_QAP,
    queueId: defaultQueueId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              queueId: editingRow.queueId,
              approverName: editingRow.approverName,
              approverRole: editingRow.approverRole,
              approvalOrder: editingRow.approvalOrder,
              isRequired: editingRow.isRequired,
            }
          : { ...EMPTY_QAP, queueId: defaultQueueId ?? '', approvalOrder: allRows.length + 1 },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.approverName.toLowerCase().includes(search.toLowerCase()) ||
          r.approverRole.toLowerCase().includes(search.toLowerCase()) ||
          r.queueName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.approverName.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId);
    if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        approvals: (tgt.approvals ?? []).map((a) =>
          a.id === editingRow.id ? { id: a.id, ...fields } : a,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApproval = { id: `qap_${Date.now()}`, ...fields };
      onSave({ ...tgt, approvals: [...(tgt.approvals ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q) onSave({ ...q, approvals: (q.approvals ?? []).filter((a) => a.id !== selectedRow.id) });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleRequired = (row: FlatQueueApRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q)
      onSave({
        ...q,
        approvals: (q.approvals ?? []).map((a) =>
          a.id === row.id ? { ...a, isRequired: val } : a,
        ),
      });
  };

  const columns: Column<FlatQueueApRow>[] = [
    {
      id: 'queueName',
      label: 'Queue',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_QAP,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'approvalOrder',
      label: 'Order',
      minWidth: 70,
      format: (v): React.ReactNode => (
        <Chip
          label={`#${v}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.08),
            color: ACCENT_QAP,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'approverName',
      label: 'Approver Name',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'approverRole',
      label: 'Approver Role',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isRequired',
      label: 'Required',
      minWidth: 90,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.isRequired}
          onChange={(e) => {
            e.stopPropagation();
            toggleRequired(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <ChecklistIcon sx={{ color: ACCENT_QAP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QAP }}>
          Queue Approvals
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} approver{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Tooltip title='Add approver'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
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
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ChecklistIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={'#2d5ebb'}
        title='Queue Approver'
        subtitle='Add or edit an approver for a queue'
        submitDisabled={!form.approverName.trim() || !form.queueId}
        submitLabel={editingRow ? 'Save Changes' : 'Add Approver'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Chip
            label={editingRow.queueName}
            size='small'
            sx={{
              bgcolor: alpha('#2d5ebb', 0.1),
              color: ACCENT_QAP,
              fontWeight: 600,
              alignSelf: 'flex-start',
            }}
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Queue</InputLabel>
            <Select
              label='Queue'
              value={form.queueId}
              onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}
            >
              {queues.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No queues</em>
                </MenuItem>
              ) : (
                queues.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Approver Name'
          size='small'
          fullWidth
          required
          value={form.approverName}
          onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))}
        />
        <TextField
          label='Approver Role'
          size='small'
          fullWidth
          value={form.approverRole}
          onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))}
        />
        <TextField
          label='Approval Order'
          type='number'
          size='small'
          fullWidth
          value={form.approvalOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, approvalOrder: Math.max(1, Number(e.target.value)) }))
          }
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.isRequired}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Required</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Queue Approver'
        itemName={selectedRow?.approverName}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Ticket Type Panel
// ─────────────────────────────────────────────────────────────────────────────

const QueueTicketTypePanel = ({
  queues,
  initialQueueId,
  allTicketTypeKeys,
  onSave,
}: {
  queues: IConfigApplicationQueue[];
  initialQueueId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigApplicationQueue) => void;
}) => {
  const selectedQueueId = initialQueueId || queues[0]?.id || '';
  const selectedQueue = queues.find((q) => q.id === selectedQueueId) ?? null;

  const rows: IConfigServiceLineTicketType[] = allTicketTypeKeys.map((key) => {
    const existing = (selectedQueue?.ticketTypeActivations ?? []).find(
      (tt) => tt.ticketTypeName === key,
    );
    return existing ?? { ticketTypeId: 0, ticketTypeName: key, enabled: true };
  });

  const toggleEnabled = (name: string, val: boolean) => {
    if (!selectedQueue) return;
    const updated = rows.map((r) => (r.ticketTypeName === name ? { ...r, enabled: val } : r));
    onSave({ ...selectedQueue, ticketTypeActivations: updated });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <ToggleOnIcon sx={{ color: ACCENT_QTT, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QTT }}>
          Enable / Disable Ticket Types
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {rows.filter((r) => r.enabled).length}/{rows.length} enabled
        </Typography>
      </Box>
      {!selectedQueue ? (
        <NoPick text='No queue available.' />
      ) : (
        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#2d5ebb', 0.25),
            borderTop: 'none',
          }}
        >
          <Table size='small'>
            <TableHead sx={{ bgcolor: alpha('#2d5ebb', 0.06) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', py: 0.75 }}>
                  Ticket Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    py: 0.75,
                    textAlign: 'center',
                    width: 100,
                  }}
                >
                  Enabled
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{ textAlign: 'center', py: 4, color: 'text.disabled', fontSize: '0.82rem' }}
                  >
                    No ticket types configured
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.ticketTypeName}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: row.enabled ? '#2d5ebb' : 'grey.400',
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant='body2' fontWeight={500} fontSize='0.84rem'>
                          {row.ticketTypeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, textAlign: 'center' }}>
                      <Switch
                        size='small'
                        checked={row.enabled}
                        onChange={(e) => toggleEnabled(row.ticketTypeName, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Timesheet Panel
// ─────────────────────────────────────────────────────────────────────────────

const QueueTimesheetPanel = ({
  queues,
  defaultQueueId,
  onSave,
}: {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatQueueTSRow[] = queues.flatMap((q) =>
    (q.timesheetProjects ?? []).map((p) => ({ ...p, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueTSRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_QTS>({
    ...EMPTY_QTS,
    queueId: defaultQueueId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              queueId: editingRow.queueId,
              project: editingRow.project,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
            }
          : { ...EMPTY_QTS, queueId: defaultQueueId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.queueName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const toggleActivate = (row: FlatQueueTSRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q)
      onSave({
        ...q,
        timesheetProjects: (q.timesheetProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const handleSubmit = () => {
    if (!form.project.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId);
    if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        timesheetProjects: (tgt.timesheetProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, ...fields, application: tgt.applicationName } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProject = {
        id: `qts_${Date.now()}`,
        ...fields,
        application: tgt.applicationName,
      };
      onSave({ ...tgt, timesheetProjects: [...(tgt.timesheetProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q)
      onSave({
        ...q,
        timesheetProjects: (q.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<FlatQueueTSRow>[] = [
    {
      id: 'queueName',
      label: 'Queue',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_QTS,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'project',
      label: 'Timesheet Project',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxHoursPerDayPerResource',
      label: 'Max Hours / Day',
      minWidth: 145,
      format: (v): React.ReactNode => (
        <Chip
          label={`${v}h`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_QTS,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <AccessTimeIcon sx={{ color: ACCENT_QTS, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QTS }}>
          Add Timesheet Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Tooltip title='Add timesheet project'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
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
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={'#2d5ebb'}
        title='Timesheet Project'
        subtitle='Add or edit a queue-specific timesheet project'
        submitDisabled={!form.project.trim() || (!editingRow && !form.queueId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Queue:
            </Typography>
            <Chip
              label={editingRow.queueName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_QTS,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Queue</InputLabel>
            <Select
              label='Queue'
              value={form.queueId}
              onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}
            >
              {queues.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No queues</em>
                </MenuItem>
              ) : (
                queues.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Timesheet Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='From Date'
            type='date'
            size='small'
            fullWidth
            value={form.fromDate}
            onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='To Date'
            type='date'
            size='small'
            fullWidth
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Max Hours Per Day Per Resource'
          type='number'
          size='small'
          fullWidth
          value={form.maxHoursPerDayPerResource}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)),
            }))
          }
          slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.activate}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Timesheet Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Expenses Panel
// ─────────────────────────────────────────────────────────────────────────────

const QueueExpensesPanel = ({
  queues,
  defaultQueueId,
  onSave,
}: {
  queues: IConfigApplicationQueue[];
  defaultQueueId: string | null;
  onSave: (updated: IConfigApplicationQueue) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatQueueEXRow[] = queues.flatMap((q) =>
    (q.expenseProjects ?? []).map((p) => ({ ...p, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueEXRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_QEX>({
    ...EMPTY_QEX,
    queueId: defaultQueueId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              queueId: editingRow.queueId,
              project: editingRow.project,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxAmountPerDay: editingRow.maxAmountPerDay,
            }
          : { ...EMPTY_QEX, queueId: defaultQueueId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.queueName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const toggleActivate = (row: FlatQueueEXRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q)
      onSave({
        ...q,
        expenseProjects: (q.expenseProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const handleSubmit = () => {
    if (!form.project.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId);
    if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        expenseProjects: (tgt.expenseProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, ...fields, application: tgt.applicationName } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseProject = {
        id: `qex_${Date.now()}`,
        ...fields,
        application: tgt.applicationName,
      };
      onSave({ ...tgt, expenseProjects: [...(tgt.expenseProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q)
      onSave({
        ...q,
        expenseProjects: (q.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<FlatQueueEXRow>[] = [
    {
      id: 'queueName',
      label: 'Queue',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_QEX,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'project',
      label: 'Expenses Project',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxAmountPerDay',
      label: 'Max Amount / Day',
      minWidth: 145,
      format: (v): React.ReactNode => (
        <Chip
          label={`$${Number(v).toFixed(2)}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_QEX,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <ReceiptLongIcon sx={{ color: ACCENT_QEX, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QEX }}>
          Add Expenses Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Tooltip title='Add expense project'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                New
              </Button>
            </Tooltip>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
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
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ReceiptLongIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={'#2d5ebb'}
        title='Expense Project'
        subtitle='Add or edit a queue-specific expense project'
        submitDisabled={!form.project.trim() || (!editingRow && !form.queueId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Queue:
            </Typography>
            <Chip
              label={editingRow.queueName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_QEX,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Queue</InputLabel>
            <Select
              label='Queue'
              value={form.queueId}
              onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}
            >
              {queues.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No queues</em>
                </MenuItem>
              ) : (
                queues.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Expenses Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='From Date'
            type='date'
            size='small'
            fullWidth
            value={form.fromDate}
            onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='To Date'
            type='date'
            size='small'
            fullWidth
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Max Amount Allowed Per Day Per Resource ($)'
          type='number'
          size='small'
          fullWidth
          value={form.maxAmountPerDay}
          onChange={(e) =>
            setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))
          }
          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.activate}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application Queues Section
// ─────────────────────────────────────────────────────────────────────────────

interface ApplicationQueuesSectionProps {
  data?: IConfigApplicationQueue[];
  onDataChange?: (data: IConfigApplicationQueue[]) => void;
}

const ApplicationQueuesSection = ({ data, onDataChange }: ApplicationQueuesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection, ticketTypeKeys } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationQueue[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationQueue | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_Q_FORM);
  const [activePanel, setActivePanel] = useState<QueueActivePanel>('none');

  const applications = apiCat?.applications ?? [];

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.queues) {
      setRows(apiCat.queues);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              applicationName: editingRow.applicationName,
              name: editingRow.name,
              description: editingRow.description,
              predecessor: editingRow.predecessor,
              successor: editingRow.successor,
              queueSpecificLead: editingRow.queueSpecificLead,
              managerLevel1: editingRow.managerLevel1,
              managerLevel2: editingRow.managerLevel2,
            }
          : EMPTY_Q_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.queueSpecificLead.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigApplicationQueue[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: next,
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationQueue = {
        id: `q_${Date.now()}`,
        ...form,
        approvals: [],
        ticketTypeActivations: [],
        timesheetProjects: [],
        expenseProjects: [],
      };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const handleSubPanelSave = (updated: IConfigApplicationQueue) =>
    saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));
  const togglePanel = (panel: QueueActivePanel) =>
    setActivePanel((prev) => (prev === panel ? 'none' : panel));
  const panelActive = activePanel !== 'none';

  const qColumns: Column<IConfigApplicationQueue>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Queue Name',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'queueSpecificLead',
      label: 'Queue Lead',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'managerLevel1',
      label: 'Manager L1',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'managerLevel2',
      label: 'Manager L2',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
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
              bgcolor: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeadsetMicIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Queues</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage application queues and configure their routing settings
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              size='small'
              startIcon={<HeadsetMicIcon />}
              variant={!panelActive ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('none')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: '#2d5ebb',
                bgcolor: !panelActive ? '#2d5ebb' : undefined,
                color: !panelActive ? '#fff' : '#2d5ebb',
                '&:hover': {
                  bgcolor: !panelActive ? '#2d5ebb' : alpha('#2d5ebb', 0.08),
                  borderColor: '#2d5ebb',
                },
              }}
            >
              Application Queues
            </Button>

            <Button
              size='small'
              startIcon={<ChecklistIcon />}
              variant={activePanel === 'approvals' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('approvals')}
            >
              Add Approvals
            </Button>
            <Button
              size='small'
              startIcon={<ToggleOnIcon />}
              variant={activePanel === 'ticketTypes' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('ticketTypes')}
            >
              Enable / Disable Ticket Types
            </Button>
            <Button
              size='small'
              startIcon={<AccessTimeIcon />}
              variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('timesheet')}
            >
              Add Timesheet Projects
            </Button>
            <Button
              size='small'
              startIcon={<ReceiptLongIcon />}
              variant={activePanel === 'expenses' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('expenses')}
            >
              Add Expenses Projects
            </Button>
          </Box>
        </Paper>

        {!panelActive && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                bgcolor: alpha('#2d5ebb', 0.08),
                border: '1px solid',
                borderColor: alpha('#2d5ebb', 0.25),
                borderRadius: '10px 10px 0 0',
                borderBottom: 'none',
              }}
            >
              <HeadsetMicIcon sx={{ color: '#d97706', fontSize: '1.1rem' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#d97706' }}>
                Application Queues
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                {rows.length} queue{rows.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Paper
              variant='outlined'
              sx={{
                borderRadius: 0,
                borderTop: 'none',
                borderBottom: 'none',
                px: 1.5,
                py: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Box className={classes.toolbarButtons}>
                {!selectedRow ? (
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                  >
                    New
                  </Button>
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
                      sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                    <Box
                      component='span'
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        width: '1px',
                        height: '20px',
                        bgcolor: alpha('#2d5ebb', 0.3),
                        mx: 0.75,
                        alignSelf: 'center',
                      }}
                    />
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<ClearIcon />}
                      onClick={() => setSelectedId(null)}
                    >
                      Clear
                    </Button>
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
                          <SearchIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Paper>

            <Paper elevation={1} className={classes.tablePaper} sx={{ borderTop: 'none' }}>
              <DataTable
                columns={qColumns}
                data={filtered}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
                activeRowKey={selectedId ?? undefined}
              />
            </Paper>
          </>
        )}

        {activePanel === 'approvals' && (
          <QueueApprovalsPanel
            queues={rows}
            defaultQueueId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'ticketTypes' && (
          <QueueTicketTypePanel
            queues={rows}
            initialQueueId={selectedId}
            allTicketTypeKeys={ticketTypeKeys}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'timesheet' && (
          <QueueTimesheetPanel
            queues={rows}
            defaultQueueId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'expenses' && (
          <QueueExpensesPanel
            queues={rows}
            defaultQueueId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<HeadsetMicIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#2d5ebb'
        title='Application Queue'
        subtitle='Manage application queues and configure their routing settings'
        submitDisabled={!form.name.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <TextField
            label='Application'
            size='small'
            fullWidth
            value={form.applicationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => handleApplicationChange(e.target.value)}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Queue Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Predecessor'
            size='small'
            fullWidth
            value={form.predecessor}
            onChange={(e) => setForm((f) => ({ ...f, predecessor: e.target.value }))}
          />
          <TextField
            label='Successor'
            size='small'
            fullWidth
            value={form.successor}
            onChange={(e) => setForm((f) => ({ ...f, successor: e.target.value }))}
          />
        </Box>
        <TextField
          label='Queue Specific Lead'
          size='small'
          fullWidth
          value={form.queueSpecificLead}
          onChange={(e) => setForm((f) => ({ ...f, queueSpecificLead: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Manager Level 1'
            size='small'
            fullWidth
            value={form.managerLevel1}
            onChange={(e) => setForm((f) => ({ ...f, managerLevel1: e.target.value }))}
          />
          <TextField
            label='Manager Level 2'
            size='small'
            fullWidth
            value={form.managerLevel2}
            onChange={(e) => setForm((f) => ({ ...f, managerLevel2: e.target.value }))}
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Application Queue'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

export { ApplicationQueuesSection };
