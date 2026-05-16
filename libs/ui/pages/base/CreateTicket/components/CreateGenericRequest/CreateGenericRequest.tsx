import React from 'react';
import {
  Typography,
  Chip,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import { Box, TextField, Select, Checkbox, Button, UploadFile } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from './styles/CreateGenericRequest.styles';
import useCreateGenericRequest, {
  CreateGenericRequestProps,
} from './hooks/useCreateGenericRequest';

// Hero colors per ticket type
const HERO_CONFIG = {
  service_request: {
    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #1565c0 100%)',
    boxShadow: '0 8px 32px rgba(21,101,192,0.35)',
    title: 'Create Service Request',
    subtitle: 'Fill in the details below to log a new service request',
  },
  advisory_request: {
    background: 'linear-gradient(135deg, #00695c 0%, #00897b 50%, #00695c 100%)',
    boxShadow: '0 8px 32px rgba(0,105,92,0.35)',
    title: 'Create Advisory Request',
    subtitle: 'Fill in the details below to log a new advisory request',
  },
};

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

const CreateGenericRequest = ({
  ticketTypeKey,
  onCancel,
  onSuccess,
}: CreateGenericRequestProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const heroConfig = HERO_CONFIG[ticketTypeKey];
  const HeroIcon = ticketTypeKey === 'service_request' ? BuildIcon : AssignmentIcon;

  const {
    formik,
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
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleSaveAsDraft,
  } = useCreateGenericRequest({ ticketTypeKey, onCancel, onSuccess });

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

  return (
    <Box className={classes.formContainer}>
      {/* ── Hero header ───────────────────────────────────────────────── */}
      <Box
        className={classes.heroHeader}
        sx={{ background: heroConfig.background, boxShadow: heroConfig.boxShadow }}
      >
        <Box className={classes.heroIcon}>
          <HeroIcon sx={{ fontSize: 26, color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography className={classes.heroTitle}>{heroConfig.title}</Typography>
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
          <Typography className={classes.heroNumber}>{ticketNumber}</Typography>
          <Typography className={classes.heroSub}>{heroConfig.subtitle}</Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        {/* 1. Ticket Information */}
        {wrap(
          0,
          <>
            <Box className={classes.formGrid}>
              <TextField
                label='Ticket Number'
                value={ticketNumber}
                disabled
                className={classes.ticketNumber}
              />
              <Select
                label='Client'
                options={callerOptions}
                value={formik.values.client}
                onChange={(e) => formik.setFieldValue('client', e.target.value as string)}
              />
              {callerOptions.length > 0 ? (
                <Select
                  label='Affected user'
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
                  label='Affected user'
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
              <TextField
                name='callerEmail'
                label='Caller Email'
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
              />
              <TextField
                name='callerPhone'
                label='Caller Phone'
                value={formik.values.callerPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type='tel'
                inputProps={{ maxLength: 25 }}
              />
              <TextField
                name='callerLocation'
                label='Caller Location'
                value={formik.values.callerLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                name='callerDepartment'
                label='Department'
                value={formik.values.callerDepartment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ maxLength: 50 }}
              />
            </Box>

            {/* Manual caller entry */}
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

            {/* Recurring */}
            <Box className={classes.checkboxRow} sx={{ mt: 1 }}>
              <Checkbox
                label='Recurring Issue'
                checked={formik.values.isRecurring}
                onChange={(checked) => formik.setFieldValue('isRecurring', checked)}
              />
            </Box>
          </>,
        )}

        {/* 2. Categorization */}
        {wrap(
          1,
          <Box className={classes.formGrid}>
            <TextField
              name='businessCategory'
              label='Business Category'
              value={formik.values.businessCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 25 }}
              error={!!(formik.touched.businessCategory && formik.errors.businessCategory)}
              errorText={reqError(
                formik.touched.businessCategory,
                formik.errors.businessCategory as string,
              )}
              required
            />
            <TextField
              name='serviceLine'
              label='Service Line'
              value={formik.values.serviceLine}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 25 }}
              error={!!(formik.touched.serviceLine && formik.errors.serviceLine)}
              errorText={reqError(formik.touched.serviceLine, formik.errors.serviceLine as string)}
              required
            />
            <TextField
              name='application'
              label='Application'
              value={formik.values.application}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 25 }}
              error={!!(formik.touched.application && formik.errors.application)}
              errorText={reqError(formik.touched.application, formik.errors.application as string)}
              required
            />
            <TextField
              name='applicationCategory'
              label='Application Category'
              value={formik.values.applicationCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              name='applicationSubCategory'
              label='Application Sub-Category'
              value={formik.values.applicationSubCategory}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 50 }}
            />
          </Box>,
        )}

        {/* 3. Description */}
        {wrap(
          2,
          <Box className={classes.formGrid}>
            <TextField
              name='shortDescription'
              label='Short Description'
              value={formik.values.shortDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 60 }}
              error={!!(formik.touched.shortDescription && formik.errors.shortDescription)}
              errorText={reqError(
                formik.touched.shortDescription,
                formik.errors.shortDescription as string,
              )}
              required
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              name='description'
              label='Description'
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              multiline
              rows={4}
              inputProps={{ maxLength: 255 }}
              error={!!(formik.touched.description && formik.errors.description)}
              errorText={reqError(formik.touched.description, formik.errors.description as string)}
              required
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>,
        )}

        {/* 4. Priority and Assignment */}
        {wrap(
          3,
          <Box className={classes.formGrid}>
            <Select
              label='Impact'
              options={impactOptions}
              value={formik.values.impact}
              onChange={(e) => formik.setFieldValue('impact', e.target.value as string)}
              required
            />
            <Select
              label='Urgency'
              options={urgencyOptions}
              value={formik.values.urgency}
              onChange={(e) => formik.setFieldValue('urgency', e.target.value as string)}
              required
            />
            <Select
              label='Priority'
              options={priorityOptions}
              value={formik.values.priority}
              onChange={(e) => formik.setFieldValue('priority', e.target.value as string)}
              disabled
            />
            <Select
              label='Status'
              options={statusOptions}
              value={formik.values.status}
              onChange={(e) => formik.setFieldValue('status', e.target.value as string)}
            />
            <TextField
              name='assignmentGroup'
              label='Assignment Group'
              value={formik.values.assignmentGroup}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 25 }}
              error={!!(formik.touched.assignmentGroup && formik.errors.assignmentGroup)}
              errorText={reqError(
                formik.touched.assignmentGroup,
                formik.errors.assignmentGroup as string,
              )}
              required
            />
            <TextField
              name='primaryResource'
              label='Primary Resource'
              value={formik.values.primaryResource}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 25 }}
            />
            <TextField
              name='secondaryResources'
              label='Secondary Resources'
              value={formik.values.secondaryResources}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText='Comma-separated, up to 9 resources'
              inputProps={{ maxLength: 255 }}
              sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' } }}
            />
          </Box>,
        )}

        {/* 5. Audit Information */}
        {wrap(
          4,
          <Box className={classes.formGrid}>
            <TextField label='Created Date and Time' value={createdDateTime} disabled />
            <TextField label='Created By' value={formik.values.createdBy} disabled />
          </Box>,
        )}

        {/* 6. Attachments */}
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

        {/* Action Buttons */}
        <Box className={classes.buttonContainer}>
          <Button variant='outlined' onClick={handleBack} disabled={isLoading}>
            Back
          </Button>
          <Button variant='outlined' color='error' onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={isLoading}
            loading={isLoading}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateGenericRequest;
