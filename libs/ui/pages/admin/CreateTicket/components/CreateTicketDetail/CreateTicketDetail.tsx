import { useRef, useEffect, useCallback } from 'react';
import {
  Typography,
  Chip,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
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
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Box, TextField, Select, Checkbox, Button, UploadFile } from '@picks/component';
import { useFieldError } from '@picks/hooks';
import { useStyles } from './styles';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';

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

// ── Hero icons by ticket type ─────────────────────────────────────────────────
const HERO_ICONS: Record<string, React.ElementType> = {
  incident: ReportProblemIcon,
  service_request: BuildIcon,
  advisory_request: LightbulbIcon,
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
    priorityOptions,
    statusOptions,
    channelOptions,
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleSaveAsDraft,
    handleSearchForSolution,
  } = useCreateTicketDetail({ ticketType, onCancel, onSuccess });

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

  const HeroIcon = HERO_ICONS[ticketType] ?? ReportProblemIcon;
  const descHasError = !!(formik.touched.description && formik.errors.description);

  return (
    <Box className={classes.formContainer}>
      {/* ── Hero header ───────────────────────────────────────────────── */}
      <Box
        className={classes.ticketHero}
        sx={{ background: config.heroGradient, boxShadow: `0 8px 32px ${config.heroShadow}` }}
      >
        <Box className={classes.ticketHeroIcon}>
          <HeroIcon sx={{ fontSize: 26, color: '#fff' }} />
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

      <form onSubmit={formik.handleSubmit}>
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
              <Select
                label='Client'
                options={callerOptions}
                value={formik.values.client}
                onChange={(e) => formik.setFieldValue('client', e.target.value as string)}
                required
              />
              {callerOptions.length > 0 ? (
                <Select
                  label='Caller'
                  options={callerOptions}
                  value={formik.values.caller}
                  onChange={(e) => handleCallerChange(e.target.value as string)}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.caller && formik.errors.caller)}
                  errorText={reqError(formik.touched.caller, formik.errors.caller as string)}
                  required
                />
              ) : (
                <TextField
                  name='caller'
                  label='Caller'
                  value={formik.values.caller}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  icon={<SearchIcon />}
                  iconAlignment='right'
                  inputProps={{ maxLength: 50 }}
                  error={!!(formik.touched.caller && formik.errors.caller)}
                  errorText={reqError(formik.touched.caller, formik.errors.caller as string)}
                  required
                />
              )}
              {config.showAdditionalContacts && (
                <Select
                  label='Additional Contact(s)'
                  options={callerOptions}
                  value={formik.values.additionalContacts}
                  onChange={(e) =>
                    formik.setFieldValue('additionalContacts', e.target.value as string)
                  }
                />
              )}
            </Box>

            {/* Manual caller */}
            <Box className={classes.manualCallerSection}>
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
                      required
                    />
                    <TextField
                      name='callerLastName'
                      label='Last Name / Family Name'
                      value={formik.values.callerLastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      inputProps={{ maxLength: 30 }}
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
                    <TextField
                      name='callerLocation'
                      label='Work Location'
                      value={formik.values.callerLocation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      icon={<SearchIcon />}
                      iconAlignment='right'
                      inputProps={{ maxLength: 50 }}
                      required
                    />
                    <TextField
                      name='callerDepartment'
                      label='Department'
                      value={formik.values.callerDepartment}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      icon={<SearchIcon />}
                      iconAlignment='right'
                      inputProps={{ maxLength: 50 }}
                    />
                    <TextField
                      name='callerReportingManager'
                      label='Reporting Manager'
                      value={formik.values.callerReportingManager}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      icon={<SearchIcon />}
                      iconAlignment='right'
                      inputProps={{ maxLength: 50 }}
                      required
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
            <TextField
              name='businessCategory'
              label='Business Category'
              value={formik.values.businessCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='serviceLine'
              label='Service Line'
              value={formik.values.serviceLine}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='application'
              label='Application'
              value={formik.values.application}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='applicationCategory'
              label='Application Category'
              value={formik.values.applicationCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='applicationSubCategory'
              label='Application Sub-Category'
              value={formik.values.applicationSubCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
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
                {config.showIsMajor && (
                  <Checkbox
                    label='Major Ticket'
                    checked={formik.values.isMajor}
                    onChange={(_, checked) => formik.setFieldValue('isMajor', checked)}
                  />
                )}
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
          </Box>,
        )}

        {/* ── 4. Priority, Status & Assignment ─────────────────────────── */}
        {wrap(
          3,
          <Box className={classes.formGrid}>
            <Select
              label='Impact'
              options={impactOptions}
              value={formik.values.impact}
              onChange={(e) => formik.setFieldValue('impact', e.target.value as string)}
              onBlur={formik.handleBlur}
            />
            <Select
              label='Urgency'
              options={urgencyOptions}
              value={formik.values.urgency}
              onChange={(e) => formik.setFieldValue('urgency', e.target.value as string)}
              onBlur={formik.handleBlur}
            />
            <Select
              label='Priority'
              options={priorityOptions}
              value={formik.values.priority}
              onChange={(e) => formik.setFieldValue('priority', e.target.value as string)}
              onBlur={formik.handleBlur}
            />
            <Select
              label='Status'
              options={statusOptions}
              value={formik.values.status}
              onChange={(e) => formik.setFieldValue('status', e.target.value as string)}
              onBlur={formik.handleBlur}
            />
            <TextField
              name='assignmentGroup'
              label='Assignment Group'
              value={formik.values.assignmentGroup}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='primaryResource'
              label='Primary Resource'
              value={formik.values.primaryResource}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              name='secondaryResources'
              label='Secondary Resource(s)'
              value={formik.values.secondaryResources}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 200 }}
            />
          </Box>,
        )}

        {/* ── 5. Audit Information ─────────────────────────────────────── */}
        {wrap(
          4,
          <Box className={classes.formGrid}>
            <TextField label='Created Date and Time' value={createdDateTime} disabled />
            <TextField label='Created By' value={formik.values.createdBy} disabled />
            {config.showChannel && (
              <Select
                label='Channel'
                options={channelOptions}
                value={formik.values.channel}
                onChange={(e) => formik.setFieldValue('channel', e.target.value as string)}
              />
            )}
          </Box>,
        )}

        {/* ── 6. Attachments ───────────────────────────────────────────── */}
        {wrap(
          5,
          <>
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
            type='submit'
            variant='contained'
            color='success'
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
