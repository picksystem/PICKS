import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  DataTable,
  Column,
  Paper,
  FormControlLabel,
  Switch,
} from '@serviceops/component';
import { alpha } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { PriorityLevel, ImpactLevel, UrgencyLevel, ExtendedMatrixMap, MatrixRow } from '../../util';
import { useStyles } from '../../../../shared/GenericPanel/styles';
import { useNotification, useDebounce } from '@serviceops/hooks';
import { SearchField } from '@serviceops/pages/base/Configuration/shared/SearchField';
import CustomDropdown from '../../../../dialogs/TicketTypeFormDialog/components/CustomDropdown';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
  segmentsToHtml,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

interface TicketTypeConfig {
  key: string;
  label: string;
  pluralLabel: string;
  accentColor: string;
  Icon: React.ElementType;
}

interface TicketMatrixSectionProps {
  ticketTypes: TicketTypeConfig[];
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrices: Record<string, ExtendedMatrixMap>;
  onMatrixChange: (ticketType: string, impact: string, urgency: string, priorityId: string) => void;
  onMatrixReset: (ticketType: string, newMatrix: ExtendedMatrixMap) => void;
  onMatrixCellUpdate?: (
    ticketType: string,
    impact: string,
    urgency: string,
    data: {
      shortDescription?: string;
      description?: string;
      activateSimplePriorities?: boolean;
      internalNote?: string;
    },
  ) => void;
}

