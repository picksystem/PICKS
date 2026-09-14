import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateTicketMutation,
  useUploadTicketAttachmentsMutation,
  useGetAllUsersMutation,
  useUpdateUserMutation,
  useGetTicketTypeQuery,
} from '@serviceops/services';
import {
  IncidentImpact,
  IncidentUrgency,
  IncidentChannel,
  IncidentStatus,
  ServiceRequestStatus,
  CreateIncidentSchema,
  IAdminTicket,
  ITicketTypeLayoutConfig,
  ICustomSectionConfig,
  ICustomField,
  CustomFieldType,
} from '@serviceops/interfaces';
import {
  useAuth,
  useFormWithSessionStorage,
  useNotification,
  useTicketConfig,
} from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import { useConfiguration } from '@serviceops/confighooks';
import {
  filterCustomFieldsByTicketType,
  filterSectionsByTicketType,
} from '@serviceops/tickettypelayout';
import { channelOptions, generateTicketNumber, calculatePriority, initialValues } from '../util';

// ── Field resolution types ──────────────────────────────────────────────────

export interface FieldResolution {
  label: string;
  type: CustomFieldType;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  dropdownOptions?: { value: string; label: string }[];
  required: boolean;
  disabled?: boolean;
}

export interface OptionSets {
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
}

/**
 * Resolves a field key into rendering metadata.
 * Priority: 1. Custom fields (API-driven), 2. Built-in fields (type from resolver, label from key).
 */
