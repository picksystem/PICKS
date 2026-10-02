import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Typography,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Tooltip,
  IconButton,
  Paper,
  MenuList,
  MenuItem,
  ListItemText,
  Alert,
  AlertTitle,
  InputAdornment,
  alpha,
  darken,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ErrorIcon from '@mui/icons-material/Error';
import { CloudUploadOutlined, DeleteOutline } from '@mui/icons-material';
import { Box, TextField, Checkbox, Button } from '@serviceops/component';
import { useStyles } from './styles';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';
import CustomFieldRenderer from './CustomFieldRenderer';
import { activateDropdown, deactivateDropdown } from './dropdownRegistry';
import { useFieldError } from '@serviceops/hooks';
import { RichTextEditor } from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

// ── Section metadata ──────────────────────────────────────────────────────────
const SECTION_META = [
  { label: 'Ticket Information' },
  { label: 'Categorization' },
  { label: 'Description' },
  { label: 'Priority, Status and Assignment' },
  { label: 'Audit Information' },
  { label: 'Attachments' },
];

// ── Shared Searchable Field (portal-based dropdown) ──────────────────────
const SearchableField = ({
  value,
  options,
  onChange,
  onBlur,
  error,
  errorText,
  label,
  required,
  icon,
  maxLength = 50,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: React.ReactNode;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  maxLength?: number;
}) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closerRef = useRef<(() => void) | null>(null);

  if (!closerRef.current) {
    closerRef.current = () => setIsOpen(false);
  }

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const resolvedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    setSearchText(resolvedLabel);
  }, [resolvedLabel]);

  // Update menu position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeDropdown = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsOpen(false);
    setMenuRect(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (newValue.length > 0 && filteredOptions.length > 0 && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
        setIsOpen(true);
      } else {
        closeDropdown();
      }
    }, 200);
  };

  const handleClear = () => {
    setSearchText('');
    onChange('');
    closeDropdown();
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSearchText(option.label);
    onChange(option.value);
    closeDropdown();
  };

  const handleFocus = () => {
    if (options.length > 0) {
      activateDropdown(closerRef.current!);
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
      }
      setIsOpen(true);
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Clean up our slot when this field unmounts
  useEffect(() => {
    return () => deactivateDropdown(closerRef.current!);
  }, []);

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      deactivateDropdown(closerRef.current!);
      closeDropdown();
      onBlur?.(e);
    },
    [onBlur, closeDropdown],
  );

  const portalContent =
    isOpen && filteredOptions.length > 0 && menuRect ? (
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          zIndex: 1400,
          maxHeight: 280,
          overflow: 'auto',
        }}
      >
        <MenuList dense disablePadding>
          {filteredOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSelectOption(option)}
              selected={searchText === option.label}
              onMouseDown={handleItemMouseDown}
              sx={{ py: 1, px: 1.5 }}
            >
              <ListItemText
                primary={option.label}
                primaryTypographyProps={{
                  fontSize: '0.84rem',
                  noWrap: true,
                }}
              />
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    ) : null;

  return (
    <Box ref={anchorRef} sx={{ position: 'relative' }}>
      <TextField
        name={label.toLowerCase().replace(/\s+/g, '')}
        label={label}
        value={searchText}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleInputBlur}
        placeholder={`Search or select ${label.toLowerCase()}`}
        inputProps={{ maxLength }}
        required={required}
        error={error}
        errorText={errorText}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position='start'>{icon}</InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position='end'>
              {searchText ? (
                <IconButton
                  size='small'
                  edge='end'
                  aria-label='Clear search'
                  onClick={handleClear}
                  sx={{ p: 0.5, color: 'text.secondary' }}
                >
                  <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              ) : (
                <SearchIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
              )}
            </InputAdornment>
          ),
        }}
      />
      {portalContent ? createPortal(portalContent, document.body) : null}
    </Box>
  );
};

const CreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const errorAlertRef = useRef<HTMLDivElement>(null);

  const {
    formik,
    config,
    isLoading,
    isUpdatingCaller,
    attachedFiles,
    setAttachedFiles,
    manualCallerOpen,
    setManualCallerOpen,
    ticketNumber,
    createdDateTime,
    callerOptions,
    impactOptions,
    urgencyOptions,
    statusOptions,
    channelOptions,
    businessCategoryOptions,
    serviceLineOptions,
    applicationOptions,
    applicationCategoryOptions,
    applicationSubCategoryOptions,
    validationFailed,
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleCreateTicket,
    handleSaveAsDraft,
    handleSearchForSolution,
    customFields,
    layoutConfig,
    getCfValue,
    setCfValue,
  } = useCreateTicketDetail({ ticketType, onCancel, onSuccess });

  // Map section index → layout config key for createTicket sections
  const SECTION_LAYOUT_KEYS: string[] = [
    'ticketInformation',
    'categorization',
    'description',
    'priorityAssignment',
    'auditInformation',
    'attachments',
  ];

  /** Returns the custom fields assigned to a given form section index */
  const getCustomFieldsForSection = (sectionIndex: number) => {
    if (!layoutConfig || !customFields?.length) return [];
    const layoutKey = SECTION_LAYOUT_KEYS[sectionIndex];
    const sectionConfig = (layoutConfig.createTicket as any)?.[layoutKey];
    if (!sectionConfig?.selectedFields?.length) return [];
    return customFields
      .filter((cf: any) => sectionConfig.selectedFields.includes(cf.fieldKey))
      .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  };

  // ── Rich-text editor helpers ───────────────────────────────────────────────
  const htmlToSegments = (html: string): { text: string }[] => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent?.trim() ?? '';
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => ({ text: line }));
  };

  const segmentsToFormik = (segments: { text: string }[]): string => {
    if (segments.length === 0) return '';
    const div = document.createElement('div');
    segments.forEach((s) => {
      const p = document.createElement('p');
      p.textContent = s.text;
      div.appendChild(p);
    });
    return div.innerHTML;
  };

  const [descriptionRichTextValue, setDescriptionRichTextValue] = useState<{
    segments: { text: string }[];
  }>({ segments: htmlToSegments(formik.values.description || '') });

  const handleRichTextChange = useCallback(
    (value: { segments: { text: string }[] }) => {
      setDescriptionRichTextValue(value);
      const html = segmentsToFormik(value.segments);
      formik.setFieldValue('description', html);
    },
    [formik],
  );

  // ── Validation ─────────────────────────────────────────────────────────────
  const showValidationErrors = validationFailed && Object.keys(formik.errors).length > 0;

  useEffect(() => {
    if (showValidationErrors) {
      errorAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showValidationErrors]);

  // ── Section wrapper ───────────────────────────────────────────────────────
  const wrap = (index: number, children: React.ReactNode, collapsible = false) => {
    const m = SECTION_META[index];

    const title = <Typography className={classes.sectionCardTitle}>{m.label}</Typography>;

    if (collapsible) {
      return (
        <MuiAccordion
          defaultExpanded={false}
          disableGutters
          sx={{
            borderRadius: '14px !important',
            mb: 2.5,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            '&::before': { display: 'none' },
          }}
        >
          <MuiAccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#64748b', fontSize: 20 }} />}
            sx={{
              backgroundColor: '#fff',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 0,
              px: 2.5,
              py: 0,
              '&.Mui-expanded': { minHeight: 0 },
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              },
            }}
          >
            {title}
          </MuiAccordionSummary>
          <MuiAccordionDetails sx={{ p: 0 }}>
            <Box className={classes.sectionCardBody}>{children}</Box>
          </MuiAccordionDetails>
        </MuiAccordion>
      );
    }

    return (
      <Box className={classes.sectionCard}>
        <Box className={classes.sectionCardHeader}>{title}</Box>
        <Box className={classes.sectionCardBody}>{children}</Box>
      </Box>
    );
  };

  const descHasError = !!(formik.touched.description && formik.errors.description);

  return (
    <Box className={classes.formContainer}>
      {/* ── Hero header ───────────────────────────────────────────────── */}
      <Box className={classes.ticketHero} sx={{ background: '#ffffff', boxShadow: 'none' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography className={classes.ticketHeroTitle}>{config.title}</Typography>
          </Box>
          <Typography className={classes.ticketHeroSub}>{config.subtitle}</Typography>
        </Box>
        <Box sx={{ flexShrink: 0, ml: 3, textAlign: 'right' }}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
            {ticketNumber}
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#64748b', fontWeight: 400, lineHeight: 1.5, marginTop: '2px' }}
          >
            Ticket Number
          </Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit} noValidate>
        {/* ── 1. Ticket Information ────────────────────────────────────── */}
        {wrap(
          0,
          <>
            <Box className={classes.formGrid}>
              <SearchableField
                value={formik.values.client}
                options={callerOptions}
                onChange={(value) => formik.setFieldValue('client', value)}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.client && formik.errors.client)}
                errorText={reqError(formik.touched.client, formik.errors.client as string)}
                label='Client'
                required
              />
              <SearchableField
                value={formik.values.caller}
                options={callerOptions}
                onChange={(value) => handleCallerChange(value)}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.caller && formik.errors.caller)}
                errorText={reqError(formik.touched.caller, formik.errors.caller as string)}
                label='Affected User'
                required
              />
              <SearchableField
                value={formik.values.additionalContacts}
                options={callerOptions}
                onChange={(value) => formik.setFieldValue('additionalContacts', value)}
                label='Additional Contact(s)'
              />
              {getCustomFieldsForSection(0).map((cf: any) => (
                <CustomFieldRenderer
                  key={cf.id}
                  field={cf}
                  value={getCfValue(cf.fieldKey)}
                  onChange={(v) => setCfValue(cf.fieldKey, v)}
                />
              ))}
            </Box>

            {/* Manual caller */}
            <Box className={classes.manualCallerSection} sx={{ mt: 2 }}>
              <Checkbox
                label="Can't find in the list? Update manually"
                checked={manualCallerOpen}
                onChange={() => setManualCallerOpen(!manualCallerOpen)}
              />
              {manualCallerOpen && (
                <Box className={classes.manualCallerFields}>
                  <Box className={classes.formGrid}>
                    <TextField
                      name='callerFirstName'
                      label='First Name'
                      value={formik.values.callerFirstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      inputProps={{ maxLength: 30 }}
                      error={!!(formik.touched.callerFirstName && formik.errors.callerFirstName)}
                      errorText={reqError(
                        formik.touched.callerFirstName,
                        formik.errors.callerFirstName as string,
                      )}
                      required
                    />
                    <TextField
                      name='callerLastName'
                      label='Last Name / Family Name'
                      value={formik.values.callerLastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      inputProps={{ maxLength: 30 }}
                      error={!!(formik.touched.callerLastName && formik.errors.callerLastName)}
                      errorText={reqError(
                        formik.touched.callerLastName,
                        formik.errors.callerLastName as string,
                      )}
                      required
                    />
                    <SearchableField
                      value={formik.values.callerLocation}
                      options={[]}
                      onChange={(value) => formik.setFieldValue('callerLocation', value)}
                      onBlur={formik.handleBlur}
                      error={!!(formik.touched.callerLocation && formik.errors.callerLocation)}
                      errorText={reqError(
                        formik.touched.callerLocation,
                        formik.errors.callerLocation as string,
                      )}
                      label='Work Location'
                      required
                    />
                    <SearchableField
                      value={formik.values.callerDepartment}
                      options={[]}
                      onChange={(value) => formik.setFieldValue('callerDepartment', value)}
                      onBlur={formik.handleBlur}
                      label='Department'
                    />
                    <SearchableField
                      value={formik.values.callerReportingManager}
                      options={[]}
                      onChange={(value) => formik.setFieldValue('callerReportingManager', value)}
                      onBlur={formik.handleBlur}
                      error={
                        !!(
                          formik.touched.callerReportingManager &&
                          formik.errors.callerReportingManager
                        )
                      }
                      errorText={reqError(
                        formik.touched.callerReportingManager,
                        formik.errors.callerReportingManager as string,
                      )}
                      label='Reporting Manager'
                      required
                    />
                    <TextField
                      name='callerEmail'
                      label='Work Email'
                      value={formik.values.callerEmail}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type='email'
                      inputProps={{ maxLength: 60 }}
                      error={!!(formik.touched.callerEmail && formik.errors.callerEmail)}
                      errorText={reqError(
                        formik.touched.callerEmail,
                        formik.errors.callerEmail as string,
                      )}
                      required
                    />
                    <TextField
                      name='callerPhone'
                      label='Phone Number'
                      value={formik.values.callerPhone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type='tel'
                      inputProps={{ maxLength: 20 }}
                    />
                    <Box
                      sx={{
                        gridColumn: { xs: '1 / -1', sm: '2 / -1' },
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        gap: 1,
                        pb: 0.25,
                        flexDirection: { xs: 'column', sm: 'row' },
                        '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
                      }}
                    >
                      <Button
                        variant='outlined'
                        color='error'
                        onClick={() => setManualCallerOpen(false)}
                        disabled={isUpdatingCaller}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={handleManualCallerUpdate}
                        disabled={isUpdatingCaller}
                        loading={isUpdatingCaller}
                      >
                        Update
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </>,
        )}

        {/* ── 2. Categorization ────────────────────────────────────────── */}
        {wrap(
          1,
          <Box className={classes.formGrid}>
            <SearchableField
              value={formik.values.businessCategory}
              options={businessCategoryOptions}
              onChange={(value) => formik.setFieldValue('businessCategory', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.businessCategory && formik.errors.businessCategory)}
              errorText={reqError(
                formik.touched.businessCategory,
                formik.errors.businessCategory as string,
              )}
              label='Business Category'
              required
            />
            <SearchableField
              value={formik.values.serviceLine}
              options={serviceLineOptions}
              onChange={(value) => formik.setFieldValue('serviceLine', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.serviceLine && formik.errors.serviceLine)}
              errorText={reqError(formik.touched.serviceLine, formik.errors.serviceLine as string)}
              label='Service Line'
              required
            />
            <SearchableField
              value={formik.values.application}
              options={applicationOptions}
              onChange={(value) => formik.setFieldValue('application', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.application && formik.errors.application)}
              errorText={reqError(formik.touched.application, formik.errors.application as string)}
              label='Application'
              required
            />
            <SearchableField
              value={formik.values.applicationCategory}
              options={applicationCategoryOptions}
              onChange={(value) => formik.setFieldValue('applicationCategory', value)}
              label='Application Category'
            />
            <SearchableField
              value={formik.values.applicationSubCategory}
              options={applicationSubCategoryOptions}
              onChange={(value) => formik.setFieldValue('applicationSubCategory', value)}
              label='Application Sub-Category'
            />
            {getCustomFieldsForSection(1).map((cf: any) => (
              <CustomFieldRenderer
                key={cf.id}
                field={cf}
                value={getCfValue(cf.fieldKey)}
                onChange={(v) => setCfValue(cf.fieldKey, v)}
              />
            ))}
          </Box>,
        )}

        {/* ── 3. Description ───────────────────────────────────────────── */}
        {wrap(
          2,
          <Box className={classes.formGrid}>
            <Box className={classes.fullWidth}>
              <TextField
                name='shortDescription'
                label='Short Description / Title'
                value={formik.values.shortDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ maxLength: 120 }}
                error={!!(formik.touched.shortDescription && formik.errors.shortDescription)}
                errorText={reqError(
                  formik.touched.shortDescription,
                  formik.errors.shortDescription as string,
                )}
                required
              />
            </Box>

            {/* Rich text editor */}
            <Box className={classes.fullWidth}>
              <RichTextEditor
                value={descriptionRichTextValue}
                onChange={handleRichTextChange}
                title='Description'
                placeholder='Describe the issue in detail...'
                error={descHasError}
                required
                showFooterActions={false}
              />
              {descHasError && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                  {reqError(formik.touched.description, formik.errors.description as string)}
                </Box>
              )}
            </Box>

            {/* Checkboxes */}
            <Box
              className={classes.fullWidth}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box className={classes.checkboxRow}>
                <Checkbox
                  label='Major Ticket'
                  checked={formik.values.isMajor}
                  onChange={(_, checked) => formik.setFieldValue('isMajor', checked)}
                />
                <Checkbox
                  label='Recurring Ticket'
                  checked={formik.values.isRecurring}
                  onChange={(_, checked) => formik.setFieldValue('isRecurring', checked)}
                />
              </Box>
            </Box>

            {/* Custom fields for Description section */}
            {getCustomFieldsForSection(2).length > 0 && (
              <Box className={classes.formGrid}>
                {getCustomFieldsForSection(2).map((cf: any) => (
                  <CustomFieldRenderer
                    key={cf.id}
                    field={cf}
                    value={getCfValue(cf.fieldKey)}
                    onChange={(v) => setCfValue(cf.fieldKey, v)}
                  />
                ))}
              </Box>
            )}
          </Box>,
        )}

        {/* ── 4. Priority, Status & Assignment ─────────────────────────── */}
        {wrap(
          3,
          <Box className={classes.formGrid}>
            <SearchableField
              value={formik.values.impact}
              options={impactOptions}
              onChange={(value) => formik.setFieldValue('impact', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.impact && formik.errors.impact)}
              errorText={reqError(formik.touched.impact, formik.errors.impact as string)}
              label='Impact'
              required
            />
            <SearchableField
              value={formik.values.urgency}
              options={urgencyOptions}
              onChange={(value) => formik.setFieldValue('urgency', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.urgency && formik.errors.urgency)}
              errorText={reqError(formik.touched.urgency, formik.errors.urgency as string)}
              label='Urgency'
              required
            />
            <TextField label='Calculated Priority' value={formik.values.priority} disabled />
            <SearchableField
              value={formik.values.status}
              options={statusOptions}
              onChange={(value) => formik.setFieldValue('status', value)}
              onBlur={formik.handleBlur}
              label='Status'
            />
            <SearchableField
              value={formik.values.assignmentGroup}
              options={[]}
              onChange={(value) => formik.setFieldValue('assignmentGroup', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.assignmentGroup && formik.errors.assignmentGroup)}
              errorText={reqError(
                formik.touched.assignmentGroup,
                formik.errors.assignmentGroup as string,
              )}
              label='Queue'
              required
            />
            <SearchableField
              value={formik.values.primaryResource}
              options={[]}
              onChange={(value) => formik.setFieldValue('primaryResource', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.primaryResource && formik.errors.primaryResource)}
              errorText={reqError(
                formik.touched.primaryResource,
                formik.errors.primaryResource as string,
              )}
              label='Primary Resource'
            />
            <SearchableField
              value={formik.values.secondaryResources}
              options={[]}
              onChange={(value) => formik.setFieldValue('secondaryResources', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.secondaryResources && formik.errors.secondaryResources)}
              errorText={reqError(
                formik.touched.secondaryResources,
                formik.errors.secondaryResources as string,
              )}
              label='Secondary Resource(s)'
            />
            {getCustomFieldsForSection(3).map((cf: any) => (
              <CustomFieldRenderer
                key={cf.id}
                field={cf}
                value={getCfValue(cf.fieldKey)}
                onChange={(v) => setCfValue(cf.fieldKey, v)}
              />
            ))}
          </Box>,
        )}

        {/* ── 5. Audit Information ─────────────────────────────────────── */}
        {wrap(
          4,
          <Box className={classes.formGrid}>
            <TextField label='Created Date and Time' value={createdDateTime} disabled />
            <TextField label='Created' value={formik.values.createdBy} disabled />
            <SearchableField
              value={formik.values.channel}
              options={channelOptions}
              onChange={(value) => formik.setFieldValue('channel', value)}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.channel && formik.errors.channel)}
              errorText={reqError(formik.touched.channel, formik.errors.channel as string)}
              label='Channel'
            />
            {getCustomFieldsForSection(4).map((cf: any) => (
              <CustomFieldRenderer
                key={cf.id}
                field={cf}
                value={getCfValue(cf.fieldKey)}
                onChange={(v) => setCfValue(cf.fieldKey, v)}
              />
            ))}
          </Box>,
        )}

        {/* ── 6. Attachments ───────────────────────────────────────────── */}
        {wrap(
          5,
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Custom fields for Attachments section */}
            {getCustomFieldsForSection(5).length > 0 && (
              <Box className={classes.formGrid}>
                {getCustomFieldsForSection(5).map((cf: any) => (
                  <CustomFieldRenderer
                    key={cf.id}
                    field={cf}
                    value={getCfValue(cf.fieldKey)}
                    onChange={(v) => setCfValue(cf.fieldKey, v)}
                  />
                ))}
              </Box>
            )}

            {/* Upload dropzone */}
            <Box>
              <Box
                onClick={() =>
                  document.querySelector<HTMLInputElement>('.create-ticket-upload-input')?.click()
                }
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  bgcolor: alpha('#0369a1', 0.02),
                  '&:hover': {
                    borderColor: '#0369a1',
                    bgcolor: alpha('#0369a1', 0.04),
                  },
                }}
              >
                <input
                  type='file'
                  className='create-ticket-upload-input'
                  multiple
                  accept='.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif'
                  style={{ display: 'none' }}
                  onChange={(e) =>
                    e.target.files &&
                    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                  }
                />
                <Box sx={{ mb: 0.75 }}>
                  <CloudUploadOutlined sx={{ fontSize: 24, color: '#9ca3af' }} />
                </Box>
                <Button
                  variant='contained'
                  size='small'
                  sx={{
                    bgcolor: '#0369a1',
                    '&:hover': { bgcolor: darken('#0369a1', 0.15) },
                    textTransform: 'none',
                    px: 3,
                    py: 0.75,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: 1.5,
                  }}
                >
                  CHOOSE FILE
                </Button>
              </Box>
            </Box>

            {/* Attached files list */}
            {attachedFiles.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
                  Attached Files ({attachedFiles.length})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {attachedFiles.map((file, index) => (
                    <Box
                      key={`${file.name}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(226, 232, 255, 0.9)',
                        background: '#ffffff',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          background: '#f8faff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          background: '#eef2ff',
                          border: '1px solid rgba(99,102,241,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CloudUploadOutlined sx={{ fontSize: 20, color: '#6366f1' }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <Box
                        onClick={() =>
                          setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          p: 0.5,
                          borderRadius: 1,
                          color: '#dc2626',
                          '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' },
                          flexShrink: 0,
                        }}
                      >
                        <DeleteOutline sx={{ fontSize: '1.1rem' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>,
          true,
        )}

        {/* Error Summary Section */}
        {showValidationErrors && (
          <div ref={errorAlertRef}>
            <Alert
              severity='error'
              icon={<ErrorIcon />}
              sx={{
                mb: 2,
                backgroundColor: 'error.light',
                color: 'error.dark',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.main',
              }}
            >
              <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
                Please fill in the following required fields:
              </AlertTitle>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {Object.entries(formik.errors).map(([fieldName, error]) => {
                  const FIELD_LABELS: Record<string, string> = {
                    caller: 'Affected User',
                    client: 'Client',
                    callerFirstName: 'First Name (Manual Section)',
                    callerLastName: 'Last Name (Manual Section)',
                    callerEmail: 'Work Email (Manual Section)',
                    callerLocation: 'Work Location (Manual Section)',
                    callerReportingManager: 'Reporting Manager (Manual Section)',
                    businessCategory: 'Business Category',
                    serviceLine: 'Service Line',
                    application: 'Application',
                    shortDescription: 'Short Description / Title',
                    description: 'Description',
                    impact: 'Impact',
                    urgency: 'Urgency',
                    channel: 'Channel',
                    assignmentGroup: 'Queue',
                    createdBy: 'Created',
                  };
                  const label =
                    FIELD_LABELS[fieldName] ?? fieldName.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <li
                      key={fieldName}
                      style={{
                        marginBottom: '4px',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: '#080808',
                      }}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            </Alert>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <Box className={classes.buttonContainer}>
          <Button
            variant='outlined'
            onClick={handleBack}
            disabled={isLoading}
            icon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Button
            variant='outlined'
            color='error'
            onClick={handleCancel}
            disabled={isLoading}
            icon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            variant='outlined'
            color='warning'
            onClick={handleSaveAsDraft}
            disabled={isLoading}
            icon={<SaveIcon />}
          >
            Save as Draft
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleSearchForSolution}
            disabled={isLoading}
            icon={<SearchIcon />}
          >
            Search for Solution
          </Button>
          <Button
            variant='contained'
            color='success'
            onClick={handleCreateTicket}
            disabled={isLoading}
            loading={isLoading}
            icon={<SkipNextIcon />}
          >
            {config.title}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateTicketDetail;
