import { useMemo } from 'react';
import { Box, Button, PageHeader, Typography } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { useStyles } from './styles';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import useCreateTicketDetail, { CreateTicketDetailProps } from './hooks/useCreateTicketDetail';
import {
  ITicketTypeLayoutConfig,
  ICustomSectionConfig,
  ICustomField,
  CustomFieldType,
} from '@serviceops/interfaces';

interface FieldResolution {
  label: string;
  type: CustomFieldType;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  dropdownOptions?: { value: string; label: string }[];
  required: boolean;
}

/**
 * Resolves a field key into rendering metadata.
 *
 * Priority:
 * 1. Custom fields — label + type come from the API (ICustomField).
 * 2. Built-in fields — label is the field key (no hardcoded map),
 *    type and dropdown options come from the field resolver.
 */
const resolveField = (
  fieldKey: string,
  customFieldMap: Map<string, ICustomField>,
  formik: any,
  getCfValue: (key: string) => string | boolean,
  setCfValue: (key: string, value: string | boolean) => void,
  opts: {
    callerOptions: { value: string; label: string }[];
    impactOptions: { value: string; label: string }[];
    urgencyOptions: { value: string; label: string }[];
    priorityOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
    channelOptions: { value: string; label: string }[];
    businessCategoryOptions: { value: string; label: string }[];
    serviceLineOptions: { value: string; label: string }[];
    applicationOptions: { value: string; label: string }[];
    applicationCategoryOptions: { value: string; label: string }[];
    applicationSubCategoryOptions: { value: string; label: string }[];
  },
): FieldResolution => {
  // ── Custom field: label + type come from API ───────────────────────
  const customField = customFieldMap.get(fieldKey);
  if (customField) {
    return {
      label: customField.fieldName,
      type: customField.fieldType,
      value: getCfValue(fieldKey),
      onChange: (val: string | boolean) => setCfValue(fieldKey, val),
      dropdownOptions: customField.dropdownOptions?.map((o) => ({ value: o, label: o })),
      required: customField.isRequired ?? false,
    };
  }

  // ── Built-in field: type + options from resolver, label = field key ─
  const formikValue = formik?.values?.[fieldKey];

  let fieldType: CustomFieldType = 'text';
  let dropdownOptions: { value: string; label: string }[] | undefined;

  switch (fieldKey) {
    case 'caller':
      fieldType = 'dropdown';
      dropdownOptions = opts.callerOptions;
      break;
    case 'businessCategory':
      fieldType = 'dropdown';
      dropdownOptions = opts.businessCategoryOptions;
      break;
    case 'serviceLine':
      fieldType = 'dropdown';
      dropdownOptions = opts.serviceLineOptions;
      break;
    case 'application':
      fieldType = 'dropdown';
      dropdownOptions = opts.applicationOptions;
      break;
    case 'applicationCategory':
      fieldType = 'dropdown';
      dropdownOptions = opts.applicationCategoryOptions;
      break;
    case 'applicationSubCategory':
      fieldType = 'dropdown';
      dropdownOptions = opts.applicationSubCategoryOptions;
      break;
    case 'impact':
      fieldType = 'dropdown';
      dropdownOptions = opts.impactOptions;
      break;
    case 'urgency':
      fieldType = 'dropdown';
      dropdownOptions = opts.urgencyOptions;
      break;
    case 'priority':
      fieldType = 'dropdown';
      dropdownOptions = opts.priorityOptions;
      break;
    case 'status':
      fieldType = 'dropdown';
      dropdownOptions = opts.statusOptions;
      break;
    case 'channel':
      fieldType = 'dropdown';
      dropdownOptions = opts.channelOptions;
      break;
    case 'description':
      fieldType = 'textarea';
      break;
    case 'isMajor':
    case 'isRecurring':
    case 'isReleaseManagement':
      fieldType = 'checkbox';
      break;
    case 'attachments':
      fieldType = 'attachment';
      break;
    default:
      fieldType = 'text';
  }

  return {
    label: fieldKey,
    type: fieldType,
    value: formikValue ?? '',
    onChange: (val: string | boolean) => formik?.setFieldValue?.(fieldKey, val),
    dropdownOptions,
    required: false,
  };
};

