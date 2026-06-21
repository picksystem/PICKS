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
import { Checklist, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigApproval } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const SLA_ACCENT = CATEG_ACCENT;

/**
 * Row shape used by this dialog. Mirrors `FlatServiceLineApRow` from the
 * approvals section: an `IConfigApproval` plus the denormalized
 * `serviceLineId` / `serviceLineName` references that the panel needs to
 * identify which service line the approver belongs to. Defined locally so
 * the dialog has no cross-folder import dependency.
 */
export interface ServiceLineApprovalRow extends IConfigApproval {
  serviceLineId: string;
  serviceLineName: string;
}

interface ServiceLineApprovalFormDialogProps {
  open: boolean;
  editing: ServiceLineApprovalRow | null;
  /** Other approval rows for duplicate detection. */
  existingApprovals?: ServiceLineApprovalRow[];
  /**
   * Drop-down options for the "Service Line" field. Sourced from
   * `useConfiguration().categorization.serviceLines` and mapped to
   * `{ value: name, label: name }`.
   */
  serviceLineOptions: { value: string; label: string }[];
  /**
   * Drop-down options for the "Approver name" field. Sourced from User
   * Management → All Users; value and label are the user's full name.
   * The optional `subtitle` is the user's email and shows as the
   * secondary line in the popover.
   */
  approverOptions: { value: string; label: string; subtitle?: string }[];
  /**
   * Drop-down options for the "Approver role" field. Sourced from
   * `useConfiguration().approvals.consultantRoles` and mapped to
   * `{ value: roleName, label: roleName }`.
   */
  approverRoleOptions: { value: string; label: string }[];
  onClose: () => void;
  onSave: (data: Partial<ServiceLineApprovalRow>) => void;
  subtitle?: string;
}

