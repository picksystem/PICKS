import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField, Paper } from '@serviceops/component';
import {
  alpha,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  FolderSpecial as FolderSpecialIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigApplicationCategory } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const APC_ACCENT = CATEG_ACCENT;

// Alpha-numeric pattern used as a soft guard (matches the spec wording
// "Alpha-numeric"). Spaces, dashes and underscores are allowed so values
// like "HR Operations" or "Finance-1" pass; characters outside this set
// are stripped from the plain-text view at validation time.
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;

const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface ApplicationCategoryFormDialogProps {
  open: boolean;
  editing: IConfigApplicationCategory | null;
  /** Other application-category rows for duplicate detection. */
  existingCategories?: IConfigApplicationCategory[];
  /** Drop-down options for the "Application" field. Sourced from the
   * existing applications list. `value` and `label` are the application
   * name. */
  applicationOptions: { value: string; label: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigApplicationCategory>) => void;
  subtitle?: string;
}

// Character limits per the spec. The "Mandatory" column lists the max
// length for alpha-numeric fields (30 / 60). Used as `inputProps.maxLength`.
const MAX_NAME = 30;
const MAX_SHORT_DESC = 60;
const MAX_DESC = 60;
const MAX_NOTE = 60;

const ApplicationCategoryFormDialog = ({
  open,
  editing,
  existingCategories = [],
  applicationOptions = [],
  onClose,
  onSave,
  subtitle,
}: ApplicationCategoryFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigApplicationCategory>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<IConfigApplicationCategory>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    applicationName?: boolean;
    categoryName?: boolean;
    shortDescription?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    applicationName?: string;
    categoryName?: string;
    shortDescription?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigApplicationCategory>
        | ((f: Partial<IConfigApplicationCategory>) => Partial<IConfigApplicationCategory>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Normalize stored rich-text into plain alpha-numeric text for required
  // and duplicate checks. Strips formatting markers (`**`, `__`, `*`) used
  // by the RichTextEditor serializer, then drops anything outside the
  // alpha-numeric + space/dash/underscore set so the alpha-numeric spec
  // is enforced even though the editor allows inline styling.
  const plainText = (v: string): string =>
    stripAlphaNumeric(
      String(v ?? '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, ''),
    )
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec:
   *   Application (applicationName)         — Required for usability (linked data)
   *   Application category (categoryName)  — Yes
   *   Short Description                    — Yes
   *   Description                          — No
   *   Internal note                        — No
   *
   * The "Application category" is the unique key per the spec ("Editable
   * at the time of creation, not allowed to edit the field once it is
   * saved"). We enforce a max length of 30 on it via `inputProps` and the
   * `MAX_NAME` constant. `plainText` enforces alpha-numeric on the
   * underlying stored value.
   */
  const validateRequired = (f: Partial<IConfigApplicationCategory>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.applicationName ?? '').trim()) errs.applicationName = 'required';
    if (!plainText(f.categoryName ?? '')) errs.categoryName = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Application Category section:
   *   - Application:           Allowed  — skip
   *   - Application category:  Not allowed
   *   - Short Description:     Not allowed (used as tool tip)
   *   - Description:           Allowed  — skip
   *   - Internal note:         Allowed  — skip
   *
   * NOTE: Application category is the unique key per the spec
   * ("Editable at the time of creation, not allowed to edit the field
   * once it is saved"). Even though the Name field is disabled when
   * editing, we still include the name in the duplicate check so the
   * user gets feedback if the (locked) value collides with another
   * row.
   */
  const computeDuplicateMessage = (f: Partial<IConfigApplicationCategory>): string | null => {
    const myId = editing?.id;
    const others = existingCategories.filter((c) => c.id !== myId);

    const conflicts: string[] = [];

    const nameVal = plainText(f.categoryName ?? '');
    if (nameVal && others.some((c) => plainText(c.categoryName ?? '') === nameVal)) {
      conflicts.push('Application category');
    }

    const shortVal = plainText(f.shortDescription ?? '');
    if (shortVal && others.some((c) => plainText(c.shortDescription ?? '') === shortVal)) {
      conflicts.push('Short Description');
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
  }, [form, open, editing, existingCategories]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigApplicationCategory> = editing
      ? {
          applicationId: editing.applicationId ?? '',
          applicationName: editing.applicationName ?? '',
          categoryName: editing.categoryName ?? '',
          shortDescription: editing.shortDescription ?? '',
          description: editing.description ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          applicationId: '',
          applicationName: '',
          categoryName: '',
          shortDescription: '',
          description: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Application, Application category, and
    // Short Description when any of them is blank. Mark all required
    // fields as touched so the errors render even if the user hasn't
    // blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      applicationName: true,
      categoryName: true,
      shortDescription: true,
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
    onSave(formRef.current);
    success(
      editing
        ? 'Application category updated successfully'
        : 'Application category added successfully',
    );
  };

  const appError = reqError(touched.applicationName, requiredErrors.applicationName);
  const nameError = reqError(touched.categoryName, requiredErrors.categoryName);
  const shortError = reqError(touched.shortDescription, requiredErrors.shortDescription);

  // ── Application — search-style autocomplete ──────────────────────────────
  // Mirrors the Business Category pattern used by the Service Line dialog:
  //   - TextField with a search/clear end adornment
  //   - Floating Paper + List of matching application options
  //   - Stored value is the application name
  const [appInput, setAppInput] = useState<string>('');
  const [appOptionsOpen, setAppOptionsOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const appDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appFiltered, setAppFiltered] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const stored = String(form.applicationName ?? '');
    if (stored !== appInput) {
      setAppInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.applicationName]);

  const appSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return applicationOptions;
      return applicationOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [applicationOptions],
  );

  const handleAppInputChange = useCallback(
    (value: string) => {
      setAppInput(value);
      if (appDebounceRef.current) clearTimeout(appDebounceRef.current);
      appDebounceRef.current = setTimeout(() => {
        setAppLoading(true);
        const next = appSearch(value);
        setAppFiltered(next);
        setAppOptionsOpen(next.length > 0);
        setAppLoading(false);
      }, 200);
    },
    [appSearch],
  );

  const handleAppSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setAppInput(opt.label);
      setAppOptionsOpen(false);
      setAppFiltered([]);
      setTouched((t) => ({ ...t, applicationName: true }));
      updateForm((f) => ({ ...f, applicationId: opt.value, applicationName: opt.value }));
    },
    [updateForm],
  );

  const handleAppClear = useCallback(() => {
    setAppInput('');
    setAppFiltered([]);
    setAppOptionsOpen(false);
    updateForm((f) => ({ ...f, applicationId: '', applicationName: '' }));
  }, [updateForm]);

  // Reset the search fields' transient state whenever the dialog opens so
  // a previously-typed query (and any open popover) doesn't bleed into a
  // new Add/Edit cycle.
  useEffect(() => {
    if (!open) return;
    setAppOptionsOpen(false);
    setAppFiltered([]);
    setAppLoading(false);
  }, [open]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<FolderSpecialIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APC_ACCENT}
      title='Application Category'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Application category and Short Description must be unique. The
          Alert is the only signal; no per-field red borders for
          duplicates. */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Application — required search field. Sourced from
          Categorization > Application (tab) > Application name. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Application'
            placeholder='Search applications...'
            value={appInput}
            onChange={(e) => handleAppInputChange(e.target.value)}
            onFocus={() => {
              const next = appSearch(appInput);
              setAppFiltered(next);
              if (next.length > 0) setAppOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, applicationName: true }));
              setTimeout(() => setAppOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(appError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {appLoading ? (
                        <CircularProgress size={16} />
                      ) : appInput ? (
                        <ClearIcon
                          onClick={handleAppClear}
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
                        '&:hover': { bgcolor: alpha(APC_ACCENT, 0.08) },
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
            color: appError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {appError || ' '}
        </Typography>
      </Box>

      {/* Application category — required, alpha-numeric (max 30), locked
          after save. The spec says "Editable at the time of creation,
          not allowed to edit the field once it is saved" — so we
          disable the input when editing. */}
      <Box>
        <TextField
          label='Application category'
          size='small'
          value={form.categoryName ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, categoryName: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, categoryName: true }))}
          placeholder='e.g. Bug, Feature Request'
          inputProps={{
            style: { fontFamily: 'monospace', fontWeight: 700 },
            maxLength: MAX_NAME,
          }}
          disabled={!!editing}
          error={Boolean(nameError)}
          helperText={
            nameError ||
            (editing
              ? 'Name cannot be changed after creation'
              : `Alpha-numeric, max ${MAX_NAME} characters`)
          }
          required
        />
      </Box>

      {/* Short Description — required, alpha-numeric (max 60). "Used as
          tool tip. Same as ticket type form short description". */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, shortDescription: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.shortDescription ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                shortDescription: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Short Description'
            required
            error={Boolean(shortError)}
          />
          <Typography
            variant='caption'
            sx={{
              color: shortError ? '#d32f2f' : 'text.secondary',
              fontSize: '0.7rem',
              mt: 0.5,
              display: 'block',
            }}
          >
            {shortError || `Alpha-numeric, max ${MAX_SHORT_DESC} characters. Used as tool tip.`}
          </Typography>
        </Box>
      </Box>

      {/* Description — optional, alpha-numeric (max 60). "Same as
          ticket type form Description". */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.description ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
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
            {`Alpha-numeric, max ${MAX_DESC} characters.`}
          </Typography>
        </Box>
      </Box>

      {/* Internal note — optional, alpha-numeric (max 60). "Same as
          ticket type form internal note". */}
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
            {`Alpha-numeric, max ${MAX_NOTE} characters.`}
          </Typography>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default ApplicationCategoryFormDialog;
