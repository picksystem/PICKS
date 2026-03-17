import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  alpha,
  darken,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import { CreateTicketTypeSchema, ITicketType } from '@picks/interfaces';
import { useFieldError } from '@picks/hooks';
import {
  TICKET_ICON_OPTIONS,
  TICKET_TAG_OPTIONS,
  DEFAULT_TYPE_ICONS,
  DEFAULT_TYPE_TAGS,
  getIconComponent,
  getTagOption,
} from '../../utils/ticketTypeIcons';
import { useStyles } from '../../styles';

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

interface TicketTypeFormDialogProps {
  open: boolean;
  editingItem: ITicketType | null;
  advancedSequences: boolean;
  iconMap: Record<string, string>;
  tagMap: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    name: string;
    displayName: string;
    description: string;
    prefix: string;
    isActive: boolean;
    numberLength: number;
    iconKey: string;
    tag: string;
  }) => Promise<void>;
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

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      type: editingItem?.type ?? '',
      name: editingItem?.name ?? '',
      displayName: editingItem?.displayName ?? '',
      description: editingItem?.description ?? '',
      prefix: editingItem?.prefix ?? '',
      isActive: editingItem?.isActive ?? true,
      numberLength: editingItem?.numberLength ?? 7,
      iconKey: getInitialIcon(),
      tag: getInitialTag(),
    },
    validationSchema: CreateTicketTypeSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await onSubmit({
          type: values.type,
          name: values.name,
          displayName: values.displayName ?? '',
          description: values.description ?? '',
          prefix: (values.prefix ?? '').toUpperCase(),
          isActive: values.isActive ?? true,
          numberLength: values.numberLength ?? 7,
          iconKey: values.iconKey,
          tag: values.tag,
        });
        resetForm();
      } finally {
        setSubmitting(false);
      }
    },
  });

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
  const displayLabel = formik.values.displayName || formik.values.name || 'Ticket Type Name';
  const descriptionPreview =
    formik.values.description || 'Add a description to describe this ticket type and its purpose.';
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

            {/* Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Name'
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

            {/* Display Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Display Name'
                name='displayName'
                value={formik.values.displayName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.displayName, formik.errors.displayName as string),
                )}
                helperText={
                  reqError(formik.touched.displayName, formik.errors.displayName as string) ||
                  'Shown in UI to end users'
                }
                fullWidth
                size='small'
                required
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Description'
                name='description'
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  reqError(formik.touched.description, formik.errors.description as string),
                )}
                helperText={reqError(
                  formik.touched.description,
                  formik.errors.description as string,
                )}
                fullWidth
                size='small'
                multiline
                rows={2}
                placeholder='Describe this ticket type and when it should be used...'
                required
              />
            </Grid>

            {/* ── NUMBERING & ICON ── */}
            <Grid size={{ xs: 12 }}>
              <Divider>
                <Typography color='text.secondary' className={classes.dialogDividerLabel}>
                  NUMBERING &amp; ICON
                </Typography>
              </Divider>
            </Grid>

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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

            {/* Icon Picker */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Icon</InputLabel>
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

            {/* Priority Tag */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Priority Tag</InputLabel>
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
      <Box className={classes.dialogFooter} sx={{ bgcolor: alpha(color, 0.02) }}>
        <Button
          type='submit'
          form='ticket-type-form'
          variant='contained'
          className={classes.dialogSaveBtn}
          sx={{
            background: gradient,
            boxShadow: `0 4px 16px ${alpha(color, 0.4)}`,
            '&:hover': {
              background: gradient,
              filter: 'brightness(1.08)',
              boxShadow: `0 6px 20px ${alpha(color, 0.5)}`,
            },
          }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Ticket Type'}
        </Button>
        <Button
          onClick={handleClose}
          variant='outlined'
          className={classes.dialogCancelBtn}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
};

export default TicketTypeFormDialog;
