import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField, Switch } from '@serviceops/component';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import { AccessTime, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigApprovedEstimateRow } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { APPROVED_ESTIMATES_ACCENT } from '../../sections/General/components/ApprovedEstimates/shared/ApprovedEstimatesConfig';

interface ApprovedEstimateFormDialogProps {
  open: boolean;
  editing: IConfigApprovedEstimateRow | null;
  existingEstimates?: IConfigApprovedEstimateRow[];
  serviceLineOptions?: { value: string; label: string }[];
  applicationOptions?: { value: string; label: string }[];
  queueOptions?: { value: string; label: string }[];
  ticketTypeOptions?: { id: number; name: string; displayName: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigApprovedEstimateRow>) => void;
  subtitle?: string;
}

const ApprovedEstimateFormDialog = ({
  open,
  editing,
  existingEstimates = [],
  serviceLineOptions = [],
  applicationOptions = [],
  queueOptions = [],
  ticketTypeOptions = [],
  onClose,
  onSave,
  subtitle,
}: ApprovedEstimateFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigApprovedEstimateRow>>({});
  const formRef = useRef<Partial<IConfigApprovedEstimateRow>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{
    ticketTypeName?: boolean;
    hours?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    ticketTypeName?: string;
    hours?: string;
  }>({});

  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigApprovedEstimateRow>
        | ((f: Partial<IConfigApprovedEstimateRow>) => Partial<IConfigApprovedEstimateRow>),
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

  const validateRequired = (f: Partial<IConfigApprovedEstimateRow>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.ticketTypeName ?? '').trim()) errs.ticketTypeName = 'required';
    if (f.hours === undefined || f.hours === null || String(f.hours).trim() === '') {
      errs.hours = 'required';
    }
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<IConfigApprovedEstimateRow>): string | null => {
    const myId = editing?.id;
    const targetSl = plainText(f.serviceLine ?? '');
    const targetApp = plainText(f.application ?? '');
    const targetQueue = plainText(f.queue ?? '');
    const targetTT = plainText(f.ticketTypeName ?? '');

    const others = existingEstimates.filter((e) => e.id !== myId);

    const dup = others.find(
      (o) =>
        plainText(o.serviceLine ?? '') === targetSl &&
        plainText(o.application ?? '') === targetApp &&
        plainText(o.queue ?? '') === targetQueue &&
        plainText(o.ticketTypeName ?? '') === targetTT,
    );
    if (dup) {
      return 'A matching entry with this Service Line, Application, Queue and Ticket Type already exists.';
    }
    return null;
  };

  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingEstimates]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    setDuplicateAlert(null);
    const initial: Partial<IConfigApprovedEstimateRow> = editing
      ? {
          id: editing.id,
          ticketTypeId: editing.ticketTypeId,
          ticketTypeName: editing.ticketTypeName,
          serviceLine: editing.serviceLine ?? '',
          application: editing.application ?? '',
          queue: editing.queue ?? '',
          hours: editing.hours,
          shortDescription: editing.shortDescription ?? '',
          isActive: editing.isActive ?? true,
        }
      : {
          ticketTypeId: 0,
          ticketTypeName: '',
          serviceLine: '',
          application: '',
          queue: '',
          hours: 0,
          shortDescription: '',
          isActive: true,
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ ticketTypeName: true, hours: true });
    if (Object.keys(reqErrs).length > 0) return;

    const message = computeDuplicateMessage(formRef.current);
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSave({
      ...formRef.current,
      isActive: formRef.current.isActive ?? true,
    });
    success(
      editing ? 'Approved estimate updated successfully' : 'Approved estimate added successfully',
    );
  };

  const ttNameError = reqError(touched.ticketTypeName, requiredErrors.ticketTypeName);
  const hoursError = reqError(touched.hours, requiredErrors.hours);

  // ── Ticket Type search state ───────────────────────────────────────
  const [ttInput, setTtInput] = useState<string>('');
  const [ttOptionsOpen, setTtOptionsOpen] = useState(false);
  const [ttFiltered, setTtFiltered] = useState<{ value: string; label: string }[]>([]);
  const ttDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.ticketTypeName ?? '');
    if (stored !== ttInput) setTtInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ticketTypeName]);

  const handleTtSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setTtInput(opt.label);
      setTtOptionsOpen(false);
      setTtFiltered([]);
      setTouched((t) => ({ ...t, ticketTypeName: true }));
      updateForm((f) => ({
        ...f,
        ticketTypeId: Number(opt.value),
        ticketTypeName: opt.label,
      }));
    },
    [updateForm],
  );

  const handleTtClear = useCallback(() => {
    setTtInput('');
    setTtFiltered([]);
    setTtOptionsOpen(false);
    updateForm((f) => ({ ...f, ticketTypeId: 0, ticketTypeName: '' }));
  }, [updateForm]);

  // ── Service Line search state ───────────────────────────────────────
  const [slInput, setSlInput] = useState<string>('');
  const [slOptionsOpen, setSlOptionsOpen] = useState(false);
  const [slFiltered, setSlFiltered] = useState<{ value: string; label: string }[]>([]);
  const slDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.serviceLine ?? '');
    if (stored !== slInput) setSlInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.serviceLine]);

  const handleSlSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setSlInput(opt.label);
      setSlOptionsOpen(false);
      setSlFiltered([]);
      updateForm((f) => ({ ...f, serviceLine: opt.value }));
    },
    [updateForm],
  );

  const handleSlClear = useCallback(() => {
    setSlInput('');
    setSlFiltered([]);
    setSlOptionsOpen(false);
    updateForm((f) => ({ ...f, serviceLine: '' }));
  }, [updateForm]);

  // ── Application search state ────────────────────────────────────────
  const [appInput, setAppInput] = useState<string>('');
  const [appOptionsOpen, setAppOptionsOpen] = useState(false);
  const [appFiltered, setAppFiltered] = useState<{ value: string; label: string }[]>([]);
  const appDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.application ?? '');
    if (stored !== appInput) setAppInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.application]);

  const handleAppSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setAppInput(opt.label);
      setAppOptionsOpen(false);
      setAppFiltered([]);
      updateForm((f) => ({ ...f, application: opt.value }));
    },
    [updateForm],
  );

  const handleAppClear = useCallback(() => {
    setAppInput('');
    setAppFiltered([]);
    setAppOptionsOpen(false);
    updateForm((f) => ({ ...f, application: '' }));
  }, [updateForm]);

  // ── Queue search state ──────────────────────────────────────────────
  const [qInput, setQInput] = useState<string>('');
  const [qOptionsOpen, setQOptionsOpen] = useState(false);
  const [qFiltered, setQFiltered] = useState<{ value: string; label: string }[]>([]);
  const qDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.queue ?? '');
    if (stored !== qInput) setQInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.queue]);

  const handleQSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setQInput(opt.label);
      setQOptionsOpen(false);
      setQFiltered([]);
      updateForm((f) => ({ ...f, queue: opt.value }));
    },
    [updateForm],
  );

  const handleQClear = useCallback(() => {
    setQInput('');
    setQFiltered([]);
    setQOptionsOpen(false);
    updateForm((f) => ({ ...f, queue: '' }));
  }, [updateForm]);

  const isEnabled = form.isActive ?? true;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<AccessTime sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APPROVED_ESTIMATES_ACCENT}
      title='Approved Estimate'
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

      {/* Ticket Type — required search field */}
      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Ticket Type'
          placeholder='Search ticket types...'
          value={ttInput}
          onChange={(e) => {
            const val = e.target.value;
            setTtInput(val);
            if (ttDebounceRef.current) clearTimeout(ttDebounceRef.current);
            ttDebounceRef.current = setTimeout(() => {
              const q = val.trim().toLowerCase();
              const next = q
                ? ticketTypeOptions
                    .filter((o) => [o.displayName, o.name].some((n) => n.toLowerCase().includes(q)))
                    .map((o) => ({ value: o.id.toString(), label: o.displayName || o.name }))
                : ticketTypeOptions.map((o) => ({
                    value: o.id.toString(),
                    label: o.displayName || o.name,
                  }));
              setTtFiltered(next);
              setTtOptionsOpen(next.length > 0);
            }, 200);
          }}
          onFocus={() => {
            const q = ttInput.trim().toLowerCase();
            const next = q
              ? ticketTypeOptions
                  .filter((o) => [o.displayName, o.name].some((n) => n.toLowerCase().includes(q)))
                  .map((o) => ({ value: o.id.toString(), label: o.displayName || o.name }))
              : ticketTypeOptions.map((o) => ({
                  value: o.id.toString(),
                  label: o.displayName || o.name,
                }));
            setTtFiltered(next);
            if (next.length > 0) setTtOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setTtOptionsOpen(false), 200)}
          fullWidth
          size='small'
          required
          error={Boolean(ttNameError)}
          helperText={ttNameError}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {ttInput ? (
                      <ClearIcon
                        onClick={handleTtClear}
                        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
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
        {ttOptionsOpen && ttFiltered.length > 0 && (
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
              {ttFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleTtSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(APPROVED_ESTIMATES_ACCENT, 0.08) },
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

      {/* Service Line — optional search field */}
      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Service Line'
          placeholder='Search service lines...'
          value={slInput}
          onChange={(e) => {
            const val = e.target.value;
            setSlInput(val);
            if (slDebounceRef.current) clearTimeout(slDebounceRef.current);
            slDebounceRef.current = setTimeout(() => {
              const q = val.trim().toLowerCase();
              const next = q
                ? serviceLineOptions.filter((o) => o.label.toLowerCase().includes(q))
                : serviceLineOptions;
              setSlFiltered(next);
              setSlOptionsOpen(next.length > 0);
            }, 200);
          }}
          onFocus={() => {
            const q = slInput.trim().toLowerCase();
            const next = q
              ? serviceLineOptions.filter((o) => o.label.toLowerCase().includes(q))
              : serviceLineOptions;
            setSlFiltered(next);
            if (next.length > 0) setSlOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setSlOptionsOpen(false), 200)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {slInput ? (
                      <ClearIcon
                        onClick={handleSlClear}
                        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
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
                      '&:hover': { bgcolor: alpha(APPROVED_ESTIMATES_ACCENT, 0.08) },
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

      {/* Application — optional search field */}
      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Application'
          placeholder='Search applications...'
          value={appInput}
          onChange={(e) => {
            const val = e.target.value;
            setAppInput(val);
            if (appDebounceRef.current) clearTimeout(appDebounceRef.current);
            appDebounceRef.current = setTimeout(() => {
              const q = val.trim().toLowerCase();
              const next = q
                ? applicationOptions.filter((o) => o.label.toLowerCase().includes(q))
                : applicationOptions;
              setAppFiltered(next);
              setAppOptionsOpen(next.length > 0);
            }, 200);
          }}
          onFocus={() => {
            const q = appInput.trim().toLowerCase();
            const next = q
              ? applicationOptions.filter((o) => o.label.toLowerCase().includes(q))
              : applicationOptions;
            setAppFiltered(next);
            if (next.length > 0) setAppOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setAppOptionsOpen(false), 200)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {appInput ? (
                      <ClearIcon
                        onClick={handleAppClear}
                        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
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
        {appOptionsOpen && appFiltered.length > 0 && (
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
              {appFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleAppSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(APPROVED_ESTIMATES_ACCENT, 0.08) },
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

      {/* Queue — optional search field */}
      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Queue'
          placeholder='Search queues...'
          value={qInput}
          onChange={(e) => {
            const val = e.target.value;
            setQInput(val);
            if (qDebounceRef.current) clearTimeout(qDebounceRef.current);
            qDebounceRef.current = setTimeout(() => {
              const q = val.trim().toLowerCase();
              const next = q
                ? queueOptions.filter((o) => o.label.toLowerCase().includes(q))
                : queueOptions;
              setQFiltered(next);
              setQOptionsOpen(next.length > 0);
            }, 200);
          }}
          onFocus={() => {
            const q = qInput.trim().toLowerCase();
            const next = q
              ? queueOptions.filter((o) => o.label.toLowerCase().includes(q))
              : queueOptions;
            setQFiltered(next);
            if (next.length > 0) setQOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setQOptionsOpen(false), 200)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {qInput ? (
                      <ClearIcon
                        onClick={handleQClear}
                        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
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
        {qOptionsOpen && qFiltered.length > 0 && (
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
              {qFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleQSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(APPROVED_ESTIMATES_ACCENT, 0.08) },
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

      {/* Default Hours — required numeric field */}
      <Box sx={{ mt: 1 }}>
        <TextField
          label='Default Hours'
          placeholder='e.g. 60:00 or 2.5'
          value={form.hours ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              updateForm((f) => ({ ...f, hours: 0 }));
            } else {
              const n = Number(raw);
              if (!Number.isNaN(n)) {
                updateForm((f) => ({ ...f, hours: n }));
              }
            }
          }}
          onBlur={() => setTouched((t) => ({ ...t, hours: true }))}
          fullWidth
          size='small'
          required
          error={Boolean(hoursError)}
          helperText={hoursError}
        />
      </Box>

      {/* Internal Note — optional rich text */}
      <Box sx={{ mt: 1 }}>
        <Box sx={{ borderRadius: 1 }}>
          <RichTextEditor
            value={parseRichText(form.shortDescription ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                shortDescription: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Internal Note'
          />
        </Box>
      </Box>

      {/* Enable — Activation row */}
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
              borderColor: enabled ? alpha(APPROVED_ESTIMATES_ACCENT, 0.3) : 'divider',
              bgcolor: enabled ? alpha(APPROVED_ESTIMATES_ACCENT, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Typography variant='body2' color={APPROVED_ESTIMATES_ACCENT} fontWeight={600}>
                Enable
              </Typography>
              <Typography variant='caption' sx={{ color: '#2687bb' }}>
                {enabled ? 'This default estimate is enabled' : 'This default estimate is disabled'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body2'
                fontWeight={700}
                sx={{ color: enabled ? 'success.main' : 'text.secondary' }}
              >
                {enabled ? 'Active' : 'Inactive'}
              </Typography>
              <Switch
                checked={enabled}
                onChange={(e) => updateForm((f) => ({ ...f, isActive: e.target.checked }))}
                color='success'
              />
            </Box>
          </Box>
        );
      })()}
    </ConfigFormDialog>
  );
};

export default ApprovedEstimateFormDialog;
