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
import TuneIcon from '@mui/icons-material/Tune';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ConfigFormDialog, ConfigDeleteDialog } from '@serviceops/configdialogs';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { PriorityLevel, ImpactLevel, UrgencyLevel, ExtendedMatrixMap, MatrixRow } from '../../util';
import { IConfigMatrixMap, IConfigSimplePrioritiesBucket } from '@serviceops/interfaces';
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

type SimplePrioritiesState = Record<string, IConfigSimplePrioritiesBucket> | undefined;

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
  matrices: Record<string, IConfigMatrixMap>;
  simplePriorities: SimplePrioritiesState;
  onMatrixChange: (ticketType: string, impact: string, urgency: string, priorityId: string) => void;
  onMatrixReset: (ticketType: string, newMatrix: ExtendedMatrixMap) => void;
  onMatrixCellUpdate?: (
    ticketType: string,
    impact: string,
    urgency: string,
    data: {
      shortDescription?: string;
      description?: string;
      internalNote?: string;
    },
  ) => void;
  onSimplePrioritiesChange?: (next: Record<string, IConfigSimplePrioritiesBucket>) => void;
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
  simplePriorities,
  onMatrixChange,
  onMatrixReset,
  onMatrixCellUpdate,
  onSimplePrioritiesChange,
}: TicketMatrixSectionProps) => {
  const { classes } = useStyles();
  const { success } = useNotification();
  const [activeTicketType, setActiveTicketType] = useState<string>(ticketTypes[0]?.key ?? '');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    impactId: string;
    urgencyId: string;
    priorityId: string;
    shortDescription: string;
    description: string;
    internalNote: string;
  }>({
    impactId: '',
    urgencyId: '',
    priorityId: '',
    shortDescription: '',
    description: '',
    internalNote: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    impactId: string;
    urgencyId: string;
    priorityId: string;
    shortDescription: string;
    description: string;
    internalNote: string;
  }>({
    impactId: '',
    urgencyId: '',
    priorityId: '',
    shortDescription: '',
    description: '',
    internalNote: '',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [simplePropsOpen, setSimplePropsOpen] = useState(false);
  const [simpleForm, setSimpleForm] = useState<{ active: boolean; description: string }>({
    active: false,
    description: '',
  });

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
  const matrix: ExtendedMatrixMap =
    (matrices[activeTicketType] as ExtendedMatrixMap | undefined) ?? {};

  const currentSimple = simplePriorities?.[activeTicketType];
  const isSimpleActive = Boolean(currentSimple?.active);

  useEffect(() => {
    if (isSimpleActive) {
      setSelectedRowId(null);
    }
  }, [isSimpleActive, activeTicketType]);

  const activeImpacts = impacts.filter((i) => i.isActive);
  const activeUrgencies = urgencies.filter((u) => u.isActive);

  const allRows = useMemo(() => {
    const rowMap = new Map<string, MatrixRow>();
    activeImpacts.forEach((impact) =>
      activeUrgencies.forEach((urgency) => {
        const id = `${impact.id}_${urgency.id}`;
        if (!rowMap.has(id)) {
          const cell = matrix[impact.id]?.[urgency.id];
          // Only include rows that have a real cell defined in the matrix
          // (i.e. were explicitly added). Empty cells (deleted combinations)
          // should not appear in the table.
          if (!cell) return;
          rowMap.set(id, {
            id,
            impactId: impact.id,
            urgencyId: urgency.id,
            priorityId: cell.priorityId,
            shortDescription: cell.shortDescription,
            description: cell.description,
            internalNote: cell.internalNote,
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

  const openDeleteDialog = () => {
    if (!selectedRowId) return;
    setDeleteOpen(true);
  };

  const handleConfirmDeleteRow = () => {
    if (!selectedRowId) {
      setDeleteOpen(false);
      return;
    }
    const [impactId, urgencyId] = selectedRowId.split('_');
    const next: ExtendedMatrixMap = { ...matrix };
    if (next[impactId]) {
      next[impactId] = { ...next[impactId] };
      delete next[impactId][urgencyId];
    }
    onMatrixReset(activeTicketType, next);
    success('Combination deleted successfully');
    setSelectedRowId(null);
    setDeleteOpen(false);
  };

  const selectedCombinationName = (() => {
    if (!selectedRowId) return '';
    const [impactId, urgencyId] = selectedRowId.split('_');
    const impact = impacts.find((i) => i.id === impactId);
    const urgency = urgencies.find((u) => u.id === urgencyId);
    const impactName = impact?.displayName ?? impactId;
    const urgencyName = urgency?.displayName ?? urgencyId;
    return `${impactName} / ${urgencyName}`;
  })();

  const openAddDialog = () => {
    setAddForm({
      impactId: '',
      urgencyId: '',
      priorityId: '',
      shortDescription: '',
      description: '',
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
        internalNote: editForm.internalNote,
      });
    }
    success('Combination updated successfully');
    setEditDialogOpen(false);
  };

  const openSimplePropsDialog = () => {
    setSimpleForm({
      active: currentSimple?.active ?? false,
      description: currentSimple?.description ?? '',
    });
    setSimplePropsOpen(true);
  };

  const handleSaveSimpleProps = () => {
    const next: Record<string, IConfigSimplePrioritiesBucket> = {
      ...(simplePriorities ?? {}),
      [activeTicketType]: {
        active: simpleForm.active,
        description: simpleForm.description,
      },
    };
    if (onSimplePrioritiesChange) {
      onSimplePrioritiesChange(next);
    } else {
      // Fallback: no-op. The simple priorities state lives in the parent
      // and is persisted via the priorities section.
      return;
    }
    success(
      simpleForm.active
        ? 'Simple priorities activated. The matrix is now read-only for this ticket type.'
        : 'Simple priorities deactivated. The matrix is editable again.',
    );
    setSimplePropsOpen(false);
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
                    <Tooltip
                      title={
                        isSimpleActive
                          ? 'Simple priorities are active. The matrix is read-only.'
                          : 'Add a new Combination'
                      }
                    >
                      <span>
                        <Button
                          size='small'
                          variant='contained'
                          startIcon={<AddIcon />}
                          onClick={openAddDialog}
                          disabled={isSimpleActive}
                          sx={{
                            textTransform: 'none',
                            bgcolor: isSimpleActive ? alpha('#2d5ebb', 0.4) : '#2d5ebb',
                            width: '100%',
                            '&:hover': {
                              bgcolor: isSimpleActive ? alpha('#2d5ebb', 0.4) : '#2d5ebb',
                            },
                          }}
                        >
                          New
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        isSimpleActive
                          ? 'Simple priorities are active for this ticket type — click to manage'
                          : 'Activate simple priorities for this ticket type'
                      }
                    >
                      <Button
                        size='small'
                        variant={isSimpleActive ? 'contained' : 'outlined'}
                        startIcon={
                          isSimpleActive ? (
                            <LockOutlinedIcon sx={{ fontSize: '1rem' }} />
                          ) : (
                            <TuneIcon />
                          )
                        }
                        onClick={openSimplePropsDialog}
                        sx={{
                          textTransform: 'none',
                          width: '100%',
                          ...(isSimpleActive
                            ? {
                                bgcolor: '#16a34a',
                                '&:hover': { bgcolor: '#15803d' },
                              }
                            : {
                                borderColor: '#2d5ebb',
                                color: '#2d5ebb',
                                '&:hover': {
                                  borderColor: '#2d5ebb',
                                  bgcolor: alpha('#2d5ebb', 0.08),
                                },
                              }),
                        }}
                      >
                        Simple Properties
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
                    onClick={openDeleteDialog}
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
          <Box sx={{ position: 'relative' }}>
            {isSimpleActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 999,
                  bgcolor: 'rgba(148, 163, 184, 0.18)',
                  border: '1px solid',
                  borderColor: 'rgba(100, 116, 139, 0.4)',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  pointerEvents: 'none',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                Read-only — Simple Priorities Activated
              </Box>
            )}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 0,
                opacity: isSimpleActive ? 0.55 : 1,
                pointerEvents: isSimpleActive ? 'none' : 'auto',
                transition: 'opacity 0.2s ease',
                filter: isSimpleActive ? 'grayscale(0.55)' : 'none',
              }}
            >
              <DataTable
                columns={columns}
                data={filteredRows}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => {
                  if (isSimpleActive) return;
                  setSelectedRowId((prev) => (prev === row.id ? null : row.id));
                }}
                activeRowKey={isSimpleActive ? undefined : (selectedRowId ?? undefined)}
              />
            </Paper>
          </Box>
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
                options={activeImpacts
                  .filter((i) => i.enabledFor?.[activeTicketType] === true)
                  .map((i) => ({
                    value: i.id,
                    label: i.displayName,
                  }))}
                required
              />
              <CustomDropdown
                label='Urgency'
                value={addForm.urgencyId}
                onChange={(value) => setAddForm((f) => ({ ...f, urgencyId: value }))}
                options={activeUrgencies
                  .filter((u) => u.enabledFor?.[activeTicketType] === true)
                  .map((u) => ({
                    value: u.id,
                    label: u.displayName,
                  }))}
                required
              />
              <CustomDropdown
                label='Priority'
                value={addForm.priorityId}
                onChange={(value) => setAddForm((f) => ({ ...f, priorityId: value }))}
                options={priorities
                  .filter((p) => p.enabledFor?.[activeTicketType] === true)
                  .map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
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
                options={activeImpacts
                  .filter((i) => i.enabledFor?.[activeTicketType] === true)
                  .map((i) => ({
                    value: i.id,
                    label: i.displayName,
                  }))}
                required
              />
              <CustomDropdown
                label='Urgency'
                value={editForm.urgencyId}
                onChange={(value) => setEditForm((f) => ({ ...f, urgencyId: value }))}
                options={activeUrgencies
                  .filter((u) => u.enabledFor?.[activeTicketType] === true)
                  .map((u) => ({
                    value: u.id,
                    label: u.displayName,
                  }))}
                required
              />
              <CustomDropdown
                label='Priority'
                value={editForm.priorityId}
                onChange={(value) => setEditForm((f) => ({ ...f, priorityId: value }))}
                options={priorities
                  .filter((p) => p.enabledFor?.[activeTicketType] === true)
                  .map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
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

        {/* Simple Properties Dialog */}
        <ConfigFormDialog
          open={simplePropsOpen}
          onClose={() => setSimplePropsOpen(false)}
          onSubmit={handleSaveSimpleProps}
          isEdit={isSimpleActive}
          icon={<TuneIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
          accent={accentColor}
          title='Simple Properties'
          subtitle={`Configure simple priorities for ${activeTicket?.label ?? 'this ticket type'}. When active, the matrix below becomes read-only.`}
          submitDisabled={false}
          submitLabel={isSimpleActive ? 'Save' : 'Activate'}
          maxWidth='sm'
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha(accentColor, 0.3),
                bgcolor: alpha(accentColor, 0.04),
              }}
            >
              <Typography variant='body2' fontWeight={600} sx={{ mb: 0.5 }}>
                How this works
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                When the activation switch is on, the system uses a single fixed priority for this
                ticket type and ignores Impact and Urgency combinations. The matrix below becomes
                read-only — you cannot add, edit, or delete combinations. Turn the switch off to
                restore normal editing.
              </Typography>
            </Box>

            <Box>
              <RichTextEditor
                value={parseRichText(simpleForm.description)}
                onChange={(value) =>
                  setSimpleForm((f) => ({
                    ...f,
                    description: serializeRichText(value.segments),
                  }))
                }
                showFooterActions={false}
                title='Description'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
              >
                Optional notes describing why simple priorities are used for this ticket type
              </Typography>
            </Box>

            <Box
              className={classes.dialogActivationRow}
              sx={{
                borderColor: simpleForm.active ? alpha(accentColor, 0.4) : 'divider',
                bgcolor: simpleForm.active ? alpha(accentColor, 0.06) : 'transparent',
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
                  {simpleForm.active
                    ? 'The matrix is read-only. The + New button and table rows are disabled.'
                    : 'When enabled, the + New button and the matrix table become read-only.'}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={simpleForm.active}
                    onChange={(e) => setSimpleForm((f) => ({ ...f, active: e.target.checked }))}
                    color='success'
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    fontWeight={700}
                    className={classes.dialogActivationLabel}
                    sx={{
                      color: simpleForm.active ? 'success.main' : 'text.secondary',
                    }}
                  >
                    {simpleForm.active ? 'Active' : 'Inactive'}
                  </Typography>
                }
                className={classes.dialogActivationFormControl}
              />
            </Box>
          </Box>
        </ConfigFormDialog>

        {/* Delete Confirmation Dialog */}
        <ConfigDeleteDialog
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
          }}
          onConfirm={handleConfirmDeleteRow}
          entityName='Combination'
          itemName={selectedCombinationName}
        />
      </Box>
    </GenericAccordion>
  );
};

export { TicketMatrixSection };
export type { TicketTypeConfig, TicketMatrixSectionProps };
