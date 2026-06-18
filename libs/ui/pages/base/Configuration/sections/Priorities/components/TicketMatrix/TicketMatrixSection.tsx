import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Alert,
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
import {
  PriorityLevel,
  ImpactLevel,
  UrgencyLevel,
  ExtendedMatrixMap,
  MatrixRow,
  validateMatrixRowDuplicate,
} from '../../util';
import { IConfigMatrixMap, IConfigSimplePrioritiesBucket } from '@serviceops/interfaces';
import { useStyles } from '../../../../shared/GenericPanel/styles';
import { useFieldError, useNotification, useDebounce } from '@serviceops/hooks';
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
  const reqError = useFieldError();
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

  // Mirror of `addForm` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleAddRow runs, `addForm` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleAddRow to get the live value.
  const addFormRef = useRef<typeof addForm>(addForm);
  // Mirror of `editForm` for the same reason as addFormRef.
  const editFormRef = useRef<typeof editForm>(editForm);
  const [addDuplicateAlert, setAddDuplicateAlert] = useState<string | null>(null);
  const [editDuplicateAlert, setEditDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state for the Add dialog. Touched flips
  // true on blur (or immediately on Submit) and `requiredErrors` carries
  // the field-level message produced by validateRequired. Mirrors the
  // formik touched/errors shape that useFieldError expects.
  const [addTouched, setAddTouched] = useState<{
    impactId?: boolean;
    urgencyId?: boolean;
    priorityId?: boolean;
    shortDescription?: boolean;
    description?: boolean;
  }>({});
  const [addRequiredErrors, setAddRequiredErrors] = useState<{
    impactId?: string;
    urgencyId?: string;
    priorityId?: string;
    shortDescription?: string;
    description?: string;
  }>({});
  // Per-field required-validation state for the Edit dialog.
  const [editTouched, setEditTouched] = useState<{
    impactId?: boolean;
    urgencyId?: boolean;
    priorityId?: boolean;
    shortDescription?: boolean;
    description?: boolean;
  }>({});
  const [editRequiredErrors, setEditRequiredErrors] = useState<{
    impactId?: string;
    urgencyId?: string;
    priorityId?: string;
    shortDescription?: string;
    description?: string;
  }>({});

  // Strip rich-text markers and compare case-insensitively on plain text.
  // Mirrors the helper used in PriorityFormDialog.
  const plainText = (v: string): string =>
    String(v ?? '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\*/g, '')
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec for the Matrix section:
   *   Impact, Urgency, Priority, Short Description, Description — Yes
   *   Activate simple priorities, Internal note                  — No
   *
   * Rich-text fields are checked on plain text (markers stripped) so a user
   * who only typed formatting without content still fails validation.
   */
  const validateRequired = (f: {
    impactId: string;
    urgencyId: string;
    priorityId: string;
    shortDescription: string;
    description: string;
  }): {
    impactId?: string;
    urgencyId?: string;
    priorityId?: string;
    shortDescription?: string;
    description?: string;
  } => {
    const errs: {
      impactId?: string;
      urgencyId?: string;
      priorityId?: string;
      shortDescription?: string;
      description?: string;
    } = {};
    if (!String(f.impactId ?? '').trim()) errs.impactId = 'required';
    if (!String(f.urgencyId ?? '').trim()) errs.urgencyId = 'required';
    if (!String(f.priorityId ?? '').trim()) errs.priorityId = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    if (!plainText(f.description ?? '')) errs.description = 'required';
    return errs;
  };

  // Keep refs in sync with the form state. The refs are read by the
  // submit handlers to capture the latest values typed into the
  // RichTextEditor (whose onChange fires on blur).
  useEffect(() => {
    addFormRef.current = addForm;
  }, [addForm]);
  useEffect(() => {
    editFormRef.current = editForm;
  }, [editForm]);

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

  // Live-recompute the duplicate alert for the Add dialog so the user sees
  // it as they type, not only after clicking Submit. Per spec for Matrix:
  //   - Impact, Urgency, Priority:                  Allowed  — skip
  //   - Short Description, Description:             Not allowed
  //   - Activate simple priorities, Internal note:  Allowed  — skip
  // We pass `null` for editingRowId because we're adding a brand-new row.
  useEffect(() => {
    if (!addDialogOpen) {
      setAddDuplicateAlert(null);
      return;
    }
    setAddDuplicateAlert(
      validateMatrixRowDuplicate(
        addFormRef.current as unknown as Record<string, unknown>,
        allRows,
        null,
      )?._form ?? null,
    );
  }, [addForm, addDialogOpen, allRows]);

  // Live-recompute the duplicate alert for the Edit dialog. We exclude the
  // row currently being edited from the comparison.
  useEffect(() => {
    if (!editDialogOpen) {
      setEditDuplicateAlert(null);
      return;
    }
    setEditDuplicateAlert(
      validateMatrixRowDuplicate(
        editFormRef.current as unknown as Record<string, unknown>,
        allRows,
        selectedRowId,
      )?._form ?? null,
    );
  }, [editForm, editDialogOpen, allRows, selectedRowId]);

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
    setAddTouched({});
    setAddRequiredErrors({});
    setAddDialogOpen(true);
  };

  const handleAddRow = () => {
    // Read the ref, not the form state — see addFormRef comment for why.
    // Run required-field validation first so the user sees a per-field
    // red border / helper text on Impact, Urgency, Priority, Short
    // Description, and Description when any of them is blank. Mark all
    // required fields as touched so the errors render even if the user
    // hasn't blurred them yet.
    const reqErrs = validateRequired(addFormRef.current);
    setAddRequiredErrors(reqErrs);
    setAddTouched({
      impactId: true,
      urgencyId: true,
      priorityId: true,
      shortDescription: true,
      description: true,
    });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const dupError = validateMatrixRowDuplicate(
      addFormRef.current as unknown as Record<string, unknown>,
      allRows,
      null,
    );
    if (dupError) {
      setAddDuplicateAlert(dupError._form);
      return;
    }
    onMatrixChange(
      activeTicketType,
      addFormRef.current.impactId,
      addFormRef.current.urgencyId,
      addFormRef.current.priorityId,
    );
    if (onMatrixCellUpdate) {
      onMatrixCellUpdate(
        activeTicketType,
        addFormRef.current.impactId,
        addFormRef.current.urgencyId,
        {
          shortDescription: addFormRef.current.shortDescription,
          description: addFormRef.current.description,
          internalNote: addFormRef.current.internalNote,
        },
      );
    }
    success('Combination added successfully');
    setAddDialogOpen(false);
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
    setEditTouched({});
    setEditRequiredErrors({});
    setEditDialogOpen(true);
  };

  const handleEditRow = () => {
    // Read the ref, not the form state — see editFormRef comment for why.
    // Run required-field validation first so the user sees a per-field
    // red border / helper text on Impact, Urgency, Priority, Short
    // Description, and Description when any of them is blank.
    const reqErrs = validateRequired(editFormRef.current);
    setEditRequiredErrors(reqErrs);
    setEditTouched({
      impactId: true,
      urgencyId: true,
      priorityId: true,
      shortDescription: true,
      description: true,
    });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    if (!selectedRowId) return;
    const dupError = validateMatrixRowDuplicate(
      editFormRef.current as unknown as Record<string, unknown>,
      allRows,
      selectedRowId,
    );
    if (dupError) {
      setEditDuplicateAlert(dupError._form);
      return;
    }
    const [prevImpactId, prevUrgencyId] = selectedRowId.split('_');
    if (prevImpactId !== editForm.impactId || prevUrgencyId !== editForm.urgencyId) {
      const next: ExtendedMatrixMap = { ...matrix };
      if (next[prevImpactId]) {
        next[prevImpactId] = { ...next[prevImpactId] };
        delete next[prevImpactId][prevUrgencyId];
      }
      onMatrixReset(activeTicketType, next);
    }
    onMatrixChange(
      activeTicketType,
      editForm.impactId,
      editForm.urgencyId,
      editForm.priorityId,
    );
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
          onClose={() => {
            setAddDialogOpen(false);
            setAddTouched({});
            setAddRequiredErrors({});
          }}
          onSubmit={handleAddRow}
          isEdit={false}
          icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
          accent={accentColor}
          title='Combination'
          subtitle='Map a priority to an impact and urgency pair'
          submitDisabled={Boolean(addDuplicateAlert)}
          submitLabel='Submit'
          maxWidth='md'
        >
          {/* Duplicate Alert — single dialog-level message. Per spec, only
              Short Description and Description must be unique across rows
              in the same ticket-type matrix. The Alert is the only signal;
              no per-field red borders for duplicates. */}
          {addDuplicateAlert && (
            <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
              {addDuplicateAlert}
            </Alert>
          )}
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
                onBlur={() => setAddTouched((t) => ({ ...t, impactId: true }))}
                options={activeImpacts
                  .filter((i) => i.enabledFor?.[activeTicketType] === true)
                  .map((i) => ({
                    value: i.id,
                    label: i.displayName,
                  }))}
                error={Boolean(reqError(addTouched.impactId, addRequiredErrors.impactId))}
                helperText={reqError(addTouched.impactId, addRequiredErrors.impactId)}
                required
              />
              <CustomDropdown
                label='Urgency'
                value={addForm.urgencyId}
                onChange={(value) => setAddForm((f) => ({ ...f, urgencyId: value }))}
                onBlur={() => setAddTouched((t) => ({ ...t, urgencyId: true }))}
                options={activeUrgencies
                  .filter((u) => u.enabledFor?.[activeTicketType] === true)
                  .map((u) => ({
                    value: u.id,
                    label: u.displayName,
                  }))}
                error={Boolean(reqError(addTouched.urgencyId, addRequiredErrors.urgencyId))}
                helperText={reqError(addTouched.urgencyId, addRequiredErrors.urgencyId)}
                required
              />
              <CustomDropdown
                label='Priority'
                value={addForm.priorityId}
                onChange={(value) => setAddForm((f) => ({ ...f, priorityId: value }))}
                onBlur={() => setAddTouched((t) => ({ ...t, priorityId: true }))}
                options={priorities
                  .filter((p) => p.enabledFor?.[activeTicketType] === true)
                  .map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                error={Boolean(reqError(addTouched.priorityId, addRequiredErrors.priorityId))}
                helperText={reqError(addTouched.priorityId, addRequiredErrors.priorityId)}
                required
              />
            </Box>

            <Box>
              <Box
                onBlur={() => setAddTouched((t) => ({ ...t, shortDescription: true }))}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(addForm.shortDescription)}
                  onChange={(value) =>
                    setAddForm((f) => ({
                      ...f,
                      shortDescription: serializeRichText(value.segments),
                    }))
                  }
                  showFooterActions={false}
                  title='Short Description'
                  required
                  error={Boolean(
                    reqError(addTouched.shortDescription, addRequiredErrors.shortDescription),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(
                      addTouched.shortDescription,
                      addRequiredErrors.shortDescription,
                    )
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(addTouched.shortDescription, addRequiredErrors.shortDescription) ||
                    'Brief summary shown in compact views'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box
                onBlur={() => setAddTouched((t) => ({ ...t, description: true }))}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(addForm.description)}
                  onChange={(value) =>
                    setAddForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
                  }
                  showFooterActions={false}
                  title='Description'
                  required
                  error={Boolean(
                    reqError(addTouched.description, addRequiredErrors.description),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(addTouched.description, addRequiredErrors.description)
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(addTouched.description, addRequiredErrors.description) ||
                    'Describe when this combination should be used'}
                </Typography>
              </Box>
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
                Internal note for this combination (not visible to end users) — optional
              </Typography>
            </Box>
          </Box>
        </ConfigFormDialog>

        {/* Edit Dialog */}
        <ConfigFormDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditTouched({});
            setEditRequiredErrors({});
          }}
          onSubmit={handleEditRow}
          isEdit
          icon={<MatrixIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
          accent={accentColor}
          title='Combination'
          subtitle='Modify the priority mapping for this impact and urgency pair'
          submitDisabled={Boolean(editDuplicateAlert)}
          submitLabel='Save'
          maxWidth='md'
        >
          {/* Duplicate Alert — single dialog-level message. Per spec, only
              Short Description and Description must be unique across rows
              in the same ticket-type matrix. The Alert is the only signal;
              no per-field red borders for duplicates. */}
          {editDuplicateAlert && (
            <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
              {editDuplicateAlert}
            </Alert>
          )}
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
                onBlur={() => setEditTouched((t) => ({ ...t, impactId: true }))}
                options={activeImpacts
                  .filter((i) => i.enabledFor?.[activeTicketType] === true)
                  .map((i) => ({
                    value: i.id,
                    label: i.displayName,
                  }))}
                error={Boolean(reqError(editTouched.impactId, editRequiredErrors.impactId))}
                helperText={reqError(editTouched.impactId, editRequiredErrors.impactId)}
                required
              />
              <CustomDropdown
                label='Urgency'
                value={editForm.urgencyId}
                onChange={(value) => setEditForm((f) => ({ ...f, urgencyId: value }))}
                onBlur={() => setEditTouched((t) => ({ ...t, urgencyId: true }))}
                options={activeUrgencies
                  .filter((u) => u.enabledFor?.[activeTicketType] === true)
                  .map((u) => ({
                    value: u.id,
                    label: u.displayName,
                  }))}
                error={Boolean(reqError(editTouched.urgencyId, editRequiredErrors.urgencyId))}
                helperText={reqError(editTouched.urgencyId, editRequiredErrors.urgencyId)}
                required
              />
              <CustomDropdown
                label='Priority'
                value={editForm.priorityId}
                onChange={(value) => setEditForm((f) => ({ ...f, priorityId: value }))}
                onBlur={() => setEditTouched((t) => ({ ...t, priorityId: true }))}
                options={priorities
                  .filter((p) => p.enabledFor?.[activeTicketType] === true)
                  .map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                error={Boolean(reqError(editTouched.priorityId, editRequiredErrors.priorityId))}
                helperText={reqError(editTouched.priorityId, editRequiredErrors.priorityId)}
                required
              />
            </Box>

            <Box>
              <Box
                onBlur={() => setEditTouched((t) => ({ ...t, shortDescription: true }))}
                sx={{ borderRadius: 1 }}
              >
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
                  required
                  error={Boolean(
                    reqError(editTouched.shortDescription, editRequiredErrors.shortDescription),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(
                      editTouched.shortDescription,
                      editRequiredErrors.shortDescription,
                    )
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(editTouched.shortDescription, editRequiredErrors.shortDescription) ||
                    'Brief summary shown in compact views'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box
                onBlur={() => setEditTouched((t) => ({ ...t, description: true }))}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(editForm.description)}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
                  }
                  showFooterActions={false}
                  title='Description'
                  required
                  error={Boolean(
                    reqError(editTouched.description, editRequiredErrors.description),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(editTouched.description, editRequiredErrors.description)
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(editTouched.description, editRequiredErrors.description) ||
                    'Describe when this combination should be used'}
                </Typography>
              </Box>
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
                Internal note for this combination (not visible to end users) — optional
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
