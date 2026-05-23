import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
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
  alpha,
  Checkbox,
  Switch,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from '../../../styles';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../../dialogs/ConfigDialogs/ConfigDialogs';
import { BoolFormKey, TemplateForm, TemplateItem, TemplateTableProps } from '../Templates.types';
import { DEFAULT_BOOL_FIELDS, EMPTY_FORM } from '../Templates.config';

const TemplateTable: React.FC<TemplateTableProps> = ({ config, rows, onSave, statusItems }) => {
  const { classes } = useStyles();
  const [localRows, setLocalRows] = useState<TemplateItem[]>(rows);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TemplateItem | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<TemplateForm>({ ...EMPTY_FORM });
  const Icon = config.icon;
  const boolFields = config.boolFields ?? DEFAULT_BOOL_FIELDS;

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            name: editingRow.name,
            description: editingRow.description,
            active: editingRow.active,
            ticketStatus: editingRow.ticketStatus,
            subjectLine: editingRow.subjectLine ?? '',
            commentDescription: editingRow.commentDescription ?? '',
            internalNote: editingRow.internalNote ?? false,
            notifyAssigneesOnly: editingRow.notifyAssigneesOnly ?? false,
            selfNote: editingRow.selfNote ?? false,
            appendToResolution: editingRow.appendToResolution ?? false,
          }
        : { ...EMPTY_FORM },
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = useMemo(
    () => localRows.find((r) => r.id === selectedId) ?? null,
    [localRows, selectedId],
  );

  const filteredRows = useMemo(() => {
    if (!search) return localRows;
    const value = search.toLowerCase();
    return localRows.filter(
      (r) =>
        r.name.toLowerCase().includes(value) ||
        r.description.toLowerCase().includes(value) ||
        r.ticketStatus.toLowerCase().includes(value),
    );
  }, [search, localRows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedRow) return;
    setEditingRow(selectedRow);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRow(null);
  };

  const toggleBool = (key: BoolFormKey) => setForm((f) => ({ ...f, [key]: !f[key] }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    let updatedRows: TemplateItem[];
    if (editingRow) {
      updatedRows = localRows.map((row) =>
        row.id === editingRow.id ? { ...editingRow, ...form } : row,
      );
      setSelectedId(editingRow.id);
    } else {
      const newRow: TemplateItem = {
        id: `${config.idPrefix}_${Date.now()}`,
        ...form,
      };
      updatedRows = [...localRows, newRow];
      setSelectedId(newRow.id);
    }
    setLocalRows(updatedRows);
    onSave(updatedRows);
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const updatedRows = localRows.filter((row) => row.id !== selectedRow.id);
    setLocalRows(updatedRows);
    onSave(updatedRows);
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const ActiveCell = (v: unknown): React.ReactNode => {
    const on = Boolean(v);
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: on ? '#dcfce7' : '#f1f5f9',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: on ? '#166534' : '#64748b',
          }}
        >
          {on ? 'Active' : 'Inactive'}
        </Typography>
      </Box>
    );
  };

  const mkBoolCell = (v: unknown): React.ReactNode =>
    Boolean(v) ? (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: alpha(config.accent, 0.1),
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: config.accent }}>
          Yes
        </Typography>
      </Box>
    ) : (
      <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>
        —
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

  const columns: Column<TemplateItem>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 160,
      format: (v) => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    { id: 'description', label: 'Description', minWidth: 180, format: TruncCell },
    { id: 'active', label: 'Active', minWidth: 80, format: ActiveCell },
    { id: 'ticketStatus', label: 'Ticket Status', minWidth: 130, format: TruncCell },
    ...(config.idPrefix === 'ct' || config.idPrefix === 'int'
      ? [
          { id: 'subjectLine', label: 'Subject Line', minWidth: 170, format: TruncCell },
          { id: 'commentDescription', label: 'Comment', minWidth: 160, format: TruncCell },
        ]
      : []),
    ...boolFields.slice(0, 4).map((field) => ({
      id: field.key,
      label: field.label,
      minWidth: 130,
      format: mkBoolCell,
    })),
  ];

  return (
    <Accordion
      defaultExpanded={config.defaultExpanded ?? false}
      elevation={0}
      className={classes.sectionAccordion}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: config.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>{config.title}</Typography>
            <Typography className={classes.sectionSubtitle}>{config.subtitle}</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title={`Add new ${config.title.toLowerCase()}`}>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    '&:hover': { bgcolor: '#2d5ebb' },
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
                  onClick={openEditDialog}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#2d5ebb',
                    '&:hover': { bgcolor: '#2d5ebb' },
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
                  sx={{
                    textTransform: 'none',
                    borderColor: '#2d5ebb',
                    color: '#2d5ebb',
                    '&:hover': {
                      borderColor: '#2d5ebb',
                      bgcolor: alpha('#2d5ebb', 0.08),
                    },
                  }}
                >
                  Clear
                </Button>
              </>
            )}

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
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>

        <Paper elevation={1} className={classes.tablePaper}>
          <DataTable
            columns={columns}
            data={filteredRows}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            activeRowKey={selectedId ?? undefined}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
          />
        </Paper>
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={
          <Icon
            sx={{
              color: '#fff',
              fontSize: '1.1rem',
            }}
          />
        }
        accent={config.accent}
        title={config.title}
        subtitle={
          editingRow
            ? `Editing "${editingRow.name}"`
            : `Configure a reusable ${config.title.toLowerCase()}`
        }
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. On Hold - Awaiting Customer'
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

        <FormControl size='small' fullWidth>
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
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#16a34a' },
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

        {(config.idPrefix === 'ct' || config.idPrefix === 'int') && (
          <>
            <TextField
              label='Subject Line'
              size='small'
              fullWidth
              value={form.subjectLine}
              onChange={(e) => setForm((f) => ({ ...f, subjectLine: e.target.value }))}
              placeholder='e.g. Your ticket is on hold pending your response'
            />
            <TextField
              label='Comment Description'
              size='small'
              fullWidth
              multiline
              minRows={3}
              value={form.commentDescription}
              onChange={(e) => setForm((f) => ({ ...f, commentDescription: e.target.value }))}
              placeholder='Template body visible to the customer...'
            />
          </>
        )}

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
            const checked = form[key] as boolean;
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
                  bgcolor: checked ? alpha(config.accent, 0.06) : 'transparent',
                  border: '1px solid',
                  borderColor: checked ? alpha(config.accent, 0.28) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(config.accent, 0.05),
                    borderColor: alpha(config.accent, 0.2),
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
                    color: alpha(config.accent, 0.5),
                    '&.Mui-checked': { color: config.accent },
                  }}
                />
                <Box>
                  <Typography variant='body2' fontWeight={600} fontSize='0.8rem' lineHeight={1.3}>
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
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={config.title}
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

export default TemplateTable;