// ── Component ───────────────────────────────────────────────────────

const CreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  const {
    config,
    formik,
    isLoading,
    handleBack,
    handleCreateTicket,
    handleSaveAsDraft,
    handleSearchForSolution,
    callerOptions,
    impactOptions,
    urgencyOptions,
    priorityOptions,
    statusOptions,
    channelOptions,
    businessCategoryOptions,
    serviceLineOptions,
    applicationOptions,
    applicationCategoryOptions,
    applicationSubCategoryOptions,
    validationFailed,
    customFields,
    layoutConfig,
    getCfValue,
    setCfValue,
  } = useCreateTicketDetail({ ticketType, onCancel, onSuccess }) as {
    config: { title: string; prefix: string; numberLength: number; subtitle: string };
    formik: any;
    isLoading: boolean;
    handleBack: () => void;
    handleCreateTicket: () => Promise<void>;
    handleSaveAsDraft: () => Promise<void>;
    handleSearchForSolution: () => Promise<void>;
    callerOptions: { value: string; label: string }[];
    impactOptions: { value: string; label: string }[];
    urgencyOptions: { value: string; label: string }[];
    priorityOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
    channelOptions: { value: string; label: string }[];
    businessCategoryOptions: { value: string; label: string }[];
    serviceLineOptions: { value: string; label: string }[];
    applicationOptions: { value: string; label: string }[];
    applicationCategoryOptions: { value: string; label: string }[];
    applicationSubCategoryOptions: { value: string; label: string }[];
    validationFailed: boolean;
    customFields: ICustomField[];
    layoutConfig: ITicketTypeLayoutConfig | undefined;
    getCfValue: (key: string) => string | boolean;
    setCfValue: (key: string, value: string | boolean) => void;
  };

  // Build lookup map for custom fields by fieldKey
  const customFieldMap = useMemo(() => {
    const map = new Map<string, ICustomField>();
    for (const cf of customFields) {
      map.set(cf.fieldKey, cf);
    }
    return map;
  }, [customFields]);

  const optionSets = useMemo(
    () => ({
      callerOptions,
      impactOptions,
      urgencyOptions,
      priorityOptions,
      statusOptions,
      channelOptions,
      businessCategoryOptions,
      serviceLineOptions,
      applicationOptions,
      applicationCategoryOptions,
      applicationSubCategoryOptions,
    }),
    [
      callerOptions,
      impactOptions,
      urgencyOptions,
      priorityOptions,
      statusOptions,
      channelOptions,
      businessCategoryOptions,
      serviceLineOptions,
      applicationOptions,
      applicationCategoryOptions,
      applicationSubCategoryOptions,
    ],
  );

  // Sections from the admin's "Ticket Sections" configuration (customSections).
  // Each section has a title, a list of field keys (selectedFields),
  // and optional sub-sections. This is the ONLY source of sections —
  // the legacy built-in createTicket sections are intentionally excluded
  // so that admin changes in Ticket Screen Layout are always reflected.
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
    // Use Formik's touched state so errors only show after user interaction
    const isTouched = formik?.touched?.[fieldKey];
    const rawError = (formik?.errors?.[fieldKey] as string) || '';
    const fieldError = validationFailed && !!isTouched && !!rawError;
    // Format error with ArrowCircleRightIcon, same as Approved Estimate dialog
    const fieldErrorText = reqError(isTouched, rawError);

    // Textarea and attachment types span full width; everything else fits
    // in the grid. No hardcoded field-key list.
    const isFullWidth = resolved.type === 'textarea' || resolved.type === 'attachment';

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
          dropdownOptions={resolved.dropdownOptions}
          fullWidth={isFullWidth}
        />
      </Box>
    );
  };

  return (
    <Box className={classes.formContainer}>
      <PageHeader
        title={config.title}
        description={config.subtitle}
        className={classes.pageHeader}
      />

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
                <Box className={classes.formGrid}>
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
                  <Box className={classes.formGrid}>
                    {(sub.fields ?? []).map((fk) => renderFieldWithErrors(fk))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        {/* ── Action Buttons ── */}
        <Box className={classes.buttonContainer}>
          <Button variant='outlined' onClick={handleBack} type='button'>
            Back
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
