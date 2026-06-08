import { useEffect, useState, useCallback } from 'react';
import {
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
import { parseRichText, serializeRichText } from '../../shared/RichTextEditor';

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
  const num = '1'.padStart(Math.max(1, length), '0');
  return `${prefix.toUpperCase()}${num}`;
}

const TicketTypeFormDialog = ({
  open,
  editingItem,
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

  // Initialize rich text values
  const getInitialDescription = () => {
    if (editingItem?.description) {
      return parseRichText(editingItem.description);
    }
    return { segments: [] };
  };

  const getInitialShortDescription = () => {
    if (editingItem?.shortDescription) {
      return parseRichText(editingItem.shortDescription);
    }
    return { segments: [] };
  };

  const getInitialIcon = () => {
    if (editingItem)
      return iconMap[editingItem.type] ?? DEFAULT_TYPE_ICONS[editingItem.type] ?? 'warning_amber';
    return 'warning_amber';
  };

  const getInitialTag = () => {
    if (editingItem)
      return tagMap[editingItem.type] ?? DEFAULT_TYPE_TAGS[editingItem.type] ?? 'Standard';
    return 'Standard';
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
      numberLength: editingItem?.numberLength ?? 7,
      iconKey: getInitialIcon(),
      tag: getInitialTag(),
      accessControl: getInitialAccessControl(),
      selectAll: getInitialAccessControl().length === 3,
    },
    validationSchema: CreateTicketTypeSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await onSubmit({
          type: values.type,
          name: values.name,
          displayName: values.displayName ?? '',
          displayTag: values.displayTag ?? '',
          shortDescription: serializeRichText(values.shortDescription.segments),
          description: serializeRichText(values.description.segments),
          prefix: (values.prefix ?? '').toUpperCase(),
          isActive: values.isActive ?? true,
          numberLength: values.numberLength ?? 7,
          iconKey: values.iconKey,
          tag: values.tag,
          accessControl: values.accessControl,
        });
        success(isEditing ? 'Ticket Type updated successfully' : 'Ticket Type added successfully');
        resetForm();
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

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const FALLBACK_COLOR = '#64748b';
  const tagColor = getTagOption(formik.values.tag)?.color ?? FALLBACK_COLOR;
  const color = tagColor;
  const gradient = `linear-gradient(135deg, ${darken(tagColor, 0.2)} 0%, ${tagColor} 100%)`;
  const preview = buildPreview(formik.values.prefix || '???', formik.values.numberLength || 7);
  const displayLabel = formik.values.name || formik.values.displayName || 'Ticket Type Name';
  const descriptionPreview =
    serializeRichText(formik.values.description.segments) ||
    'Add a description to describe this ticket type and its purpose.';
  const tagOption = getTagOption(formik.values.tag);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
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

          {/* Format preview */}
          <Box className={classes.dialogHeroFormatRow}>
            <Typography className={classes.dialogHeroFormatCode}>{preview}</Typography>
            <Box className={classes.dialogHeroFormatBadge}>
              <Typography className={classes.dialogHeroFormatBadgeText}>FORMAT</Typography>
            </Box>
          </Box>

          {/* Description */}
          <Typography className={classes.dialogHeroDescription}>{descriptionPreview}</Typography>
        </Box>
      </Box>

      {/* ══ FORM ══════════════════════════════════════════════════════════════ */}
      <DialogContent className={classes.dialogContent}>
        <Box
          component='form'
          id='ticket-type-form'
          onSubmit={formik.handleSubmit}
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
              />
            </Grid>

            {/* 3. Display Tag */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='New Ticket Creation Page Display Tag'
                name='displayTag'
                value={formik.values.displayTag}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.displayTag, formik.errors.displayTag as string),
                )}
                helperText={
                  reqError(formik.touched.displayTag, formik.errors.displayTag as string) || ''
                }
                fullWidth
                size='small'
                placeholder='e.g. Incident, Request, Task'
              />
            </Grid>

            {/* 4. Display Text */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='New Ticket Creation Page Display Text'
                name='displayName'
                value={formik.values.displayName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.displayName, formik.errors.displayName as string),
                )}
                helperText={reqError(
                  formik.touched.displayName,
                  formik.errors.displayName as string,
                )}
                fullWidth
                size='small'
                required
              />
            </Grid>

            {/* 4. Priority Tag */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size='small'>
                <Select
                  name='tag'
                  value={formik.values.tag}
                  label='Priority Tag'
                  onChange={(e) => formik.setFieldValue('tag', e.target.value)}
                  renderValue={(selected) => {
                    const opt = TICKET_TAG_OPTIONS.find((t) => t.value === selected);
                    if (!opt) return selected;
                    return (
                      <Box className={classes.dialogSelectRenderValue}>
                        <Box className={classes.dialogTagDot} sx={{ bgcolor: opt.color }} />
                        <Typography
                          variant='body2'
                          className={classes.dialogTagRenderLabel}
                          sx={{ color: opt.color }}
                        >
                          {opt.label}
                        </Typography>
                      </Box>
                    );
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {TICKET_TAG_OPTIONS.map((opt) => {
                    const isActive = formik.values.tag === opt.value;
                    return (
                      <MenuItem key={opt.value} value={opt.value} dense>
                        <ListItemIcon className={classes.dialogTagListItemIcon}>
                          <Box
                            className={classes.dialogTagMenuDot}
                            sx={{
                              bgcolor: opt.color,
                              border: isActive ? `2px solid ${opt.color}` : 'none',
                              outline: isActive ? `2px solid ${alpha(opt.color, 0.3)}` : 'none',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={opt.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.82rem',
                            fontWeight: isActive ? 700 : 400,
                            sx: { color: isActive ? opt.color : 'text.primary' },
                          }}
                        />
                        {isActive && (
                          <Box
                            className={classes.dialogTagSelectedBadge}
                            sx={{
                              bgcolor: alpha(opt.color, 0.12),
                              border: `1px solid ${alpha(opt.color, 0.3)}`,
                            }}
                          >
                            <Typography
                              className={classes.dialogTagSelectedLabel}
                              sx={{ color: opt.color }}
                            >
                              SELECTED
                            </Typography>
                          </Box>
                        )}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* 5. Icon */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size='small'>
                <Select
                  name='iconKey'
                  value={formik.values.iconKey}
                  label='Icon'
                  onChange={(e) => formik.setFieldValue('iconKey', e.target.value)}
                  renderValue={(selected) => {
                    const opt = TICKET_ICON_OPTIONS.find((o) => o.key === selected);
                    return (
                      <Box className={classes.dialogSelectRenderValue}>
                        <Box
                          className={classes.dialogIconPreviewWrap}
                          sx={{ background: gradient }}
                        >
                          {getIconComponent(selected, { color: '#fff', fontSize: '0.75rem' })}
                        </Box>
                        <Typography variant='body2' fontSize='0.82rem'>
                          {opt?.label ?? selected}
                        </Typography>
                      </Box>
                    );
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 340 } } }}
                >
                  {(() => {
                    const categories = Array.from(
                      new Set(TICKET_ICON_OPTIONS.map((o) => o.category)),
                    );
                    return categories.flatMap((cat) => {
                      const items = TICKET_ICON_OPTIONS.filter((o) => o.category === cat);
                      return [
                        <ListSubheader key={`hdr-${cat}`} className={classes.dialogIconSubheader}>
                          {cat.toUpperCase()}
                        </ListSubheader>,
                        ...items.map((opt) => {
                          const isActive = formik.values.iconKey === opt.key;
                          return (
                            <MenuItem key={opt.key} value={opt.key} dense>
                              <ListItemIcon className={classes.dialogIconListItemIcon}>
                                <Box
                                  className={classes.dialogIconMenuWrap}
                                  sx={{
                                    background: isActive ? gradient : alpha(color, 0.08),
                                  }}
                                >
                                  {getIconComponent(opt.key, {
                                    fontSize: '0.85rem',
                                    color: isActive ? '#fff' : color,
                                  })}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={opt.label}
                                primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                              />
                            </MenuItem>
                          );
                        }),
                      ];
                    });
                  })()}
                </Select>
              </FormControl>
            </Grid>

            {/* ── 6. Description (textarea) ── */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Description'
                name='description'
                value={formik.values.description?.segments?.[0]?.text ?? ''}
                onChange={(e) =>
                  formik.setFieldValue('description', { segments: [{ text: e.target.value }] })
                }
                placeholder='Describe this ticket type and when it should be used...'
                multiline
                minRows={4}
                fullWidth
                size='small'
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Grid>

            {/* ── 7. Internal Note (textarea only) ── */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Internal Note'
                name='shortDescription'
                value={formik.values.shortDescription?.segments?.[0]?.text ?? ''}
                onChange={(e) =>
                  formik.setFieldValue('shortDescription', { segments: [{ text: e.target.value }] })
                }
                placeholder='A brief summary of this ticket type for internal use...'
                multiline
                minRows={3}
                fullWidth
                size='small'
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Grid>

            {/* ── 8. Access Control ── */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
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
                    bgcolor: accessControlExpanded ? 'action.hover' : 'transparent',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Access Control
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
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
                    <Typography variant='caption' sx={{ fontWeight: 500 }}>
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
                                borderColor: 'divider',
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label='Prefix'
                name='prefix'
                value={formik.values.prefix}
                onChange={(e) => formik.setFieldValue('prefix', e.target.value.toUpperCase())}
                onBlur={formik.handleBlur}
                error={Boolean(reqError(formik.touched.prefix, formik.errors.prefix as string))}
                helperText={
                  reqError(formik.touched.prefix, formik.errors.prefix as string) || 'e.g. INC, SRQ'
                }
                fullWidth
                size='small'
                required
                className={classes.dialogPrefixInput}
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            {/* Number Length */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Number Length'
                name='numberLength'
                type='number'
                value={formik.values.numberLength}
                onChange={formik.handleChange}
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
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>

            {/* Format Preview (display only) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Format Preview'
                value={buildPreview(formik.values.prefix || '???', formik.values.numberLength || 7)}
                fullWidth
                size='small'
                disabled
                InputProps={{ readOnly: true }}
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
                  <Typography variant='body2' fontWeight={600}>
                    Activation Status
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
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
          type='submit'
          form='ticket-type-form'
          variant='contained'
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving...' : isEditing ? 'Save' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketTypeFormDialog;