const ServiceLineApprovalFormDialog = ({
  open,
  editing,
  existingApprovals = [],
  serviceLineOptions = [],
  approverOptions = [],
  approverRoleOptions = [],
  onClose,
  onSave,
  subtitle,
}: ServiceLineApprovalFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<ServiceLineApprovalRow>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<ServiceLineApprovalRow>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    serviceLineName?: boolean;
    approverName?: boolean;
    approverRole?: boolean;
    approvalOrder?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    serviceLineName?: string;
    approverName?: string;
    approverRole?: string;
    approvalOrder?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<ServiceLineApprovalRow>
        | ((f: Partial<ServiceLineApprovalRow>) => Partial<ServiceLineApprovalRow>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Normalize a string for case-insensitive duplicate and required
  // comparison. Trims and lowercases so "Service Line A" and
  // "service line a " collide.
  const plainText = (v: string): string =>
    String(v ?? '')
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec:
   *   Service Line         — Yes
   *   Approver name        — Yes
   *   Approver role        — Yes
   *   Approver order       — Yes
   *   Enable               — Yes (defaults to true on Save when untouched)
   *   Internal note        — No
   */
  const validateRequired = (f: Partial<ServiceLineApprovalRow>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.serviceLineName ?? '').trim()) errs.serviceLineName = 'required';
    if (!String(f.approverName ?? '').trim()) errs.approverName = 'required';
    if (!String(f.approverRole ?? '').trim()) errs.approverRole = 'required';
    // approvalOrder must be a positive integer (>= 1)
    const orderNum = Number(f.approvalOrder);
    if (!f.approvalOrder || Number.isNaN(orderNum) || orderNum < 1) {
      errs.approvalOrder = 'required';
    }
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Service Line Approvals section:
   *   - Service Line:       Allowed  — skip
   *   - Approver name:      Not allowed
   *   - Approver role:      Allowed  — skip
   *   - Approver order:     Not allowed
   *   - Enable:             Allowed  — skip
   *   - Internal note:      Allowed  — skip
   *
   * The duplicate check is scoped to the currently selected Service Line
   * (rows for other service lines don't conflict).
   */
  const computeDuplicateMessage = (f: Partial<ServiceLineApprovalRow>): string | null => {
    const myId = editing?.id;
    const targetSl = plainText(f.serviceLineName ?? '');
    const others = existingApprovals.filter(
      (a) => a.id !== myId && plainText(a.serviceLineName ?? '') === targetSl,
    );

    const conflicts: string[] = [];

    const nameVal = plainText(f.approverName ?? '');
    if (nameVal && others.some((a) => plainText(a.approverName ?? '') === nameVal)) {
      conflicts.push('Approver name');
    }

    const orderVal = Number(f.approvalOrder);
    if (f.approvalOrder && !Number.isNaN(orderVal) && orderVal >= 1) {
      if (others.some((a) => Number(a.approvalOrder) === orderVal)) {
        conflicts.push('Approver order');
      }
    }

    if (conflicts.length === 0) return null;
    if (conflicts.length === 1) {
      return `${conflicts[0]} already exists. Please use a different value.`;
    }
    return `${conflicts.join(' and ')} already exist. Please use different values.`;
  };

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit.
  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingApprovals]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<ServiceLineApprovalRow> = editing
      ? {
          serviceLineId: editing.serviceLineId ?? '',
          serviceLineName: editing.serviceLineName ?? '',
          approverName: editing.approverName ?? '',
          approverRole: editing.approverRole ?? '',
          approvalOrder: editing.approvalOrder,
          // Default missing isActive to true — older rows persisted before
          // the Enable field existed render as enabled, matching the
          // "active by default" assumption.
          isActive: editing.isActive ?? true,
          isRequired: editing.isRequired ?? true,
          internalNote: editing.internalNote ?? '',
        }
      : {
          serviceLineId: '',
          serviceLineName: '',
          approverName: '',
          approverRole: '',
          approvalOrder: 1,
          isActive: true,
          isRequired: true,
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Service Line, Approver name, Approver role,
    // and Approver order when any of them is blank. Mark all required
    // fields as touched so the errors render even if the user hasn't
    // blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      serviceLineName: true,
      approverName: true,
      approverRole: true,
      approvalOrder: true,
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
      // Make sure isActive is at least true when submitting — Switch
      // always supplies a boolean, but the field is optional in the
      // type and we want the persisted shape to be unambiguous.
      isActive: formRef.current.isActive ?? true,
    });
    success(
      editing
        ? 'Service line approver updated successfully'
        : 'Service line approver added successfully',
    );
  };

  const slError = reqError(touched.serviceLineName, requiredErrors.serviceLineName);
  const approverNameError = reqError(touched.approverName, requiredErrors.approverName);
  const approverRoleError = reqError(touched.approverRole, requiredErrors.approverRole);
  const orderError = reqError(touched.approvalOrder, requiredErrors.approvalOrder);

  // ── Service Line — search-style autocomplete ─────────────────────────────
  // Mirrors the head pattern used by the Business Category dialog:
  //   - TextField with a search/clear end adornment
  //   - Floating Paper + List of matching options
  //   - Stored value is the service-line name (denormalized on the row)
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

  // ── Approver name — search-style autocomplete (User Management users) ──
  // Stored value is the user's full name (firstName + ' ' + lastName) so
  // the table can render the name directly via its default `mkCell`
  // renderer.
  const [approverInput, setApproverInput] = useState<string>('');
  const [approverOptionsOpen, setApproverOptionsOpen] = useState(false);
  const [approverLoading, setApproverLoading] = useState(false);
  const approverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.approverName ?? '');
    if (stored !== approverInput) {
      setApproverInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.approverName]);

  const approverSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return approverOptions;
      return approverOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [approverOptions],
  );

  const [approverFiltered, setApproverFiltered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  const handleApproverInputChange = useCallback(
    (value: string) => {
      setApproverInput(value);
      if (approverDebounceRef.current) clearTimeout(approverDebounceRef.current);
      approverDebounceRef.current = setTimeout(() => {
        setApproverLoading(true);
        const next = approverSearch(value);
        setApproverFiltered(next);
        setApproverOptionsOpen(next.length > 0);
        setApproverLoading(false);
      }, 200);
    },
    [approverSearch],
  );

  const handleApproverSelect = useCallback(
    (opt: { value: string; label: string; subtitle?: string }) => {
      setApproverInput(opt.label);
      setApproverOptionsOpen(false);
      setApproverFiltered([]);
      setTouched((t) => ({ ...t, approverName: true }));
      updateForm((f) => ({ ...f, approverName: opt.value }));
    },
    [updateForm],
  );

  const handleApproverClear = useCallback(() => {
    setApproverInput('');
    setApproverFiltered([]);
    setApproverOptionsOpen(false);
    updateForm((f) => ({ ...f, approverName: '' }));
  }, [updateForm]);

  // ── Approver role — search-style autocomplete (Consultant Roles) ────────
  const [roleInput, setRoleInput] = useState<string>('');
  const [roleOptionsOpen, setRoleOptionsOpen] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const roleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.approverRole ?? '');
    if (stored !== roleInput) {
      setRoleInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.approverRole]);

  const roleSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return approverRoleOptions;
      return approverRoleOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [approverRoleOptions],
  );

  const [roleFiltered, setRoleFiltered] = useState<{ value: string; label: string }[]>([]);

  const handleRoleInputChange = useCallback(
    (value: string) => {
      setRoleInput(value);
      if (roleDebounceRef.current) clearTimeout(roleDebounceRef.current);
      roleDebounceRef.current = setTimeout(() => {
        setRoleLoading(true);
        const next = roleSearch(value);
        setRoleFiltered(next);
        setRoleOptionsOpen(next.length > 0);
        setRoleLoading(false);
      }, 200);
    },
    [roleSearch],
  );

  const handleRoleSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setRoleInput(opt.label);
      setRoleOptionsOpen(false);
      setRoleFiltered([]);
      setTouched((t) => ({ ...t, approverRole: true }));
      updateForm((f) => ({ ...f, approverRole: opt.value }));
    },
    [updateForm],
  );

  const handleRoleClear = useCallback(() => {
    setRoleInput('');
    setRoleFiltered([]);
    setRoleOptionsOpen(false);
    updateForm((f) => ({ ...f, approverRole: '' }));
  }, [updateForm]);

  // Reset the search fields' transient state whenever the dialog opens so
  // a previously-typed query (and any open popover) doesn't bleed into a
  // new Add/Edit cycle.
  useEffect(() => {
    if (open) {
      setSlOptionsOpen(false);
      setSlFiltered([]);
      setSlLoading(false);
      setApproverOptionsOpen(false);
      setApproverFiltered([]);
      setApproverLoading(false);
      setRoleOptionsOpen(false);
      setRoleFiltered([]);
      setRoleLoading(false);
    }
  }, [open]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<Checklist sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={SLA_ACCENT}
      title='Service Line Approver'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Approver name and Approver order must be unique (within the
          selected Service Line). The Alert is the only signal; no
          per-field red borders for duplicates. */}
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
                        '&:hover': { bgcolor: alpha(SLA_ACCENT, 0.08) },
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

      {/* Approver name — required search field. Sourced from User
          Management → All Users. Stored value is the user's full name. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Approver name'
            placeholder='Search users...'
            value={approverInput}
            onChange={(e) => handleApproverInputChange(e.target.value)}
            onFocus={() => {
              const next = approverSearch(approverInput);
              setApproverFiltered(next);
              if (next.length > 0) setApproverOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, approverName: true }));
              setTimeout(() => setApproverOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(approverNameError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {approverLoading ? (
                        <CircularProgress size={16} />
                      ) : approverInput ? (
                        <ClearIcon
                          onClick={handleApproverClear}
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
          {approverOptionsOpen && approverFiltered.length > 0 && (
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
                {approverFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleApproverSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SLA_ACCENT, 0.08) },
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
            color: approverNameError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {approverNameError || ' '}
        </Typography>
      </Box>

      {/* Approver role — required search field. Sourced from
          Approvals → Consultant Roles. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Approver role'
            placeholder='Search roles...'
            value={roleInput}
            onChange={(e) => handleRoleInputChange(e.target.value)}
            onFocus={() => {
              const next = roleSearch(roleInput);
              setRoleFiltered(next);
              if (next.length > 0) setRoleOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, approverRole: true }));
              setTimeout(() => setRoleOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(approverRoleError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {roleLoading ? (
                        <CircularProgress size={16} />
                      ) : roleInput ? (
                        <ClearIcon
                          onClick={handleRoleClear}
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
          {roleOptionsOpen && roleFiltered.length > 0 && (
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
                {roleFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleRoleSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SLA_ACCENT, 0.08) },
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
            color: approverRoleError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {approverRoleError || ' '}
        </Typography>
      </Box>

      {/* Approver order — required, numeric. Stored as a number; the
          duplicate check (above) requires that no other approver for the
          same Service Line shares this value. */}
      <Box>
        <TextField
          label='Approver order'
          type='number'
          size='small'
          value={form.approvalOrder ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            // Allow empty string (cleared) so the field can show its
            // required state; coerce non-empty to a positive integer.
            if (raw === '') {
              updateForm((f) => ({ ...f, approvalOrder: undefined as unknown as number }));
            } else {
              const n = parseInt(raw, 10);
              if (!Number.isNaN(n)) {
                updateForm((f) => ({ ...f, approvalOrder: Math.max(1, n) }));
              }
            }
          }}
          onBlur={() => setTouched((t) => ({ ...t, approvalOrder: true }))}
          inputProps={{ min: 1, step: 1 }}
          error={Boolean(orderError)}
          helperText={orderError || ' '}
          required
        />
      </Box>

      {/* Enable — Activation row. Mirrors the `activationToggle` field
          used by the Add Approved Estimate dialog (`GenericPanel.tsx`
          ~line 1242): a bordered row that flips its background tint
          based on the Switch state, with title / description on the
          left and an "Active" / "Inactive" label on the right. */}
      {(() => {
        const enabled = form.isActive ?? true;
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
              borderColor: enabled ? alpha(SLA_ACCENT, 0.3) : 'divider',
              bgcolor: enabled ? alpha(SLA_ACCENT, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Typography variant='body2' color='#0369a1' fontWeight={600}>
                Enable
              </Typography>
              <Typography variant='caption' sx={{ color: '#2687bb' }}>
                {enabled
                  ? 'This approver is active and will be used in the approval flow'
                  : 'This approver is inactive and will be skipped'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => updateForm((f) => ({ ...f, isActive: e.target.checked }))}
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

export default ServiceLineApprovalFormDialog;