const renderRichTextCell = (v: unknown, maxWidth: number): React.ReactNode => {
  const raw = String(v || '');
  if (!raw) {
    return (
      <Typography
        variant='body2'
        color='text.secondary'
        fontSize='0.78rem'
        sx={{ fontStyle: 'italic' }}
      >
        —
      </Typography>
    );
  }
  const html = segmentsToHtml(parseRichText(raw).segments);
  const plainText = parseRichText(raw)
    .segments.map((s) => s.text)
    .join(' • ');
  return (
    <Box
      title={plainText}
      sx={{
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        color: 'text.secondary',
        lineHeight: 1.5,
        '& b': { fontWeight: 700, color: 'text.primary' },
        '& i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const TicketMatrixSection = ({
  ticketTypes,
  priorities,
  impacts,
  urgencies,
  matrices,
  onMatrixChange,
  onMatrixReset,
  onMatrixCellUpdate,
}: TicketMatrixSectionProps) => {
  const { classes } = useStyles();
  const { success } = useNotification();
  const [activeTicketType, setActiveTicketType] = useState<string>(ticketTypes[0]?.key ?? '');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    impactId: string;
    urgencyId: string;
    priorityId: string;
    shortDescription: string;
    description: string;
    activateSimplePriorities: boolean;
    internalNote: string;
  }>({
    impactId: '',
    urgencyId: '',
    priorityId: '',
    shortDescription: '',
    description: '',
    activateSimplePriorities: false,
    internalNote: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    impactId: string;
    urgencyId: string;
    priorityId: string;
    shortDescription: string;
    description: string;
    activateSimplePriorities: boolean;
    internalNote: string;
  }>({
    impactId: '',
    urgencyId: '',
    priorityId: '',
    shortDescription: '',
    description: '',
    activateSimplePriorities: false,
    internalNote: '',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!ticketTypes.find((t) => t.key === activeTicketType)) {
      setActiveTicketType(ticketTypes[0]?.key ?? '');
    }
  }, [ticketTypes, activeTicketType]);

  const ticketTypeByKey = useMemo(
    () => Object.fromEntries(ticketTypes.map((t) => [t.key, t])),
    [ticketTypes],
  );

  const activeTicket = ticketTypeByKey[activeTicketType];
  const matrix: ExtendedMatrixMap = matrices[activeTicketType] ?? {};

  const activeImpacts = impacts.filter((i) => i.isActive);
  const activeUrgencies = urgencies.filter((u) => u.isActive);

  const allRows = useMemo(() => {
    const rowMap = new Map<string, MatrixRow>();
    activeImpacts.forEach((impact) =>
      activeUrgencies.forEach((urgency) => {
        const id = `${impact.id}_${urgency.id}`;
        if (!rowMap.has(id)) {
          const cell = matrix[impact.id]?.[urgency.id];
          rowMap.set(id, {
            id,
            impactId: impact.id,
            urgencyId: urgency.id,
            priorityId: cell?.priorityId ?? '',
            shortDescription: cell?.shortDescription,
            description: cell?.description,
            activateSimplePriorities: cell?.activateSimplePriorities,
            internalNote: cell?.internalNote,
          });
        }
      }),
    );
    return Array.from(rowMap.values());
  }, [activeImpacts, activeUrgencies, matrix]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return allRows;
    const lower = debouncedSearch.toLowerCase();
    return allRows.filter((row) => {
      const impact = impacts.find((i) => i.id === row.impactId);
      const urgency = urgencies.find((u) => u.id === row.urgencyId);
      const priority = priorities.find((p) => p.id === row.priorityId);
      const haystack = [
        impact?.displayName,
        impact?.name,
        urgency?.displayName,
        urgency?.name,
        priority?.name,
        row.shortDescription,
        row.description,
        row.internalNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(lower);
    });
  }, [allRows, debouncedSearch, impacts, urgencies, priorities]);

  const handleMatrixChange = (impact: string, urgency: string, priorityId: string) => {
    onMatrixChange(activeTicketType, impact, urgency, priorityId);
  };

  const handleDeleteRow = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    const next: ExtendedMatrixMap = { ...matrix };
    if (next[impactId]) {
      next[impactId] = { ...next[impactId] };
      delete next[impactId][urgencyId];
    }
    onMatrixReset(activeTicketType, next);
    success('Combination deleted successfully');
    setSelectedRowId(null);
  };

  const openAddDialog = () => {
    setAddForm({
      impactId: activeImpacts[0]?.id ?? '',
      urgencyId: activeUrgencies[0]?.id ?? '',
      priorityId: priorities[0]?.id ?? '',
      shortDescription: '',
      description: '',
      activateSimplePriorities: false,
      internalNote: '',
    });
    setAddDialogOpen(true);
  };

  const handleAddRow = () => {
    if (addForm.impactId && addForm.urgencyId && addForm.priorityId) {
      onMatrixChange(activeTicketType, addForm.impactId, addForm.urgencyId, addForm.priorityId);
      if (onMatrixCellUpdate) {
        onMatrixCellUpdate(activeTicketType, addForm.impactId, addForm.urgencyId, {
          shortDescription: addForm.shortDescription,
          description: addForm.description,
          activateSimplePriorities: addForm.activateSimplePriorities,
          internalNote: addForm.internalNote,
        });
      }
      success('Combination added successfully');
      setAddDialogOpen(false);
    }
  };

  const openEditDialog = () => {
    if (!selectedRowId) return;
    const [impactId, urgencyId] = selectedRowId.split('_');
    const cell = matrix[impactId]?.[urgencyId];
    setEditForm({
      impactId,
      urgencyId,
      priorityId: cell?.priorityId ?? '',
      shortDescription: cell?.shortDescription ?? '',
      description: cell?.description ?? '',
      activateSimplePriorities: cell?.activateSimplePriorities ?? false,
      internalNote: cell?.internalNote ?? '',
    });
    setEditDialogOpen(true);
  };

  const handleEditRow = () => {
    if (!editForm.impactId || !editForm.urgencyId || !selectedRowId) return;
    const [prevImpactId, prevUrgencyId] = selectedRowId.split('_');
    if (prevImpactId !== editForm.impactId || prevUrgencyId !== editForm.urgencyId) {
      const next: ExtendedMatrixMap = { ...matrix };
      if (next[prevImpactId]) {
        next[prevImpactId] = { ...next[prevImpactId] };
        delete next[prevImpactId][prevUrgencyId];
      }
      onMatrixReset(activeTicketType, next);
    }
    onMatrixChange(activeTicketType, editForm.impactId, editForm.urgencyId, editForm.priorityId);
    if (onMatrixCellUpdate) {
      onMatrixCellUpdate(activeTicketType, editForm.impactId, editForm.urgencyId, {
        shortDescription: editForm.shortDescription,
        description: editForm.description,
        activateSimplePriorities: editForm.activateSimplePriorities,
        internalNote: editForm.internalNote,
      });
    }
    success('Combination updated successfully');
    setEditDialogOpen(false);
  };

  const columns: Column<MatrixRow>[] = [
    {
      id: 'impactId',
      label: 'Impact',
      minWidth: 110,
      format: (_v, row): React.ReactNode => {
        const impact = impacts.find((i) => i.id === row.impactId);
        return (
          <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
            {impact?.displayName ?? row.impactId}
          </Typography>
        );
      },
    },
    {
      id: 'urgencyId',
      label: 'Urgency',
      minWidth: 110,
      format: (_v, row): React.ReactNode => {
        const urgency = urgencies.find((u) => u.id === row.urgencyId);
        return (
          <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
            {urgency?.displayName ?? row.urgencyId}
          </Typography>
        );
      },
    },
    {
      id: 'priorityId',
      label: 'Priority',
      minWidth: 130,
      format: (_v, row): React.ReactNode => {
        const priority = priorities.find((p) => p.id === row.priorityId);
        return (
          <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
            {priority?.name || '—'}
          </Typography>
        );
      },
    },
    {
      id: 'shortDescription',
      label: 'Short Description',
      minWidth: 180,
      format: (v): React.ReactNode => renderRichTextCell(v, 240),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v): React.ReactNode => renderRichTextCell(v, 260),
    },
    {
      id: 'activateSimplePriorities',
      label: 'Simple Priorities',
      minWidth: 130,
      align: 'center' as const,
      format: (v): React.ReactNode => {
        const isActive = Boolean(v);
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: isActive ? alpha('#22c55e', 0.15) : alpha('#64748b', 0.1),
              border: '1px solid',
              borderColor: isActive ? alpha('#22c55e', 0.4) : alpha('#64748b', 0.3),
            }}
          >
            <Typography
              variant='body2'
              fontSize='0.7rem'
              fontWeight={700}
              sx={{
                color: isActive ? '#16a34a' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {isActive ? 'Simple' : 'Matrix'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'internalNote',
      label: 'Internal note',
      minWidth: 180,
      format: (v): React.ReactNode => renderRichTextCell(v, 240),
    },
  ];

  const ticketTypeButtons = ticketTypes.map((tt) => {
    const { Icon } = tt;
    return {
      key: tt.key,
      label: tt.label,
      icon: <Icon sx={{ fontSize: '1rem' }} />,
      isActive: activeTicketType === tt.key,
      onClick: () => {
        setActiveTicketType(tt.key);
        setSelectedRowId(null);
      },
    };
  });

  const MatrixIcon = activeTicket?.Icon ?? GridOnIcon;
  const accentColor = activeTicket?.accentColor ?? '#0369a1';

  return (
    <GenericAccordion
      title='Matrix'
      subtitle='Map each ticket type to priorities based on Impact and Urgency combinations'
      icon={<GridOnIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />}
      accent='#0369a1'
      defaultExpanded={false}
      className={classes.sectionAccordion}
    >
      <Box>
        <GenericToolbar buttons={ticketTypeButtons} className={classes.actionToolbar} />

        <Box
          sx={{
            mt: 1.5,
            border: '1px solid',
            borderColor: alpha(accentColor, 0.25),
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Panel Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              bgcolor: alpha(accentColor, 0.08),
            }}
          >
            <Box
              sx={{ color: accentColor, display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}
            >
              <GridOnIcon sx={{ fontSize: '1.1rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: accentColor }}>
              {activeTicket?.label} Based on Impact and Urgency
            </Typography>
          </Box>

          {/* Action Toolbar */}
          <Box
            sx={{
              p: 1,
              borderColor: alpha(accentColor, 0.5),
            }}
          >
            <Box className={classes.toolbarButtons}>
              {!selectedRowId ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    gap: 1,
                    width: '100%',
                  }}
                >
                  <Box className={classes.newButtonContainer}>
                    <Tooltip title='Add a new Combination'>
                      <Button
                        size='small'
                        variant='contained'
                        startIcon={<AddIcon />}
                        onClick={openAddDialog}
                        sx={{
                          textTransform: 'none',
                          bgcolor: '#2d5ebb',
                          width: '100%',
                          '&:hover': { bgcolor: '#2d5ebb' },
                        }}
                      >
                        New
                      </Button>
                    </Tooltip>
                  </Box>
                  <Box className={classes.searchFieldContainer}>
                    <SearchField
                      value={search}
                      onChange={setSearch}
                      isLoading={search.length > 0 && search !== debouncedSearch}
                      placeholder='Search....'
                      className={classes.tableSearchField}
                    />
                  </Box>
                </Box>
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
                    onClick={handleDeleteRow}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ClearIcon />}
                    onClick={() => setSelectedRowId(null)}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#2d5ebb',
                      color: '#2d5ebb',
                      '&:hover': { borderColor: '#2d5ebb', bgcolor: alpha('#2d5ebb', 0.08) },
                    }}
                  >
                    Clear
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Data Table */}
          <Paper elevation={0} sx={{ borderRadius: 0 }}>
            <DataTable
              columns={columns}
              data={filteredRows}
              rowKey='id'
              searchable={false}
              initialRowsPerPage={10}
              onRowClick={(row) => setSelectedRowId((prev) => (prev === row.id ? null : row.id))}
              activeRowKey={selectedRowId ?? undefined}
            />
          </Paper>
        </Box>

        {/* Add Dialog */}
        <ConfigFormDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={handleAddRow}
          isEdit={false}
          icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
          accent={accentColor}
          title='Combination'
          subtitle='Map a priority to an impact and urgency pair'
          submitDisabled={!addForm.impactId || !addForm.urgencyId || !addForm.priorityId}
          submitLabel='Submit'
          maxWidth='md'
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <CustomDropdown
                label='Impact'
                value={addForm.impactId}
                onChange={(value) => setAddForm((f) => ({ ...f, impactId: value }))}
                options={activeImpacts.map((i) => ({
                  value: i.id,
                  label: i.displayName,
                  color: i.bgColor,
                }))}
                selectedColor={activeImpacts.find((i) => i.id === addForm.impactId)?.bgColor}
                required
                disabled={addForm.activateSimplePriorities}
              />
              <CustomDropdown
                label='Urgency'
                value={addForm.urgencyId}
                onChange={(value) => setAddForm((f) => ({ ...f, urgencyId: value }))}
                options={activeUrgencies.map((u) => ({
                  value: u.id,
                  label: u.displayName,
                  color: u.bgColor,
                }))}
                selectedColor={activeUrgencies.find((u) => u.id === addForm.urgencyId)?.bgColor}
                required
                disabled={addForm.activateSimplePriorities}
              />
              <CustomDropdown
                label='Priority'
                value={addForm.priorityId}
                onChange={(value) => setAddForm((f) => ({ ...f, priorityId: value }))}
                options={priorities.map((p) => ({
                  value: p.id,
                  label: p.name,
                  color: p.bgColor,
                }))}
                selectedColor={priorities.find((p) => p.id === addForm.priorityId)?.bgColor}
                required
              />
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(addForm.shortDescription)}
                onChange={(value) =>
                  setAddForm((f) => ({ ...f, shortDescription: serializeRichText(value.segments) }))
                }
                showFooterActions={false}
                title='Short Description'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Brief summary shown in compact views
              </Typography>
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(addForm.description)}
                onChange={(value) =>
                  setAddForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
                }
                showFooterActions={false}
                title='Description'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Describe when this combination should be used
              </Typography>
            </Box>

            <Box
              className={classes.dialogActivationRow}
              sx={{
                borderColor: addForm.activateSimplePriorities ? alpha(accentColor, 0.3) : 'divider',
                bgcolor: addForm.activateSimplePriorities
                  ? alpha(accentColor, 0.04)
                  : 'transparent',
              }}
            >
              <Box>
                <Typography variant='body2' fontWeight={600}>
                  Activate simple priorities
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  className={classes.dialogActivationDescription}
                >
                  {addForm.activateSimplePriorities
                    ? 'Impact and Urgency are locked. Only the Priority field can be changed.'
                    : 'When enabled, Impact and Urgency are disabled and only Priority can be set.'}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={addForm.activateSimplePriorities}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, activateSimplePriorities: e.target.checked }))
                    }
                    color='success'
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    fontWeight={700}
                    className={classes.dialogActivationLabel}
                    sx={{
                      color: addForm.activateSimplePriorities ? 'success.main' : 'text.secondary',
                    }}
                  >
                    {addForm.activateSimplePriorities ? 'Active' : 'Inactive'}
                  </Typography>
                }
                className={classes.dialogActivationFormControl}
              />
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(addForm.internalNote)}
                onChange={(value) =>
                  setAddForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
                }
                showFooterActions={false}
                title='Internal note'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Internal note for this combination (not visible to end users)
              </Typography>
            </Box>
          </Box>
        </ConfigFormDialog>

        {/* Edit Dialog */}
        <ConfigFormDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleEditRow}
          isEdit
          icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
          accent={accentColor}
          title='Combination'
          subtitle='Modify the priority mapping for this impact and urgency pair'
          submitDisabled={false}
          submitLabel='Save'
          maxWidth='md'
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <CustomDropdown
                label='Impact'
                value={editForm.impactId}
                onChange={(value) => setEditForm((f) => ({ ...f, impactId: value }))}
                options={activeImpacts.map((i) => ({
                  value: i.id,
                  label: i.displayName,
                  color: i.bgColor,
                }))}
                selectedColor={activeImpacts.find((i) => i.id === editForm.impactId)?.bgColor}
                required
                disabled={editForm.activateSimplePriorities}
              />
              <CustomDropdown
                label='Urgency'
                value={editForm.urgencyId}
                onChange={(value) => setEditForm((f) => ({ ...f, urgencyId: value }))}
                options={activeUrgencies.map((u) => ({
                  value: u.id,
                  label: u.displayName,
                  color: u.bgColor,
                }))}
                selectedColor={activeUrgencies.find((u) => u.id === editForm.urgencyId)?.bgColor}
                required
                disabled={editForm.activateSimplePriorities}
              />
              <CustomDropdown
                label='Priority'
                value={editForm.priorityId}
                onChange={(value) => setEditForm((f) => ({ ...f, priorityId: value }))}
                options={priorities.map((p) => ({
                  value: p.id,
                  label: p.name,
                  color: p.bgColor,
                }))}
                selectedColor={priorities.find((p) => p.id === editForm.priorityId)?.bgColor}
                required
              />
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(editForm.shortDescription)}
                onChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    shortDescription: serializeRichText(value.segments),
                  }))
                }
                showFooterActions={false}
                title='Short Description'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Brief summary shown in compact views
              </Typography>
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(editForm.description)}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
                }
                showFooterActions={false}
                title='Description'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Describe when this combination should be used
              </Typography>
            </Box>

            <Box
              className={classes.dialogActivationRow}
              sx={{
                borderColor: editForm.activateSimplePriorities
                  ? alpha(accentColor, 0.3)
                  : 'divider',
                bgcolor: editForm.activateSimplePriorities
                  ? alpha(accentColor, 0.04)
                  : 'transparent',
              }}
            >
              <Box>
                <Typography variant='body2' fontWeight={600}>
                  Activate simple priorities
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  className={classes.dialogActivationDescription}
                >
                  {editForm.activateSimplePriorities
                    ? 'Impact and Urgency are locked. Only the Priority field can be changed.'
                    : 'When enabled, Impact and Urgency are disabled and only Priority can be set.'}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.activateSimplePriorities}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, activateSimplePriorities: e.target.checked }))
                    }
                    color='success'
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    fontWeight={700}
                    className={classes.dialogActivationLabel}
                    sx={{
                      color: editForm.activateSimplePriorities ? 'success.main' : 'text.secondary',
                    }}
                  >
                    {editForm.activateSimplePriorities ? 'Active' : 'Inactive'}
                  </Typography>
                }
                className={classes.dialogActivationFormControl}
              />
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(editForm.internalNote)}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
                }
                showFooterActions={false}
                title='Internal note'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Internal note for this combination (not visible to end users)
              </Typography>
            </Box>
          </Box>
        </ConfigFormDialog>
      </Box>
    </GenericAccordion>
  );
};

export { TicketMatrixSection };
export type { TicketTypeConfig, TicketMatrixSectionProps };
