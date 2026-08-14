import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Typography,
  Chip,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Tooltip,
  IconButton,
  Divider,
  Paper,
  MenuList,
  MenuItem,
  ListItemText,
  Alert,
  AlertTitle,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ErrorIcon from '@mui/icons-material/Error';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import { Box, TextField, Checkbox, Button, UploadFile } from '@serviceops/component';
import { useStyles } from './styles';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';
import CustomFieldRenderer from './CustomFieldRenderer';
import { getIconComponent, loadIconMap } from '../../../Configuration/utils/ticketTypeIcons';
import { activateDropdown, deactivateDropdown } from './dropdownRegistry';
import { useFieldError } from '@serviceops/hooks';

// ── Section metadata ──────────────────────────────────────────────────────────
const SECTION_META = [
  {
    icon: PersonOutlineIcon,
    label: 'Ticket Information',
    color: '#1976d2',
    gradient: 'linear-gradient(135deg,#1565c0,#1976d2)',
    glow: 'rgba(25,118,210,0.22)',
  },
  {
    icon: CategoryIcon,
    label: 'Categorization',
    color: '#7b1fa2',
    gradient: 'linear-gradient(135deg,#6a1b9a,#8e24aa)',
    glow: 'rgba(123,31,162,0.22)',
  },
  {
    icon: DescriptionOutlinedIcon,
    label: 'Description',
    color: '#0e7490',
    gradient: 'linear-gradient(135deg,#0e7490,#06b6d4)',
    glow: 'rgba(14,116,144,0.22)',
  },
  {
    icon: FlagIcon,
    label: 'Priority, Status and Assignment',
    color: '#ed6c02',
    gradient: 'linear-gradient(135deg,#e65100,#fb8c00)',
    glow: 'rgba(237,108,2,0.22)',
  },
  {
    icon: HistoryIcon,
    label: 'Audit Information',
    color: '#546e7a',
    gradient: 'linear-gradient(135deg,#37474f,#546e7a)',
    glow: 'rgba(84,110,122,0.22)',
  },
  {
    icon: AttachFileIcon,
    label: 'Attachments',
    color: '#00838f',
    gradient: 'linear-gradient(135deg,#006064,#00838f)',
    glow: 'rgba(0,131,143,0.22)',
  },
];

