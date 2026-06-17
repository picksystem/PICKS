import { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Divider,
  Checkbox,
} from '@serviceops/component';
import {
  alpha,
  darken,
  Dialog,
  DialogContent,
  DialogActions,
  ListSubheader,
  Radio,
  FormGroup,
  FormControl,
  Collapse,
} from '@mui/material';
import { useFormik } from 'formik';
import { CreateTicketTypeSchema } from '@serviceops/interfaces';
import { TicketTypeFormDialogProps } from './util';
import {
  TICKET_ICON_OPTIONS,
  TICKET_TAG_OPTIONS,
  DEFAULT_TYPE_ICONS,
  DEFAULT_TYPE_TAGS,
  getIconComponent,
  getTagOption,
} from '../../utils/ticketTypeIcons';
import { useStyles } from '../../styles';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import CustomDropdown from './components/CustomDropdown';

// Access control roles
const ACCESS_CONTROL_ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
  { value: 'consultant', label: 'Consultant', description: 'Can view and manage tickets' },
  { value: 'endUser', label: 'End User', description: 'Basic ticket creation and viewing' },
];

function generateTicketId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}

function buildPreview(prefix: string, length: number): string {
  const num = length > 0 ? '1'.padStart(length, '0') : '';
  return `${prefix.toUpperCase()}${num}`;
}

// Normalize a value for case-insensitive duplicate comparison
const normalize = (v: unknown): string =>
  String(v ?? '')
    .trim()
    .toLowerCase();

