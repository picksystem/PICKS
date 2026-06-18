import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert, Box, Typography, TextField } from '@serviceops/component';
import { FormControl, FormGroup, Checkbox, Collapse, Radio } from '@mui/material';
import { Speed } from '@mui/icons-material';
import { SimpleLevel, validateSimpleLevelDuplicate } from '../../util';
import { useStyles } from '../../styles';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigFormDialog, ConfigDeleteDialog } from '@serviceops/configdialogs';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
  segmentsToHtml,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

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

interface UrgencySectionProps {
  items: SimpleLevel[];
  onAdd: (data: Partial<SimpleLevel>) => Promise<void> | void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  activeTicketTypeColumns: { key: string; label: string }[];
  isLoading?: boolean;
}

const URGENCY_CONFIG = {
  title: 'Urgency',
  subtitle: 'Define urgency levels — how time-sensitive a ticket is',
  accent: '#0369a1',
  icon: <Speed sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Urgency Level',
  fields: [
    { name: 'displayName', label: 'Urgency', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description', type: 'richText' as const },
    { name: 'description', label: 'Description', type: 'richText' as const },
    { name: 'internalNote', label: 'Internal note', type: 'richText' as const },
  ],
};

const UrgencySection = ({
  items,
  onAdd,
  onEdit,
  onDelete,
  activeTicketTypeColumns,
  isLoading,
}: UrgencySectionProps) => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const reqError = useFieldError();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleLevel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SimpleLevel>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit to get the live value.
  const formRef = useRef<Partial<SimpleLevel>>({});
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [ticketTypesExpanded, setTicketTypesExpanded] = useState(true);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    displayName?: boolean;
    shortDescription?: boolean;
    description?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    displayName?: string;
    shortDescription?: string;
    description?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (patch: Partial<SimpleLevel> | ((f: Partial<SimpleLevel>) => Partial<SimpleLevel>)) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

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
   * Required-field validation per the spec for the Urgency section:
   *   Urgency (displayName)  — Yes
   *   Short Description      — Yes
   *   Description            — Yes
   *   Internal note          — No
   *
   * Rich-text fields are checked on plain text (markers stripped) so a user
   * who only typed formatting without content still fails validation.
   */
  const validateRequired = (f: Partial<SimpleLevel>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.displayName ?? '').trim()) errs.displayName = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    if (!plainText(f.description ?? '')) errs.description = 'required';
    return errs;
  };

  const getActiveTicketTypeCount = (): number => {
    const { enabledFor } = form as { enabledFor?: Record<string, boolean> };
    if (!enabledFor) return activeTicketTypeColumns.length;
    return activeTicketTypeColumns.filter((t) => enabledFor[t.key] ?? true).length;
  };

  const handleNewClick = useCallback(() => {
    setEditingItem(null);
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<SimpleLevel> = {
      isActive: true,
      enabledFor: Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, true])),
    };
    formRef.current = initial;
    setForm(initial);
    setDialogOpen(true);
  }, [activeTicketTypeColumns]);

  const handleEditClick = useCallback(() => {
    const selected = items.find((i) => i.id === selectedRowId);
    if (selected) {
      setEditingItem(selected);
      setTouched({});
      setRequiredErrors({});
      const initial: Partial<SimpleLevel> = {
        displayName: selected.displayName,
        shortDescription: selected.shortDescription ?? '',
        description: selected.description,
        internalNote: selected.internalNote ?? '',
        isActive: selected.isActive ?? true,
        enabledFor: { ...(selected.enabledFor ?? {}) },
      };
      formRef.current = initial;
      setForm(initial);
      setDialogOpen(true);
    }
  }, [items, selectedRowId]);

  const handleDeleteClick = useCallback(() => {
    setDeleteId(selectedRowId);
    setDeleteOpen(true);
  }, [selectedRowId]);

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit. Per spec for the Urgency section:
  //   - Display name (Urgency):  Allowed  — skip
  //   - Short Description:       Not allowed
  //   - Description:             Not allowed
  //   - Internal note:           Allowed  — skip
  useEffect(() => {
    if (!dialogOpen) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(
      validateSimpleLevelDuplicate(formRef.current, items, editingItem)?._form ?? null,
    );
  }, [form, dialogOpen, editingItem, items]);

  const handleSubmit = useCallback(async () => {
    // Read the ref, not the `form` state — see formRef comment above for why.
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Urgency, Short Description, and Description
    // when any of them is blank. Mark all required fields as touched so the
    // errors render even if the user hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ displayName: true, shortDescription: true, description: true });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const dupError = validateSimpleLevelDuplicate(formRef.current, items, editingItem);
    if (dupError) {
      setDuplicateAlert(dupError._form);
      return;
    }
    setDuplicateAlert(null);
    try {
      if (editingItem) {
        await onEdit(editingItem.id, formRef.current);
        success('Urgency updated successfully');
      } else {
        await onAdd(formRef.current);
        success('Urgency added successfully');
      }
    } catch (err) {
      showError('Failed to save urgency level. Please try again.');
    } finally {
      setDialogOpen(false);
      setEditingItem(null);
      formRef.current = {};
      setForm({});
    }
  }, [editingItem, items, onEdit, onAdd, success, showError]);

  // Handle ticket type checkbox
  const handleTicketTypeChange = useCallback(
    (ticketType: string, checked: boolean) => {
      updateForm((f) => {
        const current = (f as { enabledFor?: Record<string, boolean> }).enabledFor ?? {};
        return {
          ...f,
          enabledFor: { ...current, [ticketType]: checked },
        };
      });
    },
    [updateForm],
  );

  const handleSelectAllTicketTypes = useCallback(
    (checked: boolean) => {
      updateForm((f) => ({
        ...f,
        enabledFor: Object.fromEntries(activeTicketTypeColumns.map((t) => [t.key, checked])),
      }));
    },
    [activeTicketTypeColumns, updateForm],
  );

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (deleteId) {
        await onDelete(deleteId);
        success('Urgency deleted successfully');
        setSelectedRowId(null);
      }
    } catch (err) {
      showError('Failed to delete urgency level. Please try again.');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  }, [deleteId, onDelete, success, showError]);

  const handleRowSelect = useCallback((id: string | null) => {
    setSelectedRowId(id);
  }, []);

  const customColumns = useMemo(
    () => [
      {
        id: 'displayName',
        label: 'Urgency Values',
        minWidth: 120,
        format: (_v: unknown, row: Record<string, unknown>): React.ReactNode => (
          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{String(row.displayName)}</span>
        ),
      },
      {
        id: 'shortDescription',
        label: 'Short Description',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
      },
      {
        id: 'description',
        label: 'Description',
        minWidth: 240,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 300),
      },
      {
        id: 'internalNote',
        label: 'Internal note',
        minWidth: 200,
        format: (v: unknown): React.ReactNode => renderRichTextCell(v, 260),
      },
      ...activeTicketTypeColumns.map((t) => ({
        id: `enabledFor_${t.key}`,
        label: t.label,
        minWidth: 130,
        align: 'center' as const,
        format: (_v: unknown, row: SimpleLevel): React.ReactNode => {
          const isActive = row?.enabledFor?.[t.key] ?? false;
          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: 999,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                minWidth: 96,
                border: '1px solid',
                borderColor: isActive ? '#16a34a' : '#cbd5e1',
                bgcolor: isActive ? '#dcfce7' : '#f1f5f9',
                color: isActive ? '#15803d' : '#64748b',
              }}
            >
              <Box
                component='span'
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: isActive ? '#16a34a' : '#94a3b8',
                  boxShadow: isActive ? '0 0 0 3px rgba(22, 163, 74, 0.18)' : 'none',
                }}
              />
              {isActive ? 'Active' : 'Inactive'}
            </Box>
          );
        },
      })),
    ],
    [activeTicketTypeColumns],
  );

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={URGENCY_CONFIG}
        data={items as unknown as Record<string, unknown>[]}
        onSave={() => {}}
        variant='plain'
        customColumns={customColumns as unknown as undefined}
        defaultExpanded={false}
        isLoading={isLoading}
        loaderMessage='Loading Urgency levels...'
        selectedRowId={selectedRowId}
        onRowSelect={handleRowSelect}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        validateFields={validateSimpleLevelDuplicate as never}
      />

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
          setTouched({});
          setRequiredErrors({});
          formRef.current = {};
          setForm({});
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingItem}
        icon={<Speed sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#0369a1'
        title='Urgency Level'
        submitDisabled={Boolean(duplicateAlert)}
        submitLabel={editingItem ? 'Save' : 'Submit'}
        maxWidth='md'
        subtitle={URGENCY_CONFIG.subtitle}
      >
        {/* Duplicate Alert — single dialog-level message. Per spec, only
            Short Description and Description must be unique. The Alert is
            the only signal; no per-field red borders for duplicates. */}
        {duplicateAlert && (
          <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
            {duplicateAlert}
          </Alert>
        )}

        <TextField
          label='Urgency'
          size='small'
          value={form.displayName ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateForm((f) => ({ ...f, displayName: e.target.value }))
          }
          onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
          placeholder='e.g. 1-Immediate, 2-High, 3-Medium, 4-Low'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          error={Boolean(reqError(touched.displayName, requiredErrors.displayName))}
          helperText={reqError(touched.displayName, requiredErrors.displayName)}
          required
        />

        <Box>
          <Box
            onBlur={() => setTouched((t) => ({ ...t, shortDescription: true }))}
            sx={{ borderRadius: 1 }}
          >
            <RichTextEditor
              value={parseRichText(form.shortDescription ?? '')}
              onChange={(value) =>
                updateForm((f) => ({ ...f, shortDescription: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Short Description'
              required
              error={Boolean(reqError(touched.shortDescription, requiredErrors.shortDescription))}
            />
            <Typography
              variant='caption'
              sx={{
                color: reqError(touched.shortDescription, requiredErrors.shortDescription)
                  ? '#d32f2f'
                  : 'text.secondary',
                fontSize: '0.7rem',
                mt: 0.5,
                display: 'block',
              }}
            >
              {reqError(touched.shortDescription, requiredErrors.shortDescription) ||
                'Brief summary shown in compact views'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            sx={{ borderRadius: 1 }}
          >
            <RichTextEditor
              value={parseRichText(form.description ?? '')}
              onChange={(value) =>
                updateForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Description'
              required
              error={Boolean(reqError(touched.description, requiredErrors.description))}
            />
            <Typography
              variant='caption'
              sx={{
                color: reqError(touched.description, requiredErrors.description)
                  ? '#d32f2f'
                  : 'text.secondary',
                fontSize: '0.7rem',
                mt: 0.5,
                display: 'block',
              }}
            >
              {reqError(touched.description, requiredErrors.description) ||
                'Describe when this urgency level should be used'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <RichTextEditor
            value={parseRichText(form.internalNote ?? '')}
            onChange={(value) =>
              updateForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Internal note'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Internal note for this urgency level (not visible to end users) — optional
          </Typography>
        </Box>

        {/* ── Ticket Types Activation ── */}
        <Box>
          <Box
            sx={{
              border: '1px solid #2d5ebb',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              onClick={() => setTicketTypesExpanded(!ticketTypesExpanded)}
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
                Ticket Types Activation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='caption'
                  color='#0369a1'
                  sx={{ fontWeight: 500, fontSize: '0.78rem' }}
                >
                  {getActiveTicketTypeCount()} of {activeTicketTypeColumns.length} selected
                </Typography>
                <Radio
                  size='small'
                  checked={getActiveTicketTypeCount() === activeTicketTypeColumns.length}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleSelectAllTicketTypes(e.target.checked)}
                  sx={{
                    '&.Mui-checked': { color: '#0369a1' },
                  }}
                />
                <Typography variant='caption' sx={{ fontWeight: 500, color: '#0369a1' }}>
                  Select All
                </Typography>
              </Box>
            </Box>

            <Collapse in={ticketTypesExpanded}>
              <Box sx={{ px: 2, pb: 2 }}>
                <FormControl component='fieldset' fullWidth>
                  <FormGroup>
                    {activeTicketTypeColumns.map((ticketType) => {
                      const isChecked = form.enabledFor?.[ticketType.key] ?? true;
                      return (
                        <Box
                          key={ticketType.key}
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
                              handleTicketTypeChange(ticketType.key, e.target.checked)
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
                              {ticketType.label}
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
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName='Urgency'
        itemName={items.find((i) => i.id === deleteId)?.displayName}
      />
    </div>
  );
};

export { UrgencySection };
