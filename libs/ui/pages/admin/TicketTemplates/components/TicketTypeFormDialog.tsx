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
  getTypeColor,
  getTypeGradient,
} from '../utils/ticketTypeIcons';

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

  const color = getTypeColor(formik.values.type || editingItem?.type || '');
  const gradient = getTypeGradient(formik.values.type || editingItem?.type || '');
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
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
    >
      {/* ══ LIVE PREVIEW HERO BANNER ══════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          background: gradient,
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 3, sm: 3.5 },
          pb: { xs: 3, sm: 3.5 },
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -35,
            left: 80,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Icon badge */}
          <Box
            sx={{
              width: { xs: 56, sm: 68 },
              height: { xs: 56, sm: 68 },
              borderRadius: { xs: 3, sm: 4 },
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            {getIconComponent(formik.values.iconKey, {
              color: '#fff',
              fontSize: { xs: '1.6rem', sm: '2rem' },
            })}
          </Box>

          {/* Text content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title row: name + tag chip (like create-ticket card) + active chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '1.1rem', sm: '1.35rem' },
                  lineHeight: 1.25,
                  letterSpacing: '-0.3px',
                }}
              >
                {displayLabel}
              </Typography>

              {/* Tag chip — exactly like create-ticket card style */}
              {tagOption && (
                <Chip
                  label={tagOption.label}
                  size='small'
                  sx={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.35)',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                    height: 20,
                    borderRadius: '6px',
                    letterSpacing: 0.3,
                  }}
                />
              )}

              {/* Active/Inactive chip */}
              <Chip
                label={formik.values.isActive ? 'Active' : 'Inactive'}
                size='small'
                sx={{
                  bgcolor: formik.values.isActive ? 'rgba(34,197,94,0.25)' : 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  height: 20,
                  border: formik.values.isActive
                    ? '1px solid rgba(34,197,94,0.5)'
                    : '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </Box>

            {/* Format preview code */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: 3,
                  lineHeight: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {preview}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  FORMAT
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {descriptionPreview}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ FORM ══════════════════════════════════════════════════════════════ */}
      <DialogContent sx={{ p: 0 }}>
        <Box
          component='form'
          id='ticket-type-form'
          onSubmit={formik.handleSubmit}
          sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}
        >
          {/* Section label */}
          <Divider>
            <Typography
              variant='caption'
              color='text.secondary'
              fontWeight={600}
              sx={{ fontSize: '0.68rem', letterSpacing: 0.5 }}
            >
              TICKET TYPE DETAILS
            </Typography>
          </Divider>

          <Grid container spacing={2.5}>
            {/* Ticket ID — auto-generated */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Ticket ID'
                name='type'
                value={formik.values.type}
                fullWidth
                size='small'
                disabled
                helperText='Auto-generated from name · Cannot be changed after creation'
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': { bgcolor: alpha(color, 0.04) },
                  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(color, 0.2),
                  },
                }}
              />
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
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  sx={{ fontSize: '0.68rem', letterSpacing: 0.5 }}
                >
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
                inputProps={{
                  maxLength: 6,
                  style: {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  },
                }}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: 1,
                            background: gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
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
                        <ListSubheader
                          key={`hdr-${cat}`}
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: 1,
                            lineHeight: '28px',
                            bgcolor: 'grey.50',
                            color: 'text.secondary',
                          }}
                        >
                          {cat.toUpperCase()}
                        </ListSubheader>,
                        ...items.map((opt) => {
                          const isActive = formik.values.iconKey === opt.key;
                          return (
                            <MenuItem key={opt.key} value={opt.key} dense>
                              <ListItemIcon sx={{ minWidth: 34 }}>
                                <Box
                                  sx={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 1,
                                    background: isActive ? gradient : alpha(color, 0.08),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
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

            {/* Tag / Priority */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: opt.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant='body2'
                          fontSize='0.82rem'
                          fontWeight={600}
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
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
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
                            sx={{
                              ml: 1,
                              px: 0.75,
                              py: 0.125,
                              borderRadius: 1,
                              bgcolor: alpha(opt.color, 0.12),
                              border: `1px solid ${alpha(opt.color, 0.3)}`,
                            }}
                          >
                            <Typography
                              sx={{ fontSize: '0.6rem', fontWeight: 700, color: opt.color }}
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
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: formik.values.isActive ? alpha(color, 0.3) : 'divider',
                  bgcolor: formik.values.isActive ? alpha(color, 0.04) : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box>
                  <Typography variant='body2' fontWeight={600}>
                    Activation Status
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
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
                      sx={{ color: formik.values.isActive ? 'success.main' : 'text.secondary' }}
                    >
                      {formik.values.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                  sx={{ mr: 0, ml: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* ══ ACTIONS ═══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(color, 0.02),
        }}
      >
        <Button
          type='submit'
          form='ticket-type-form'
          variant='contained'
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 130,
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 1, sm: 2 },
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
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 100,
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 2, sm: 1 },
          }}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
};

export default TicketTypeFormDialog;