// Strip rich text markers (**, *, __) and decode to plain text for duplicate checks
const plainText = (v: string): string =>
  String(v ?? '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

const TicketTypeFormDialog = ({
  open,
  editingItem,
  existingTicketTypes = [],
  iconMap,
  tagMap,
  onClose,
  onSubmit,
}: TicketTypeFormDialogProps) => {
  const isEditing = editingItem !== null;
  const { classes } = useStyles();
  const reqError = useFieldError();
  const { success } = useNotification();
  const [accessControlExpanded, setAccessControlExpanded] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<Record<string, string>>({});

  // Initialize rich text values
  const getInitialDescription = (): string => {
    if (editingItem?.description) {
      return editingItem.description;
    }
    return '';
  };

  const getInitialShortDescription = (): string => {
    if (editingItem?.shortDescription) {
      return editingItem.shortDescription;
    }
    return '';
  };

  const getInitialIcon = () => {
    if (editingItem) return iconMap[editingItem.type] ?? DEFAULT_TYPE_ICONS[editingItem.type] ?? '';
    return '';
  };

  const getInitialTag = () => {
    if (editingItem) return tagMap[editingItem.type] ?? '';
    return '';
  };

  // Get initial access control values
  const getInitialAccessControl = (): string[] => {
    if (editingItem && 'accessControl' in editingItem && editingItem.accessControl) {
      return editingItem.accessControl as unknown as string[];
    }
    // Default: all roles selected
    return ['admin', 'consultant', 'endUser'];
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      type: editingItem?.type ?? '',
      name: editingItem?.name ?? '',
      displayName: editingItem?.displayName ?? '',
      displayTag: editingItem?.displayTag ?? '',
      shortDescription: getInitialShortDescription(),
      description: getInitialDescription(),
      prefix: editingItem?.prefix ?? '',
      isActive: editingItem?.isActive ?? true,
      numberLength: editingItem?.numberLength ?? undefined,
      iconKey: getInitialIcon(),
      tag: getInitialTag() || '',
      accessControl: getInitialAccessControl(),
      selectAll: getInitialAccessControl().length === 3,
    },
    validationSchema: CreateTicketTypeSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        // Check for duplicates: only fields marked as "Not allowed" per requirements
        const dupErrors: Record<string, string> = {};
        const myId = editingItem?.id;
        const others = existingTicketTypes.filter((t) => t.id !== myId);

        // 1. Ticket type (name) - must be unique
        const nameVal = normalize(values.name);
        if (nameVal && others.some((t) => normalize(t.name) === nameVal)) {
          dupErrors.name = 'Ticket type already exists';
        }

        // 2. Description - must be unique
        const descVal = plainText(values.description ?? '');
        if (descVal && others.some((t) => plainText(t.description ?? '') === descVal)) {
          dupErrors.description = 'Description already exists';
        }

        // 3. Display tag - must be unique
        const tagVal = normalize(values.displayTag);
        if (tagVal && others.some((t) => normalize(t.displayTag) === tagVal)) {
          dupErrors.displayTag = 'Display tag already exists';
        }

        // 4. Numbering Prefix - must be unique
        const prefixVal = normalize(values.prefix);
        if (prefixVal && others.some((t) => normalize(t.prefix) === prefixVal)) {
          dupErrors.prefix = 'Numbering prefix already exists';
        }

        // Mark all required fields as touched so validation errors show on submit
        formik.setTouched({
          ...formik.touched,
          name: true,
          displayTag: true,
          displayName: true,
          description: true,
          tag: true,
          iconKey: true,
          prefix: true,
          numberLength: true,
        });

        if (Object.keys(dupErrors).length > 0) {
          setErrors(dupErrors);
          setDuplicateErrors(dupErrors);
          setSubmitting(false);
          return;
        }
        await onSubmit({
          type: values.type,
          name: values.name,
          displayName: values.displayName ?? '',
          displayTag: values.displayTag ?? '',
          shortDescription: values.shortDescription ?? '',
          description: values.description ?? '',
          prefix: (values.prefix ?? '').toUpperCase(),
          isActive: values.isActive ?? true,
          numberLength: Number(values.numberLength) || 7,
          iconKey: values.iconKey,
          tag: values.tag,
          accessControl: values.accessControl,
        });
        success(isEditing ? 'Ticket Type updated successfully' : 'Ticket Type added successfully');
        resetForm();
        setDuplicateErrors({});
      } catch (error) {
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle access control checkboxes
  const handleAccessControlChange = useCallback(
    (role: string, checked: boolean) => {
      let newRoles = [...formik.values.accessControl];
      if (checked) {
        if (!newRoles.includes(role)) {
          newRoles.push(role);
        }
      } else {
        newRoles = newRoles.filter((r) => r !== role);
      }
      formik.setFieldValue('accessControl', newRoles);
      formik.setFieldValue('selectAll', newRoles.length === 3);
    },
    [formik],
  );

  // Handle "Select All" toggle
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      const newRoles = checked ? ['admin', 'consultant', 'endUser'] : [];
      formik.setFieldValue('accessControl', newRoles);
      formik.setFieldValue('selectAll', checked);
    },
    [formik],
  );

  useEffect(() => {
    if (!isEditing) {
      formik.setFieldValue('type', generateTicketId(formik.values.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.name, isEditing]);

  useEffect(() => {
    if (!isEditing && formik.values.type) {
      if (DEFAULT_TYPE_ICONS[formik.values.type])
        formik.setFieldValue('iconKey', DEFAULT_TYPE_ICONS[formik.values.type]);
      if (DEFAULT_TYPE_TAGS[formik.values.type])
        formik.setFieldValue('tag', DEFAULT_TYPE_TAGS[formik.values.type]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.type, isEditing]);

  // Clear duplicate errors when dialog opens
  useEffect(() => {
    if (open) {
      setDuplicateErrors({});
    }
  }, [open]);

  const handleClose = () => {
    formik.resetForm();
    setDuplicateErrors({});
    onClose();
  };

  const FALLBACK_COLOR = '#64748b';
  const tagColor = getTagOption(formik.values.tag)?.color ?? FALLBACK_COLOR;
  const color = tagColor;
  const gradient = `linear-gradient(135deg, ${darken(tagColor, 0.2)} 0%, ${tagColor} 100%)`;
  const numberLengthVal = formik.values.numberLength
    ? parseInt(formik.values.numberLength.toString(), 10)
    : 7;
  const preview = buildPreview(formik.values.prefix || '???', numberLengthVal);
  const displayLabel = formik.values.name || 'Ticket Type Name';
  const descriptionPreview =
    parseRichText(formik.values.displayName ?? '')
      .segments.map((s) => s.text)
      .join(' ') || 'Add a display name';
  const tagOption = getTagOption(formik.values.tag);
  const displayTagOption =
    (getTagOption(formik.values.displayTag)?.label ?? formik.values.displayTag) ||
    'Add display tag';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      disableEnforceFocus
      PaperProps={{ className: classes.dialogPaper }}
    >
      {/* ══ LIVE PREVIEW HERO BANNER ══════════════════════════════════════════ */}
      <Box className={classes.dialogHeroBanner} sx={{ background: gradient }}>
        <Box className={classes.dialogDecorCircleTop} />
        <Box className={classes.dialogDecorCircleBottom} />

        <Box className={classes.dialogHeroInner}>
          {/* Top row: icon + name + chips */}
          <Box className={classes.dialogHeroTopRow}>
            <Box className={classes.dialogHeroIconWrap}>
              {getIconComponent(formik.values.iconKey, {
                color: '#fff',
                fontSize: { xs: '1.2rem', sm: '1.6rem' },
              })}
            </Box>
            <Box className={classes.dialogHeroTextWrap}>
              <Typography className={classes.dialogHeroTitle}>{displayLabel}</Typography>
              <Box className={classes.dialogHeroChipRow}>
                {tagOption && (
                  <Chip
                    label={tagOption.label}
                    size='small'
                    className={classes.dialogHeroTagChip}
                  />
                )}
                <Chip label={preview} size='small' className={classes.dialogHeroFormatChip} />
                <Chip
                  label={formik.values.isActive ? 'Active' : 'Inactive'}
                  size='small'
                  className={classes.dialogHeroStatusChip}
                  sx={{
                    bgcolor: formik.values.isActive ? 'rgba(34,197,94,0.25)' : 'rgba(0,0,0,0.2)',
                    border: formik.values.isActive
                      ? '1px solid rgba(34,197,94,0.5)'
                      : '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Display tag */}
          {displayTagOption && (
            <Typography className={classes.dialogHeroDescription}>{displayTagOption}</Typography>
          )}

          {/* Description */}
          <Typography className={classes.dialogHeroDescription}>{descriptionPreview}</Typography>
        </Box>
      </Box>

      {/* ══ FORM ══════════════════════════════════════════════════════════════ */}
      <DialogContent className={classes.dialogContent}>
        <Box
          component='form'
          id='ticket-type-form'
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            formik.handleSubmit();
          }}
          noValidate
          className={classes.dialogForm}
        >
          <Grid container spacing={2.5}>
            {/* ── TICKET TYPE DETAILS ── */}
            <Grid size={{ xs: 12 }}>
              <Divider>
                <Typography color='text.secondary' className={classes.dialogDividerLabel}>
                  TICKET TYPE DETAILS
                </Typography>
              </Divider>
            </Grid>

            {/* Duplicate Error Alert */}
            {Object.keys(duplicateErrors).length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity='error' variant='outlined'>
                  {Object.values(duplicateErrors).map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                  ))}
                </Alert>
              </Grid>
            )}

            {/* 1. Ticket Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Ticket Type'
                name='name'
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(reqError(formik.touched.name, formik.errors.name as string))}
                helperText={reqError(formik.touched.name, formik.errors.name as string)}
                fullWidth
                size='small'
                required
                inputProps={{ maxLength: 25 }}
              />
            </Grid>

            {/* 3. Display Tag */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Display Tag'
                name='displayTag'
                value={formik.values.displayTag}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.displayTag, formik.errors.displayTag as string),
                )}
                helperText={
                  reqError(formik.touched.displayTag, formik.errors.displayTag as string) ||
                  'Displays as a tag in the new ticket creation page'
                }
                fullWidth
                size='small'
                placeholder='e.g. Incident, Request, Task'
                required
                inputProps={{ maxLength: 40 }}
              />
            </Grid>

            {/* 4. Display Text (RichTextEditor, like Add Approved Estimate) */}
            <Grid size={{ xs: 12 }}>
              <Box
                onBlur={() => formik.setFieldTouched('displayName', true)}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(formik.values.displayName ?? '')}
                  onChange={(value) => {
                    formik.setFieldValue('displayName', serializeRichText(value.segments));
                    formik.setFieldTouched('displayName', true, false);
                  }}
                  showFooterActions={false}
                  title='Display Text'
                  error={Boolean(
                    reqError(formik.touched.displayName, formik.errors.displayName as string),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(formik.touched.displayName, formik.errors.displayName as string)
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(formik.touched.displayName, formik.errors.displayName as string) ||
                    'Displays as a text in the new ticket creation page'}
                </Typography>
              </Box>
            </Grid>

            {/* 4. Priority Tag */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDropdown
                label='Priority Tag'
                value={formik.values.tag}
                onChange={(value) => {
                  formik.setFieldValue('tag', value);
                  if (!value) {
                    formik.setFieldError('tag', 'Priority tag is required');
                  } else {
                    formik.setFieldError('tag', undefined);
                  }
                  formik.setFieldTouched('tag', true, false);
                }}
                onBlur={() => formik.setFieldTouched('tag', true, true)}
                options={TICKET_TAG_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                  color: opt.color,
                }))}
                selectedColor={tagColor}
                error={Boolean(formik.touched.tag && formik.errors.tag)}
                helperText={
                  reqError(formik.touched.tag, formik.errors.tag as string) ||
                  'Select a priority tag for this ticket type'
                }
                required
              />
            </Grid>

            {/* 5. Icon */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDropdown
                label='Icon'
                value={formik.values.iconKey}
                onChange={(value) => {
                  formik.setFieldValue('iconKey', value);
                  if (!value) {
                    formik.setFieldError('iconKey', 'Icon is required');
                  } else {
                    formik.setFieldError('iconKey', undefined);
                  }
                  formik.setFieldTouched('iconKey', true, false);
                }}
                onBlur={() => formik.setFieldTouched('iconKey', true, true)}
                options={TICKET_ICON_OPTIONS.map((opt) => ({
                  value: opt.key,
                  label: opt.label,
                  category: opt.category,
                }))}
                selectedColor={color}
                gradient={gradient}
                showIconInSelect
                error={Boolean(formik.touched.iconKey && formik.errors.iconKey)}
                helperText={
                  reqError(formik.touched.iconKey, formik.errors.iconKey as string) ||
                  'Select an icon for this ticket type'
                }
                required
              />
            </Grid>

            {/* ── 6. Description (RichTextEditor, like Add Approved Estimate) ── */}
            <Grid size={{ xs: 12 }}>
              <Box
                onBlur={() => formik.setFieldTouched('description', true)}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(formik.values.description ?? '')}
                  onChange={(value) => {
                    formik.setFieldValue('description', serializeRichText(value.segments));
                    formik.setFieldTouched('description', true, false);
                  }}
                  showFooterActions={false}
                  title='Description'
                  error={Boolean(
                    reqError(formik.touched.description, formik.errors.description as string),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: reqError(formik.touched.description, formik.errors.description as string)
                      ? '#d32f2f'
                      : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {reqError(formik.touched.description, formik.errors.description as string) ||
                    'Describe this ticket type and when it should be used'}
                </Typography>
              </Box>
            </Grid>

            {/* ── 7. Internal Note (RichTextEditor, like Add Approved Estimate) ── */}
            <Grid size={{ xs: 12 }}>
              <Box
                onBlur={() => formik.setFieldTouched('shortDescription', true)}
                sx={{ borderRadius: 1 }}
              >
                <RichTextEditor
                  value={parseRichText(formik.values.shortDescription ?? '')}
                  onChange={(value) => {
                    formik.setFieldValue('shortDescription', serializeRichText(value.segments));
                    formik.setFieldTouched('shortDescription', true, false);
                  }}
                  showFooterActions={false}
                  title='Internal Note'
                  error={Boolean(
                    reqError(
                      formik.touched.shortDescription,
                      formik.errors.shortDescription as string,
                    ),
                  )}
                />
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  Internal note for this ticket type (optional)
                </Typography>
              </Box>
            </Grid>

            {/* ── 8. Access Control ── */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  border: '1px solid #2d5ebb',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  onClick={() => setAccessControlExpanded(!accessControlExpanded)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: '#f0f4f8',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Typography
                    variant='body2'
                    color='#0369a1'
                    sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Access Control
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='caption' color='#0369a1'>
                      {formik.values.accessControl.length} of {ACCESS_CONTROL_ROLES.length} selected
                    </Typography>
                    <Radio
                      size='small'
                      checked={formik.values.selectAll}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleSelectAllChange(e.target.checked)}
                      sx={{
                        '&.Mui-checked': { color: '#0369a1' },
                      }}
                    />
                    <Typography variant='caption' sx={{ fontWeight: 500, color: '#0369a1' }}>
                      Select All
                    </Typography>
                  </Box>
                </Box>

                <Collapse in={accessControlExpanded}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <FormControl component='fieldset' fullWidth>
                      <FormGroup>
                        {ACCESS_CONTROL_ROLES.map((role) => {
                          const isChecked = formik.values.accessControl.includes(role.value);
                          return (
                            <Box
                              key={role.value}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.75,
                                borderBottom: '1px solid',
                                borderColor: '#2d5ebb',
                                '&:last-child': { borderBottom: 'none' },
                              }}
                            >
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) =>
                                  handleAccessControlChange(role.value, e.target.checked)
                                }
                                sx={{
                                  color: '#0369a1',
                                  '&.Mui-checked': { color: '#0369a1' },
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant='body2'
                                  sx={{ fontWeight: 500, fontSize: '0.85rem' }}
                                >
                                  {role.label}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {role.description}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </FormGroup>
                    </FormControl>
                  </Box>
                </Collapse>
              </Box>
            </Grid>

            {/* ── NUMBERING ── */}

            {/* Prefix */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label='Numbering Prefix'
                name='prefix'
                value={formik.values.prefix}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 6);
                  formik.setFieldValue('prefix', value);
                }}
                onBlur={formik.handleBlur}
                error={Boolean(reqError(formik.touched.prefix, formik.errors.prefix as string))}
                helperText={
                  reqError(formik.touched.prefix, formik.errors.prefix as string) ||
                  'Prefix in ticket number'
                }
                fullWidth
                size='small'
                required
                className={classes.dialogPrefixInput}
                placeholder='e.g. INC, SRQ'
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            {/* Number Length */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label='Number Length'
                name='numberLength'
                type='number'
                value={formik.values.numberLength}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '') {
                    formik.setFieldValue('numberLength', '');
                    formik.setFieldError('numberLength', 'Number length is required');
                    formik.setFieldTouched('numberLength', true, false);
                  } else {
                    const val = parseInt(inputValue, 10);
                    if (!isNaN(val)) {
                      formik.setFieldValue('numberLength', Math.min(9, Math.max(0, val)));
                      formik.setFieldError('numberLength', undefined);
                      formik.setFieldTouched('numberLength', true, false);
                    }
                  }
                }}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.numberLength, formik.errors.numberLength as string),
                )}
                helperText={
                  reqError(formik.touched.numberLength, formik.errors.numberLength as string) ||
                  'Digits in ticket number'
                }
                fullWidth
                size='small'
                required
                inputProps={{ min: 0, max: 9 }}
              />
            </Grid>

            {/* Format Preview (display only) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label='Format Preview'
                value={buildPreview(formik.values.prefix || '???', numberLengthVal)}
                fullWidth
                size='small'
                disabled
                InputProps={{ readOnly: true }}
                helperText='Preview of ticket numbering'
              />
            </Grid>

            {/* Active switch */}
            <Grid size={{ xs: 12 }}>
              <Box
                className={classes.dialogActivationRow}
                sx={{
                  borderColor: formik.values.isActive ? alpha(color, 0.3) : 'divider',
                  bgcolor: formik.values.isActive ? alpha(color, 0.04) : 'transparent',
                }}
              >
                <Box>
                  <Typography variant='body2' color='#0369a1' fontWeight={600}>
                    Activation Status
                  </Typography>
                  <Typography
                    variant='caption'
                    color='#2687bb'
                    className={classes.dialogActivationDescription}
                  >
                    {formik.values.isActive
                      ? 'This ticket type is active and available to users'
                      : 'This ticket type is inactive and hidden from users'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      name='isActive'
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                      color='success'
                    />
                  }
                  label={
                    <Typography
                      variant='body2'
                      fontWeight={700}
                      className={classes.dialogActivationLabel}
                      sx={{
                        color: formik.values.isActive ? 'success.main' : 'text.secondary',
                      }}
                    >
                      {formik.values.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                  className={classes.dialogActivationFormControl}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* ══ ACTIONS ═══════════════════════════════════════════════════════════ */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          onClick={handleClose}
          variant='outlined'
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type='button'
          variant='contained'
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          disabled={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
        >
          {formik.isSubmitting ? 'Saving...' : isEditing ? 'Save' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketTypeFormDialog;
