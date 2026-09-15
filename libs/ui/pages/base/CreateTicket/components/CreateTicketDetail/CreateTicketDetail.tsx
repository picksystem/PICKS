import { useMemo } from 'react';
import { Box, Button, PageHeader, Typography, Alert } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from './styles';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import useCreateTicketDetail, {
  CreateTicketDetailProps,
  FieldResolution,
  OptionSets,
} from './hooks/useCreateTicketDetail';
import {
  ITicketTypeLayoutConfig,
  ICustomSectionConfig,
  ICustomField,
} from '@serviceops/interfaces';
import GppBadIcon from '@mui/icons-material/GppBad';

const CreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  const {
    config,
    formik,
    isLoading,
    handleBack,
    handleCreateTicket,
    handleCancel,
    handleSaveAsDraft,
    handleSearchForSolution,
    validationFailed,
    layoutConfig,
    getCfValue,
    setCfValue,
    optionSets,
    customFieldMap,
    resolveField,
    attachedFiles,
    setAttachedFiles,
    ticketNumber,
  } = useCreateTicketDetail({ ticketType, onCancel, onSuccess }) as {
    config: { title: string; prefix: string; numberLength: number; subtitle: string };
    formik: any;
    isLoading: boolean;
    handleBack: () => void;
    handleCreateTicket: () => Promise<void>;
    handleCancel: () => void;
    handleSaveAsDraft: () => Promise<void>;
    handleSearchForSolution: () => Promise<void>;
    validationFailed: boolean;
    customFields: ICustomField[];
    layoutConfig: ITicketTypeLayoutConfig | undefined;
    getCfValue: (key: string) => string | boolean;
    setCfValue: (key: string, value: string | boolean) => void;
    optionSets: OptionSets;
    customFieldMap: Map<string, ICustomField>;
    resolveField: (
      fieldKey: string,
      customFieldMap: Map<string, ICustomField>,
      formik: any,
      getCfValue: (key: string) => string | boolean,
      setCfValue: (key: string, value: string | boolean) => void,
      opts: OptionSets,
    ) => FieldResolution;
    attachedFiles: File[];
    setAttachedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    ticketNumber: string;
  };

  // Compute human-readable labels for fields that have validation errors
  const missingFieldsList = useMemo(() => {
    if (!validationFailed || !formik.errors) return [];
    const errs = formik.errors as Record<string, string>;

    // Convert camelCase to Title Case for built-in fields (dynamic, no hardcoding)
    const camelToTitle = (key: string): string =>
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

    // Dedup by label using a Set on the resolved label
    const seenLabels = new Set<string>();
    return Object.keys(errs)
      .map((key) => {
        const customField = customFieldMap.get(key);
        if (customField) return customField.fieldName; // Dynamic from API
        return camelToTitle(key); // Dynamic from field key
      })
      .filter((label) => {
        const lower = label.toLowerCase();
        if (seenLabels.has(lower)) return false;
        seenLabels.add(lower);
        return true;
      });
  }, [validationFailed, formik.errors, customFieldMap]);

  // Sections from the admin's "Ticket Sections" configuration (customSections).
  // Each section has a title, a list of field keys (selectedFields),
  // and optional sub-sections. This is the ONLY source of sections.
  const createTicketSections = useMemo((): (ICustomSectionConfig & { id: string })[] => {
    if (!layoutConfig?.customSections) return [];
    return Object.entries(layoutConfig.customSections)
      .filter(([, section]) => section.tab === 'createTicket')
      .map(([id, section]) => ({ id, ...section }));
  }, [layoutConfig]);

  // Loading state
  if (isLoading) {
    return (
      <Box className={classes.formContainer} sx={{ p: 3 }}>
        <PageHeader
          title={config.title}
          description={config.subtitle}
          className={classes.pageHeader}
        />
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Box className='loader-container' />
        </Box>
      </Box>
    );
  }

  // Render a field with Formik error info, delegating to DynamicFieldRenderer
  const renderFieldWithErrors = (fieldKey: string) => {
    const resolved = resolveField(
      fieldKey,
      customFieldMap,
      formik,
      getCfValue,
      setCfValue,
      optionSets,
    );
    const isTouched = formik?.touched?.[fieldKey];
    const rawError = (formik?.errors?.[fieldKey] as string) || '';
    const fieldError = validationFailed && !!isTouched && !!rawError;
    const fieldErrorText = reqError(isTouched, rawError);

    const isFullWidth =
      resolved.type === 'textarea' ||
      resolved.type === 'attachment' ||
      (resolved.type === 'checkbox' && (resolved.dropdownOptions?.length ?? 0) > 0);

    const isAttachment = resolved.type === 'attachment';

    return (
      <Box
        key={fieldKey}
        className={`${classes.formGridItem} ${isFullWidth ? classes.fullWidth : ''}`.trim()}
      >
        <DynamicFieldRenderer
          fieldKey={fieldKey}
          fieldLabel={resolved.label}
          fieldType={resolved.type}
          value={resolved.value}
          onChange={resolved.onChange}
          error={fieldError}
          errorText={fieldErrorText}
          required={resolved.required}
          disabled={resolved.disabled}
          dropdownOptions={resolved.dropdownOptions}
          fullWidth={isFullWidth}
          attachedFiles={isAttachment ? attachedFiles : undefined}
          onFilesChange={isAttachment ? setAttachedFiles : undefined}
        />
      </Box>
    );
  };

  return (
    <Box className={classes.formContainer}>
      {/* ── Page header with ticket number on the right ── */}
      <Box className={classes.pageHeader}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PageHeader title={config.title} description={config.subtitle} />
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTicket();
        }}
      >
        {/* ── Sections from admin "Ticket Sections" config ── */}
        {createTicketSections.map((section) => (
          <Box key={section.id} className={classes.sectionCard}>
            <Box className={classes.sectionCardHeader}>
              <Typography className={classes.sectionCardTitle}>{section.title}</Typography>
            </Box>
            <Box className={classes.sectionCardBody}>
              {/* Top-level section fields */}
              {section.fields.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: `repeat(${section.columns ?? 3}, 1fr)`,
                    gridTemplateRows: `repeat(${section.rows ?? 'auto-fill'}, 1fr)`,
                  }}
                >
                  {section.fields.map((fk) => renderFieldWithErrors(fk))}
                </Box>
              )}

              {/* Sub-sections */}
              {(section.subSections ?? []).map((sub) => (
                <Box key={sub.id} sx={{ mt: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 16,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                      }}
                    />
                    {sub.name || 'Sub-section'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: (sub.columns ?? section.columns ?? 3) === 1 ? 1 : 2,
                      gridTemplateColumns: `repeat(${sub.columns ?? section.columns ?? 3}, 1fr)`,
                      gridTemplateRows: `repeat(${sub.rows ?? section.rows ?? 'auto-fill'}, 1fr)`,
                    }}
                  >
                    {(sub.fields ?? []).map((fk) => renderFieldWithErrors(fk))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        {/* ── Missing Fields Alert ── */}
        {missingFieldsList.length > 0 && (
          <Alert
            severity='error'
            sx={{
              mb: 2,
              borderRadius: 2,
              borderStyle: 'solid',
              borderColor: '#dc2626',
              borderWidth: 1,
              '& .MuiAlert-message': { display: 'block', width: '100%' },
              '& .MuiAlert-icon': { display: 'none' },
            }}
          >
            <Box sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 1, color: '#1e293b' }}>
              <GppBadIcon />
              Please fill in the following required field{missingFieldsList.length > 1 ? 's' : ''}:
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginLeft: 2, marginTop: 1 }}
            >
              {missingFieldsList.map((name) => (
                <Box
                  key={name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#374151',
                    lineHeight: 1.4,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#dc2626',
                      flexShrink: 0,
                    }}
                  />
                  {name}
                </Box>
              ))}
            </Box>
          </Alert>
        )}

        {/* ── Action Buttons ── */}
        <Box className={classes.buttonContainer}>
          <Button variant='outlined' onClick={handleBack} type='button'>
            Back
          </Button>
          <Button variant='outlined' onClick={handleCancel} type='button'>
            Cancel
          </Button>
          <Button variant='outlined' onClick={handleSaveAsDraft} type='button'>
            Save as Draft
          </Button>
          <Button variant='outlined' onClick={handleSearchForSolution} type='button'>
            Search for Solution
          </Button>
          <Button variant='contained' type='submit' disabled={isLoading}>
            Create Ticket
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateTicketDetail;
