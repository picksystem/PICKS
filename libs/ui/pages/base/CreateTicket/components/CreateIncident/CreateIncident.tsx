import {
  Typography,
  Chip,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Alert,
  AlertTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, TextField, Select, UploadFile } from '@serviceops/component';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useStyles } from './styles';
import useCreateIncident, { CreateIncidentProps } from './hooks/useCreateIncident';
export type { CreateIncidentProps };
import TicketInfoSection from './components/TicketInfoSection';
import CategorizationSection from './components/CategorizationSection';
import DescriptionSection from './components/DescriptionSection';
import PrioritySection from './components/PrioritySection';
import ActionButtons from './components/ActionButtons';

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

const CreateIncident = ({ onCancel, onSuccess }: CreateIncidentProps) => {
  const { classes } = useStyles();
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
    channelOptions,
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleSaveAsDraft,
    handleSearchForSolution,
  } = useCreateIncident({ onCancel, onSuccess });

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
      <Box className={classes.incidentHero}>
        <Box className={classes.incidentHeroIcon}>
          <ReportProblemIcon sx={{ fontSize: 26, color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography className={classes.incidentHeroTitle}>Create Incident</Typography>
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
          <Typography className={classes.incidentHeroNumber}>{ticketNumber}</Typography>
          <Typography className={classes.incidentHeroSub}>
            Fill in the details below to log a new incident
          </Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        {/* 1. Ticket Information */}
        {wrap(
          0,
          <TicketInfoSection
            ticketNumber={ticketNumber}
            callerOptions={callerOptions}
            caller={formik.values.caller}
            callerTouched={formik.touched.caller}
            callerError={formik.errors.caller as string}
            callerFirstName={formik.values.callerFirstName}
            callerLastName={formik.values.callerLastName}
            client={formik.values.client}
            additionalContacts={formik.values.additionalContacts}
            manualCallerOpen={manualCallerOpen}
            callerEmail={formik.values.callerEmail}
            callerEmailTouched={formik.touched.callerEmail}
            callerEmailError={formik.errors.callerEmail as string}
            callerPhone={formik.values.callerPhone}
            callerDepartment={formik.values.callerDepartment}
            callerLocation={formik.values.callerLocation}
            callerReportingManager={formik.values.callerReportingManager}
            isUpdatingCaller={isUpdatingCaller}
            onClientChange={(v) => formik.setFieldValue('client', v)}
            onCallerChange={handleCallerChange}
            onCallerBlur={formik.handleBlur}
            onAdditionalContactsChange={(v) => formik.setFieldValue('additionalContacts', v)}
            onManualCallerToggle={() => setManualCallerOpen(!manualCallerOpen)}
            onFieldChange={formik.handleChange}
            onFieldBlur={formik.handleBlur}
            onManualCallerUpdate={handleManualCallerUpdate}
          />,
        )}

        {/* 2. Categorization */}
        {wrap(
          1,
          <CategorizationSection
            values={{
              businessCategory: formik.values.businessCategory,
              serviceLine: formik.values.serviceLine,
              application: formik.values.application,
              applicationCategory: formik.values.applicationCategory,
              applicationSubCategory: formik.values.applicationSubCategory,
            }}
            touched={formik.touched as Partial<Record<string, boolean>>}
            errors={formik.errors as Partial<Record<string, string>>}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />,
        )}

        {/* 3. Description */}
        {wrap(
          2,
          <DescriptionSection
            values={{
              shortDescription: formik.values.shortDescription,
              description: formik.values.description,
              isRecurring: formik.values.isRecurring,
              isMajor: formik.values.isMajor,
            }}
            touched={formik.touched as Partial<Record<string, boolean>>}
            errors={formik.errors as Partial<Record<string, string>>}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onCheckboxChange={(field, value) => formik.setFieldValue(field, value)}
            onDescriptionChange={(html) => formik.setFieldValue('description', html)}
            onAddAttachment={(files) => setAttachedFiles((prev) => [...prev, ...Array.from(files)])}
          />,
        )}

        {/* 4. Priority and Assignment */}
        {wrap(
          3,
          <PrioritySection
            values={{
              impact: formik.values.impact,
              urgency: formik.values.urgency,
              priority: formik.values.priority,
              status: formik.values.status,
              assignmentGroup: formik.values.assignmentGroup,
              primaryResource: formik.values.primaryResource,
              secondaryResources: formik.values.secondaryResources,
            }}
            touched={formik.touched as Partial<Record<string, boolean>>}
            errors={formik.errors as Partial<Record<string, string>>}
            impactOptions={impactOptions}
            urgencyOptions={urgencyOptions}
            priorityOptions={priorityOptions}
            statusOptions={statusOptions}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onSelectChange={(field, value) => formik.setFieldValue(field, value)}
          />,
        )}

        {/* 5. Audit Information (includes Channel) */}
        {wrap(
          4,
          <Box className={classes.formGrid}>
            <TextField label='Created Date and Time' value={createdDateTime} disabled />
            <TextField label='Created By' value={formik.values.createdBy} disabled />
            <Select
              label='Channel'
              options={channelOptions}
              value={formik.values.channel}
              onChange={(e) => formik.setFieldValue('channel', e.target.value as string)}
            />
          </Box>,
        )}

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

        {/* Error Summary Section */}
        {Object.keys(formik.errors).length > 0 && (
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
              {Object.entries(formik.errors).map(([fieldName, error]) => (
                <li
                  key={fieldName}
                  style={{
                    marginBottom: '4px',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}{' '}
                  {typeof error === 'string' ? `- ${error}` : ''}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        <ActionButtons
          isLoading={isLoading}
          onBack={handleBack}
          onCancel={handleCancel}
          onSaveAsDraft={handleSaveAsDraft}
          onSearchForSolution={handleSearchForSolution}
        />
      </form>
    </Box>
  );
};

export default CreateIncident;
