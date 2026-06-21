import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Typography,
  TextField,
  Paper,
  Switch,
  FormControlLabel,
} from '@serviceops/component';
import {
  alpha,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { AccessTime, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigTimesheetProject } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { DatePickerField } from '../../shared/GenericPanel/components/DatePickerField/DatePickerField';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const SLT_ACCENT = CATEG_ACCENT;

/**
 * Row shape used by this dialog. Mirrors `FlatServiceLineTSRow` from the
 * timesheet section: an `IConfigTimesheetProject` plus the denormalized
 * `serviceLineId` / `serviceLineName` references that the panel needs to
 * identify which service line the project belongs to. Defined locally so
 * the dialog has no cross-folder import dependency.
 */
export interface ServiceLineTimesheetRow extends IConfigTimesheetProject {
  serviceLineId: string;
  serviceLineName: string;
}

interface ServiceLineTimesheetFormDialogProps {
  open: boolean;
  editing: ServiceLineTimesheetRow | null;
  /** Other timesheet rows for duplicate detection (same service line). */
  existingTimesheetProjects?: ServiceLineTimesheetRow[];
  /**
   * Drop-down options for the "Service Line" field. Sourced from
   * `useConfiguration().categorization.serviceLines` and mapped to
   * `{ value: name, label: name }`.
   */
  serviceLineOptions: { value: string; label: string }[];
  /**
   * Drop-down options for the "Project name" field. Sourced from the
   * deduplicated union of existing project names across all service
   * lines' timesheet rows.
   */
  projectOptions: { value: string; label: string }[];
  onClose: () => void;
  onSave: (data: Partial<ServiceLineTimesheetRow>) => void;
  subtitle?: string;
}

const rangesOverlap = (
  aFrom: string,
  aTo: string,
  bFrom: string,
  bTo: string,
): boolean => {
  // Treat blank fromDate / toDate as unbounded (-∞ / +∞). Two ranges
  // conflict when they overlap by at least one day.
  const aF = aFrom || null;
  const aT = aTo || null;
  const bF = bFrom || null;
  const bT = bTo || null;
  if (!aF && !aT && !bF && !bT) return true;
  return (
    (aF === null || bT === null || aF <= bT) &&
    (bF === null || aT === null || bF <= aT)
  );
};

const ServiceLineTimesheetFormDialog = ({
  open,
  editing,
  existingTimesheetProjects = [],
  serviceLineOptions = [],
  projectOptions = [],
  onClose,
  onSave,
  subtitle,
}: ServiceLineTimesheetFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<ServiceLineTimesheetRow>>({});
  // The RichTextEditor only fires onChange on blur, so a state update
  // from there lands AFTER the user has clicked Submit. We read this ref
  // in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<ServiceLineTimesheetRow>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{
    serviceLineName?: boolean;
    project?: boolean;
    activate?: boolean;
    maxHoursPerDayPerResource?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    serviceLineName?: string;
    project?: string;
    activate?: string;
    maxHoursPerDayPerResource?: string;
  }>({});

  const updateForm = useCallback(
    (
      patch:
        | Partial<ServiceLineTimesheetRow>
        | ((f: Partial<ServiceLineTimesheetRow>) => Partial<ServiceLineTimesheetRow>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  const plainText = (v: string): string =>
    String(v ?? '')
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec:
   *   Service Line    — Yes
   *   Project name    — Yes
   *   From date       — No
   *   To date         — No
   *   Activation      — Yes (defaults to true on Save when untouched)
   *   Max Hours/Day   — No, but if set must satisfy 0 ≤ n ≤ 24
   *   Use in Expenses — No
   *   Internal note   — No
   */
  const validateRequired = (
    f: Partial<ServiceLineTimesheetRow>,
  ): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.serviceLineName ?? '').trim()) errs.serviceLineName = 'required';
    if (!String(f.project ?? '').trim()) errs.project = 'required';
    if (f.activate === undefined) errs.activate = 'required';

    // Max Hours/Day — optional, but if non-empty must satisfy 0 ≤ n ≤ 24.
    const hoursRaw = f.maxHoursPerDayPerResource;
    if (hoursRaw !== undefined && hoursRaw !== null && hoursRaw !== ('' as unknown)) {
      const n = Number(hoursRaw);
      if (!Number.isFinite(n) || n < 0 || n > 24) {
        errs.maxHoursPerDayPerResource = 'Must be between 0 and 24';
      }
    }
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec: the same Service Line + same Project + overlapping date
   * range is not allowed. The check is scoped to the selected Service
   * Line; rows for other service lines don't conflict.
   *
   * Blank fromDate / toDate mean open-ended: a row with no dates applies
   * to any date and conflicts with any other open-ended row with the
   * same SL+project.
   */
  const computeDuplicateMessage = (
    f: Partial<ServiceLineTimesheetRow>,
  ): string | null => {
    const myId = editing?.id;
    const targetSl = plainText(f.serviceLineName ?? '');
    const targetProj = plainText(f.project ?? '');

    if (!targetSl || !targetProj) return null;

    const others = existingTimesheetProjects.filter(
      (r) =>
        r.id !== myId &&
        plainText(r.serviceLineName ?? '') === targetSl &&
        plainText(r.project ?? '') === targetProj,
    );

    const conflict = others.find((r) =>
      rangesOverlap(
        f.fromDate ?? '',
        f.toDate ?? '',
        r.fromDate ?? '',
        r.toDate ?? '',
      ),
    );
    if (!conflict) return null;
    return 'A Timesheet Project with the same Service Line, Project and date range already exists.';
  };

  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingTimesheetProjects]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<ServiceLineTimesheetRow> = editing
      ? {
          serviceLineId: editing.serviceLineId ?? '',
          serviceLineName: editing.serviceLineName ?? '',
          project: editing.project ?? '',
          application: editing.application ?? '',
          fromDate: editing.fromDate ?? '',
          toDate: editing.toDate ?? '',
          activate: editing.activate ?? true,
          maxHoursPerDayPerResource: editing.maxHoursPerDayPerResource,
          useInExpenses: editing.useInExpenses ?? false,
          internalNote: editing.internalNote ?? '',
        }
      : {
          serviceLineId: '',
          serviceLineName: '',
          project: '',
          application: '',
          fromDate: '',
          toDate: '',
          activate: true,
          maxHoursPerDayPerResource: 8,
          useInExpenses: false,
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      serviceLineName: true,
      project: true,
      activate: true,
      maxHoursPerDayPerResource: true,
    });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const message = computeDuplicateMessage(formRef.current);
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSave({
      ...formRef.current,
      activate: formRef.current.activate ?? true,
    });
    success(
      editing
        ? 'Timesheet project updated successfully'
        : 'Timesheet project added successfully',
    );
  };

  const slError = reqError(touched.serviceLineName, requiredErrors.serviceLineName);
  const projectError = reqError(touched.project, requiredErrors.project);
  const hoursError = requiredErrors.maxHoursPerDayPerResource;

  // ── Service Line — search-style autocomplete ─────────────────────────────
  const [slInput, setSlInput] = useState<string>('');
  const [slOptionsOpen, setSlOptionsOpen] = useState(false);
  const [slLoading, setSlLoading] = useState(false);
  const slDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.serviceLineName ?? '');
    if (stored !== slInput) {
      setSlInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.serviceLineName]);

  const slSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return serviceLineOptions;
      return serviceLineOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [serviceLineOptions],
  );

  const [slFiltered, setSlFiltered] = useState<{ value: string; label: string }[]>([]);

  const handleSlInputChange = useCallback(
    (value: string) => {
      setSlInput(value);
      if (slDebounceRef.current) clearTimeout(slDebounceRef.current);
      slDebounceRef.current = setTimeout(() => {
        setSlLoading(true);
        const next = slSearch(value);
        setSlFiltered(next);
        setSlOptionsOpen(next.length > 0);
        setSlLoading(false);
      }, 200);
    },
    [slSearch],
  );

  const handleSlSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setSlInput(opt.label);
      setSlOptionsOpen(false);
      setSlFiltered([]);
      setTouched((t) => ({ ...t, serviceLineName: true }));
      updateForm((f) => ({ ...f, serviceLineName: opt.value }));
    },
    [updateForm],
  );

  const handleSlClear = useCallback(() => {
    setSlInput('');
    setSlFiltered([]);
    setSlOptionsOpen(false);
    updateForm((f) => ({ ...f, serviceLineName: '' }));
  }, [updateForm]);

  // ── Project name — search-style autocomplete (deduped existing names) ──
  const [projectInput, setProjectInput] = useState<string>('');
  const [projectOptionsOpen, setProjectOptionsOpen] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const projectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.project ?? '');
    if (stored !== projectInput) {
      setProjectInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.project]);

  const projectSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return projectOptions;
      return projectOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [projectOptions],
  );

  const [projectFiltered, setProjectFiltered] = useState<
    { value: string; label: string }[]
  >([]);

  const handleProjectInputChange = useCallback(
    (value: string) => {
      setProjectInput(value);
      if (projectDebounceRef.current) clearTimeout(projectDebounceRef.current);
      projectDebounceRef.current = setTimeout(() => {
        setProjectLoading(true);
        const next = projectSearch(value);
        setProjectFiltered(next);
        setProjectOptionsOpen(next.length > 0);
        setProjectLoading(false);
      }, 200);
    },
    [projectSearch],
  );

  const handleProjectSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setProjectInput(opt.label);
      setProjectOptionsOpen(false);
      setProjectFiltered([]);
      setTouched((t) => ({ ...t, project: true }));
      updateForm((f) => ({ ...f, project: opt.value }));
    },
    [updateForm],
  );

  const handleProjectClear = useCallback(() => {
    setProjectInput('');
    setProjectFiltered([]);
    setProjectOptionsOpen(false);
    updateForm((f) => ({ ...f, project: '' }));
  }, [updateForm]);

  // Reset popover state whenever the dialog opens so a previously-typed
  // query doesn't bleed into a new Add/Edit cycle.
  useEffect(() => {
    if (open) {
      setSlOptionsOpen(false);
      setSlFiltered([]);
      setSlLoading(false);
      setProjectOptionsOpen(false);
      setProjectFiltered([]);
      setProjectLoading(false);
    }
  }, [open]);

  // Once the persisted row has useInExpenses === true, the toggle becomes
  // non-editable. The new dialog only ever opens for Add (useInExpenses
  // starts at false) or Edit (where editing.useInExpenses is the locked
  // value).
  const useInExpensesLocked = editing?.useInExpenses === true;
  const useInExpenses = form.useInExpenses ?? false;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<AccessTime sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={SLT_ACCENT}
      title='Timesheet Project'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Service Line — required search field */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Service Line'
            placeholder='Search service lines...'
            value={slInput}
            onChange={(e) => handleSlInputChange(e.target.value)}
            onFocus={() => {
              const next = slSearch(slInput);
              setSlFiltered(next);
              if (next.length > 0) setSlOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, serviceLineName: true }));
              setTimeout(() => setSlOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(slError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {slLoading ? (
                        <CircularProgress size={16} />
                      ) : slInput ? (
                        <ClearIcon
                          onClick={handleSlClear}
                          sx={{
                            fontSize: 18,
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { color: 'text.primary' },
                          }}
                        />
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
          {slOptionsOpen && slFiltered.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 0,
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              <List dense disablePadding>
                {slFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleSlSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SLT_ACCENT, 0.08) },
                      }}
                    >
                      <ListItemText
                        primary={opt.label}
                        primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
        <Typography
          variant='caption'
          sx={{
            color: slError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {slError || ' '}
        </Typography>
      </Box>

      {/* Project name — required search field (existing project names) */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Project name'
            placeholder='Search projects...'
            value={projectInput}
            onChange={(e) => handleProjectInputChange(e.target.value)}
            onFocus={() => {
              const next = projectSearch(projectInput);
              setProjectFiltered(next);
              if (next.length > 0) setProjectOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, project: true }));
              setTimeout(() => setProjectOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(projectError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {projectLoading ? (
                        <CircularProgress size={16} />
                      ) : projectInput ? (
                        <ClearIcon
                          onClick={handleProjectClear}
                          sx={{
                            fontSize: 18,
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { color: 'text.primary' },
                          }}
                        />
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
          {projectOptionsOpen && projectFiltered.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 0,
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              <List dense disablePadding>
                {projectFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleProjectSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SLT_ACCENT, 0.08) },
                      }}
                    >
                      <ListItemText
                        primary={opt.label}
                        primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
        <Typography
          variant='caption'
          sx={{
            color: projectError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {projectError || ' '}
        </Typography>
      </Box>

      {/* From Date / To Date — optional date pickers */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <DatePickerField
            label='From date'
            value={form.fromDate ?? ''}
            onChange={(value) => updateForm((f) => ({ ...f, fromDate: value }))}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <DatePickerField
            label='To date'
            value={form.toDate ?? ''}
            onChange={(value) => updateForm((f) => ({ ...f, toDate: value }))}
          />
        </Box>
      </Box>

      {/* Activation — bordered Switch row */}
      {(() => {
        const enabled = form.activate ?? true;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: enabled ? alpha(SLT_ACCENT, 0.3) : 'divider',
              bgcolor: enabled ? alpha(SLT_ACCENT, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Typography variant='body2' color='#0369a1' fontWeight={600}>
                Activation
              </Typography>
              <Typography variant='caption' sx={{ color: '#2687bb' }}>
                {enabled
                  ? 'This timesheet project is active'
                  : 'This timesheet project is inactive'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) =>
                    updateForm((f) => ({ ...f, activate: e.target.checked }))
                  }
                  color='success'
                />
              }
              label={
                <Typography
                  variant='body2'
                  fontWeight={700}
                  sx={{ color: enabled ? 'success.main' : 'text.secondary' }}
                >
                  {enabled ? 'Active' : 'Inactive'}
                </Typography>
              }
              sx={{ ml: 0 }}
            />
          </Box>
        );
      })()}

      {/* Max Hours/Day — optional numeric input (0-24, decimals allowed) */}
      <Box>
        <TextField
          label='Max Hours/Day'
          type='number'
          size='small'
          value={
            form.maxHoursPerDayPerResource === undefined ||
            form.maxHoursPerDayPerResource === null
              ? ''
              : String(form.maxHoursPerDayPerResource)
          }
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              updateForm((f) => ({ ...f, maxHoursPerDayPerResource: undefined }));
            } else {
              const n = Number(raw);
              updateForm((f) => ({ ...f, maxHoursPerDayPerResource: n }));
            }
          }}
          onBlur={() => setTouched((t) => ({ ...t, maxHoursPerDayPerResource: true }))}
          inputProps={{ min: 0, max: 24, step: 0.25 }}
          error={Boolean(hoursError)}
          helperText={hoursError || ' '}
          fullWidth
        />
      </Box>

      {/* Use in Expenses — bordered Switch row, non-editable once Yes */}
      {(() => {
        const enabled = useInExpenses;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: enabled ? alpha(SLT_ACCENT, 0.3) : 'divider',
              bgcolor: enabled ? alpha(SLT_ACCENT, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
              opacity: useInExpensesLocked ? 0.85 : 1,
            }}
          >
            <Box>
              <Typography variant='body2' color='#0369a1' fontWeight={600}>
                Use in Expenses
              </Typography>
              <Typography variant='caption' sx={{ color: '#2687bb' }}>
                {enabled
                  ? 'A mirror row exists in the parent service line\'s expense projects'
                  : 'When enabled, a mirror row is created in expense projects'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  disabled={useInExpensesLocked}
                  onChange={(e) =>
                    updateForm((f) => ({ ...f, useInExpenses: e.target.checked }))
                  }
                  color='success'
                />
              }
              label={
                <Typography
                  variant='body2'
                  fontWeight={700}
                  sx={{ color: enabled ? 'success.main' : 'text.secondary' }}
                >
                  {enabled ? 'Yes' : 'No'}
                </Typography>
              }
              sx={{ ml: 0 }}
            />
          </Box>
        );
      })()}

      {/* Internal note — optional rich text */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, internalNote: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.internalNote ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                internalNote: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Internal note'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            {' '}
          </Typography>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default ServiceLineTimesheetFormDialog;