// ── Shared Searchable Field ──────────────────────────────────────
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setIsOpen(newValue.length > 0 && filteredOptions.length > 0);
    }, 100);
  };

  const handleClear = () => {
    setSearchText('');
    onChange('');
    setIsOpen(false);
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSearchText(option.label);
    onChange(option.value);
    setIsOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleFocus = () => {
    if (options.length > 0) {
      activateDropdown(closerRef.current!);
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
      setIsOpen(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  return (
    <Box ref={anchorRef} position='relative'>
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
      {isOpen && filteredOptions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 1px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 240,
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
                sx={{ py: 0.75, px: 2 }}
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
      )}
    </Box>
  );
};

const toolbarBtnSx = {
  width: 30,
  height: 30,
  borderRadius: 1,
  color: 'text.secondary',
  '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' },
  '& svg': { fontSize: '1.1rem' },
};

const CreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);

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

  // ── Rich-text editor init ─────────────────────────────────────────────────
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formik.values.description || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isFocused.current && editorRef.current) {
      const current = editorRef.current.innerHTML;
      if (current !== formik.values.description) {
        editorRef.current.innerHTML = formik.values.description || '';
      }
    }
  }, [formik.values.description]);

  const showValidationErrors = validationFailed && Object.keys(formik.errors).length > 0;

  useEffect(() => {
    if (showValidationErrors) {
      errorAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showValidationErrors]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) formik.setFieldValue('description', editorRef.current.innerHTML);
  }, [formik]);

  const applyFormat = useCallback(
    (command: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false);
      if (editorRef.current) formik.setFieldValue('description', editorRef.current.innerHTML);
    },
    [formik],
  );

  const handleImageInsert = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        editorRef.current?.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${src}" style="max-width:100%;height:auto;border-radius:4px;margin:4px 0;" alt="image"/>`,
        );
        if (editorRef.current) formik.setFieldValue('description', editorRef.current.innerHTML);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [formik],
  );

  // ── Section wrapper ───────────────────────────────────────────────────────
  const wrap = (index: number, children: React.ReactNode, collapsible = false) => {
    const m = SECTION_META[index];
    const Icon = m.icon;

    const iconBadge = (
      <Box
        className={classes.sectionIconBadge}
        sx={{ background: m.gradient, boxShadow: `0 4px 14px ${m.glow}` }}
      >
        <Icon sx={{ fontSize: 18, color: '#fff' }} />
      </Box>
    );
    const title = (
      <Typography className={classes.sectionCardTitle} sx={{ color: m.color }}>
        {m.label}
      </Typography>
    );

    if (collapsible) {
      return (
        <MuiAccordion
          defaultExpanded={false}
          disableGutters
          sx={{
            borderLeft: `4px solid ${m.color}`,
            borderRadius: '14px !important',
            mb: 2.5,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            '&::before': { display: 'none' },
          }}
        >
          <MuiAccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: m.color, fontSize: 20 }} />}
            sx={{
              background: `${m.color}12`,
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
            {iconBadge}
            {title}
          </MuiAccordionSummary>
          <MuiAccordionDetails sx={{ p: 0 }}>
            <Box className={classes.sectionCardBody}>{children}</Box>
          </MuiAccordionDetails>
        </MuiAccordion>
      );
    }

    return (
      <Box className={classes.sectionCard} sx={{ borderLeftColor: m.color }}>
        <Box className={classes.sectionCardHeader} sx={{ background: `${m.color}12` }}>
          {iconBadge}
          {title}
        </Box>
        <Box className={classes.sectionCardBody}>{children}</Box>
      </Box>
    );
  };

  const iconMap = loadIconMap();
  const descHasError = !!(formik.touched.description && formik.errors.description);

  return (
    <Box className={classes.formContainer}>
      {/* ── Hero header ───────────────────────────────────────────────── */}
      <Box
        className={classes.ticketHero}
        sx={{ background: config.heroGradient, boxShadow: `0 8px 32px ${config.heroShadow}` }}
      >
        <Box className={classes.ticketHeroIcon}>
          {getIconComponent(iconMap[ticketType], { fontSize: 26, color: '#fff' })}
        </Box>
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography className={classes.ticketHeroTitle}>{config.title}</Typography>
            <Chip
              label='New Ticket'
              size='small'
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>
          <Typography className={classes.ticketHeroNumber}>{ticketNumber}</Typography>
          <Typography className={classes.ticketHeroSub}>{config.subtitle}</Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit} noValidate>
        {/* ── 1. Ticket Information ────────────────────────────────────── */}
        {wrap(
          0,
          <>
            <Box className={classes.formGrid}>
              <TextField
                label='Ticket Number'
                value={ticketNumber}
                disabled
                sx={{ '& .MuiInputBase-root': { backgroundColor: 'grey.100' } }}
              />
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
              <Box
                sx={{
                  border: descHasError ? '1px solid #d32f2f' : '1px solid rgba(0,0,0,0.23)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:focus-within': {
                    borderColor: descHasError ? '#d32f2f' : 'primary.main',
                    borderWidth: '2px',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    px: 1,
                    py: 0.5,
                    backgroundColor: 'grey.50',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    flexWrap: 'wrap',
                  }}
                >
                  <Tooltip title='Bold'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat('bold');
                      }}
                    >
                      <FormatBoldIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Italic'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat('italic');
                      }}
                    >
                      <FormatItalicIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Underline'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat('underline');
                      }}
                    >
                      <FormatUnderlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title='Bullet List'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat('insertUnorderedList');
                      }}
                    >
                      <FormatListBulletedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Numbered List'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat('insertOrderedList');
                      }}
                    >
                      <FormatListNumberedIcon />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title='Insert Image'>
                    <IconButton
                      size='small'
                      sx={toolbarBtnSx}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <input
                    ref={imageInputRef}
                    type='file'
                    accept='image/*'
                    hidden
                    onChange={handleImageInsert}
                  />
                </Box>
                <Box
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onFocus={() => {
                    isFocused.current = true;
                  }}
                  onBlur={() => {
                    isFocused.current = false;
                  }}
                  sx={{
                    minHeight: 140,
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    color: 'text.primary',
                    '&:empty::before': {
                      content: '"Describe the issue in detail..."',
                      color: 'text.disabled',
                      pointerEvents: 'none',
                    },
                    '& ul, & ol': { paddingLeft: '1.5em', margin: '4px 0' },
                    '& img': { maxWidth: '100%' },
                  }}
                />
              </Box>
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
              <Tooltip title='Add attachment'>
                <IconButton
                  size='small'
                  onClick={() => attachInputRef.current?.click()}
                  sx={{
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    gap: 0.5,
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      backgroundColor: 'primary.50',
                    },
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: '1rem' }} />
                  Add Attachment
                </IconButton>
              </Tooltip>
              <input
                ref={attachInputRef}
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif'
                hidden
                onChange={(e) =>
                  e.target.files &&
                  setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                }
              />
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
              label='Assignment Group'
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
          <>
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
            <UploadFile
              onChange={(files) =>
                files && setAttachedFiles((prev) => [...prev, ...(Array.from(files) as File[])])
              }
              multiple
              accept='.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif'
              buttonText='Upload Files'
              helperText='Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF'
              maxSize={10 * 1024 * 1024}
            />
            {attachedFiles.length > 0 && (
              <Box className={classes.attachedFilesList}>
                <Typography variant='body2' className={classes.attachedFilesTitle}>
                  Attached Files:
                </Typography>
                {attachedFiles.map((file, index) => (
                  <Typography key={index} variant='body2' color='textSecondary'>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Typography>
                ))}
              </Box>
            )}
          </>,
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
                    assignmentGroup: 'Assignment Group',
                    createdBy: 'Created',
                  };
                  const label =
                    FIELD_LABELS[fieldName] ?? fieldName.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <li
                      key={fieldName}
                      style={{ marginBottom: '4px', fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      {label}
                      {typeof error === 'string' ? ` - ${error}` : ''}
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