const resolveField = (
  fieldKey: string,
  customFieldMap: Map<string, ICustomField>,
  formik: any,
  getCfValue: (key: string) => string | boolean,
  setCfValue: (key: string, value: string | boolean) => void,
  opts: OptionSets,
): FieldResolution => {
  // Custom field: label + type come from API
  const customField = customFieldMap.get(fieldKey);
  if (customField) {
    return {
      label: customField.fieldName,
      type: customField.fieldType,
      value: getCfValue(fieldKey),
      onChange: (val: string | boolean) => setCfValue(fieldKey, val),
      dropdownOptions: customField.dropdownOptions?.map((o) => ({ value: o, label: o })),
      required: customField.isRequired ?? false,
      disabled: customField.isDisabled ?? false,
    };
  }

  // Built-in field: type + options from resolver, label = field key
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

export interface CreateTicketDetailProps {
  ticketType: string;
  onCancel?: () => void;
  onSuccess?: (ticketNumber: string) => void;
}

const useCreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { BasePath } = constants;
  const notify = useNotification();
  const { data: ticketTypes } = useGetTicketTypeQuery();
  const record = ticketTypes?.find((t) => t.type === ticketType);
  const allCustomFields = record?.customFields ?? [];
  const filteredCustomFields = useMemo(
    () => filterCustomFieldsByTicketType(allCustomFields, ticketType),
    [allCustomFields, ticketType],
  );
  const layoutConfig = record?.layoutConfig;

  // Filter layoutConfig's customSections by the current ticket type's accessControl
  const filteredLayoutConfig = useMemo<ITicketTypeLayoutConfig | undefined>(() => {
    if (!layoutConfig?.customSections) return layoutConfig ?? undefined;
    const cs = layoutConfig.customSections as Record<string, ICustomSectionConfig>;
    const filteredSections: Record<string, ICustomSectionConfig> = {};
    for (const [id, section] of Object.entries(cs) as [string, ICustomSectionConfig][]) {
      const ac = section.accessControl;
      // Include if no accessControl set (legacy) or if ticket type is allowed
      if (!ac || Object.keys(ac).length === 0 || ac[ticketType] === true) {
        filteredSections[id] = { ...section, fields: [...section.fields] };
      }
    }
    return { ...layoutConfig, customSections: filteredSections };
  }, [layoutConfig, ticketType]);
  const config = {
    title: `Create ${record?.displayName || record?.name || ticketType}`,
    prefix: record?.prefix || 'TKT',
    numberLength: record?.numberLength || 7,
    subtitle: record?.shortDescription || 'Fill in the details below to create a new ticket',
  };
  const { impactOptions, urgencyOptions, priorityOptions, statusOptions } =
    useTicketConfig(ticketType);
  const { categorization } = useConfiguration();
  const businessCategoryOptions = useMemo(
    () =>
      (categorization?.businessCategories ?? [])
        .filter((bc) => !!bc.name)
        .map((bc) => ({ value: bc.name, label: bc.name })),
    [categorization?.businessCategories],
  );
  const serviceLineOptions = useMemo(
    () =>
      (categorization?.serviceLines ?? [])
        .filter((sl) => !!sl.name)
        .map((sl) => ({ value: sl.name, label: sl.name })),
    [categorization?.serviceLines],
  );
  const applicationOptions = useMemo(
    () =>
      (categorization?.applications ?? [])
        .filter((app) => !!app.name)
        .map((app) => ({ value: app.name, label: app.name })),
    [categorization?.applications],
  );
  const applicationCategoryOptions = useMemo(
    () =>
      (categorization?.applicationCategories ?? [])
        .filter((ac) => !!ac.categoryName)
        .map((ac) => ({ value: ac.categoryName, label: ac.categoryName })),
    [categorization?.applicationCategories],
  );
  const applicationSubCategoryOptions = useMemo(
    () =>
      (categorization?.applicationSubCategories ?? [])
        .filter((asc) => !!asc.subCategoryName)
        .map((asc) => ({ value: asc.subCategoryName, label: asc.subCategoryName })),
    [categorization?.applicationSubCategories],
  );

  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const [uploadAttachments] = useUploadTicketAttachmentsMutation();
  const [getAllUsers] = useGetAllUsersMutation();
  const [updateUser, { isLoading: isUpdatingCaller }] = useUpdateUserMutation();

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [validationFailed, setValidationFailed] = useState(false);
  const [users, setUsers] = useState<
    {
      id?: number;
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      workLocation?: string;
      department?: string;
    }[]
  >([]);
  const [manualCallerOpen, setManualCallerOpen] = useState(false);

  // ── Custom field values (filtered by ticket type access control) ──────────
  const initCfValues = useCallback((): Record<string, string | boolean> => {
    const init: Record<string, string | boolean> = {};
    for (const cf of filteredCustomFields) {
      if (cf.defaultValue !== undefined) {
        init[cf.fieldKey] = cf.defaultValue;
      } else if (cf.fieldType === 'checkbox') {
        init[cf.fieldKey] = false;
      } else {
        init[cf.fieldKey] = '';
      }
    }
    return init;
  }, [filteredCustomFields]);

  const [cfValues, setCfValues] = useState<Record<string, string | boolean>>(initCfValues);

  // When filteredCustomFields grows (e.g., a new field is added), ensure cfValues
  // has an entry for every current field so the renderer and submit can see it.
  useEffect(() => {
    setCfValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const cf of filteredCustomFields) {
        if (!(cf.fieldKey in next)) {
          if (cf.defaultValue !== undefined) next[cf.fieldKey] = cf.defaultValue;
          else if (cf.fieldType === 'checkbox') next[cf.fieldKey] = false;
          else next[cf.fieldKey] = '';
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [filteredCustomFields]);

  const setCfValue = useCallback((key: string, value: string | boolean) => {
    setCfValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getCfValue = useCallback(
    (key: string): string | boolean => {
      return cfValues[key] ?? '';
    },
    [cfValues],
  );

  const ticketNumber = useMemo(
    () => generateTicketNumber(config.prefix, config.numberLength),
    [config.prefix, config.numberLength],
  );
  const createdDateTime = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers().unwrap();
        if (Array.isArray(result)) setUsers(result);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  const callerOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.name || `${u.firstName} ${u.lastName}`,
        label: u.name || `${u.firstName} ${u.lastName}`,
      })),
    [users],
  );

  const defaultCreatedBy = user?.name || '';

  // Pre-populate caller fields from the logged-in user's API data
  const defaultCallerFields = useMemo(() => {
    if (!user) return {};
    return {
      callerFirstName: user.firstName || '',
      callerLastName: user.lastName || '',
      callerEmail: user.email || '',
      callerPhone: user.phone || '',
      callerLocation: user.workLocation || '',
      callerDepartment: user.department || '',
      callerReportingManager: user.managerName || '',
    };
  }, [user]);

  const formik = useFormWithSessionStorage(`createTicket_${ticketType}`, {
    initialValues: {
      ...initialValues,
      ...defaultCallerFields,
      createdBy: defaultCreatedBy,
      caller: defaultCreatedBy,
    },
    validationSchema: CreateIncidentSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async () => {
      const uploadedFilenames = await uploadAndGetFilenames();
      const ticketData = buildTicketData(IncidentStatus.NEW, uploadedFilenames);
      try {
        await createTicket(ticketData).unwrap();
        notify.success(
          `${config.title.replace('Create ', '')} ${ticketNumber} created successfully!`,
        );
        formik.resetForm();
        setAttachedFiles([]);
        onSuccess?.(ticketNumber);
      } catch (err) {
        console.error('Failed to create ticket:', err);
      }
    },
  });

  // Auto-calculate priority on form mount and when impact/urgency change
  useEffect(() => {
    const { impact, urgency } = formik.values;
    // Guard against empty strings and legacy sessionStorage values (label text like "3 - Low")
    if (
      !impact ||
      !urgency ||
      !Object.values(IncidentImpact).includes(impact as IncidentImpact) ||
      !Object.values(IncidentUrgency).includes(urgency as IncidentUrgency)
    ) {
      return;
    }
    const newPriority = calculatePriority(impact as IncidentImpact, urgency as IncidentUrgency);
    if (newPriority && newPriority !== formik.values.priority) {
      formik.setFieldValue('priority', newPriority);
    }
  }, [formik.values.impact, formik.values.urgency]);

  const handleCallerChange = (callerName: string) => {
    formik.setFieldValue('caller', callerName);
    const selectedUser = users.find(
      (u) => (u.name || `${u.firstName} ${u.lastName}`) === callerName,
    );
    if (selectedUser) {
      formik.setFieldValue('callerFirstName', selectedUser.firstName || '');
      formik.setFieldValue('callerLastName', selectedUser.lastName || '');
      formik.setFieldValue('callerEmail', selectedUser.email || '');
      formik.setFieldValue('callerPhone', selectedUser.phone || '');
      formik.setFieldValue('callerLocation', selectedUser.workLocation || '');
      formik.setFieldValue('callerDepartment', selectedUser.department || '');
    }
  };

  const handleManualCallerUpdate = async () => {
    const firstName = formik.values.callerFirstName?.trim();
    const lastName = formik.values.callerLastName?.trim();
    const location = formik.values.callerLocation?.trim();
    const reportingManager = formik.values.callerReportingManager?.trim();

    // Validate required manual fields inline (same pattern as triggerValidation)
    const manualErrors: Record<string, string> = {};
    const manualTouched: Record<string, boolean> = {};
    if (!firstName) {
      manualErrors.callerFirstName = 'First name is required';
      manualTouched.callerFirstName = true;
    }
    if (!lastName) {
      manualErrors.callerLastName = 'Last name is required';
      manualTouched.callerLastName = true;
    }
    if (!location) {
      manualErrors.callerLocation = 'Work location is required';
      manualTouched.callerLocation = true;
    }
    if (!reportingManager) {
      manualErrors.callerReportingManager = 'Reporting manager is required';
      manualTouched.callerReportingManager = true;
    }
    if (Object.keys(manualErrors).length > 0) {
      // Pass `false` to prevent re-validation overwriting our errors
      formik.setTouched({ ...formik.touched, ...manualTouched }, false);
      formik.setErrors({ ...formik.errors, ...manualErrors });
      return;
    }

    if (firstName || lastName) {
      formik.setFieldValue('caller', `${firstName} ${lastName}`.trim());
    }
    const callerName = firstName ? `${firstName} ${lastName}`.trim() : formik.values.caller;
    if (!callerName) {
      notify.error('Full Name is required');
      return;
    }
    const matchedUser = users.find(
      (u) =>
        (u.name || `${u.firstName} ${u.lastName}`) === callerName ||
        u.email === formik.values.callerEmail,
    );
    if (matchedUser && matchedUser.id) {
      try {
        await updateUser({
          userId: matchedUser.id,
          data: {
            name: formik.values.caller,
            email: formik.values.callerEmail || undefined,
            phone: formik.values.callerPhone || undefined,
            department: formik.values.callerDepartment || undefined,
            workLocation: formik.values.callerLocation || undefined,
          },
        }).unwrap();
        notify.success('Caller details updated successfully');
      } catch (err) {
        console.error('Failed to update caller details:', err);
        notify.error('Failed to update caller details. Please try again.');
      }
    } else {
      notify.success('Caller details applied to the ticket');
    }
  };

  const uploadAndGetFilenames = async (): Promise<string[]> => {
    if (attachedFiles.length === 0) return [];
    const formData = new FormData();
    attachedFiles.forEach((f) => formData.append('files', f));
    try {
      return await uploadAttachments(formData).unwrap();
    } catch {
      notify.error('Failed to upload attachments. Ticket will be saved without files.');
      return [];
    }
  };

  /** Build the payload for createTicket mutation — fully dynamic from formik values */
  const buildTicketData = (
    statusOverride?: IncidentStatus | ServiceRequestStatus,
    uploadedFilenames?: string[],
  ): IAdminTicket => {
    // Fields that need type casting when copying from formik values
    const castMap: Record<string, (v: any) => any> = {
      impact: (v) => v as IncidentImpact,
      urgency: (v) => v as IncidentUrgency,
      channel: (v) => v as IncidentChannel,
      status: (v) => (v as IncidentStatus) || statusOverride,
    };

    // These fields are required by the API schema (Prisma .required())
    // Always include them even if empty — the API needs them present
    const apiRequiredFields = new Set([
      'caller',
      'createdBy',
      'isRecurring',
      'isMajor',
      'isReleaseManagement',
      'timesReopened',
      'changeProductBugFix',
      'changeCabRequired',
      'changeTestCompleted',
    ]);

    // Safe fallback defaults for API-required fields when value is missing/empty
    const safeFallback = (key: string, value: any): any => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') return value; // false is valid
        if (typeof value === 'string' && value.trim() !== '') return value; // non-empty string is valid
      }
      // Empty/missing — apply fallback
      if (key === 'caller' || key === 'createdBy') return 'Unknown';
      if (key === 'isRecurring' || key === 'isMajor' || key === 'isReleaseManagement') return false;
      if (key === 'timesReopened') return 0;
      if (key === 'changeProductBugFix' || key === 'changeCabRequired' || key === 'changeTestCompleted') return false;
      return undefined;
    };

    // Collect all built-in field values from formik dynamically
    const builtInPayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(formik.values)) {
      if (key === 'number') continue; // ticketNumber is set separately
      if (key === 'attachments') {
        // Convert File[] to JSON string for API
        builtInPayload.attachments =
          uploadedFilenames && uploadedFilenames.length > 0
            ? JSON.stringify(uploadedFilenames)
            : undefined;
        continue;
      }
      // Always include API-required fields (apply fallback for empty/missing)
      if (apiRequiredFields.has(key)) {
        builtInPayload[key] = safeFallback(key, value);
        continue;
      }
      // Include booleans (even false), include strings/numbers if not empty
      if (typeof value === 'boolean') {
        builtInPayload[key] = value;
      } else if (value !== undefined && value !== null && value !== '') {
        builtInPayload[key] = castMap[key] ? castMap[key](value) : value;
      }
    }

    // Collect custom field values from cfValues (non-empty only)
    const customFieldPayload = Object.fromEntries(
      Object.entries(cfValues).filter(([, v]) => v !== '' && v !== false && v !== undefined),
    );

    return {
      ticketType,
      number: ticketNumber,
      ...builtInPayload,
      customFieldValues: customFieldPayload,
    } as IAdminTicket;
  };

  const handleBack = () => onCancel?.();

  const handleCancel = () => {
    formik.resetForm();
    setAttachedFiles([]);
    setCfValues(initCfValues());
    onCancel?.();
    navigate(BasePath.DASHBOARD);
  };

  const triggerValidation = async () => {
    // Collect all field keys that are actually visible in the admin-configured sections
    const visibleKeys = new Set<string>();
    if (filteredLayoutConfig?.customSections) {
      for (const section of Object.values(filteredLayoutConfig.customSections)) {
        for (const fk of section.fields) visibleKeys.add(fk);
        for (const sub of section.subSections ?? []) {
          for (const fk of sub.fields ?? []) visibleKeys.add(fk);
        }
      }
    }

    // Run Yup schema validation (format checks, types, etc.)
    const schemaErrors = await formik.validateForm();
    const allErrors: Record<string, string> = {};

    // Only keep errors for fields that are actually visible in the form
    for (const [key, error] of Object.entries(schemaErrors as Record<string, string>)) {
      if (visibleKeys.has(key)) {
        allErrors[key] = error;
      }
    }

    // When the manual caller section is open, validate its required fields too
    if (manualCallerOpen) {
      if (!formik.values.callerFirstName?.trim()) {
        allErrors.callerFirstName = 'First name is required';
      }
      if (!formik.values.callerLastName?.trim()) {
        allErrors.callerLastName = 'Last name is required';
      }
      if (!formik.values.callerLocation?.trim()) {
        allErrors.callerLocation = 'Work location is required';
      }
      if (!formik.values.callerReportingManager?.trim()) {
        allErrors.callerReportingManager = 'Reporting manager is required';
      }
    }

    // Validate required custom fields (only if visible and not disabled)
    for (const cf of filteredCustomFields) {
      if (cf.isDisabled) continue;
      if (cf.isRequired && visibleKeys.has(cf.fieldKey)) {
        const val = cfValues[cf.fieldKey];
        const isEmpty =
          val === undefined ||
          val === null ||
          val === '' ||
          (typeof val === 'string' && val.trim() === '');
        if (isEmpty) {
          allErrors[cf.fieldKey] = `${cf.fieldName} is required`;
        }
      }
    }

    if (Object.keys(allErrors).length > 0) {
      // Pass `false` as second arg so setTouched does NOT re-run Yup validation
      formik.setTouched(
        Object.keys(allErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        false,
      );
      formik.setErrors(allErrors);
      setValidationFailed(true);
      return allErrors;
    }
    setValidationFailed(false);
    return allErrors;
  };

  const handleCreateTicket = async () => {
    const errors = await triggerValidation();
    if (Object.keys(errors).length > 0) return;
    await formik.submitForm();
  };

  const handleSaveAsDraft = async () => {
    const errors = await triggerValidation();
    if (Object.keys(errors).length > 0) return;
    const draftExpiresAt = new Date();
    draftExpiresAt.setDate(draftExpiresAt.getDate() + 30);
    const uploadedFilenames = await uploadAndGetFilenames();
    const ticketData = {
      ...buildTicketData(IncidentStatus.DRAFT, uploadedFilenames),
      draftExpiresAt: draftExpiresAt.toISOString(),
    } as unknown as IAdminTicket;
    try {
      await createTicket(ticketData).unwrap();
      const expiryDate = draftExpiresAt.toLocaleDateString();
      notify.success(
        `Draft ${ticketNumber} saved! This draft will expire on ${expiryDate}. Please submit it within 30 days.`,
      );
      formik.resetForm();
      setAttachedFiles([]);
      onCancel?.();
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const handleSearchForSolution = async () => {
    const errors = await triggerValidation();
    if (Object.keys(errors).length > 0) return;
    const uploadedFilenames = await uploadAndGetFilenames();
    const ticketData = buildTicketData(undefined, uploadedFilenames);
    navigate(BasePath.SUGGESTED_SOLUTION, { state: { incidentData: ticketData } });
  };

  // ── Derived: option sets + custom field map ────────────────────────────
  const optionSets = useMemo<OptionSets>(
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

  const customFieldMap = useMemo(() => {
    const map = new Map<string, ICustomField>();
    for (const cf of filteredCustomFields) {
      map.set(cf.fieldKey, cf);
    }
    return map;
  }, [filteredCustomFields]);

  return {
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
    customFields: filteredCustomFields,
    layoutConfig: filteredLayoutConfig,
    getCfValue,
    setCfValue,
    optionSets,
    customFieldMap,
    resolveField,
  };
};

export default useCreateTicketDetail;
