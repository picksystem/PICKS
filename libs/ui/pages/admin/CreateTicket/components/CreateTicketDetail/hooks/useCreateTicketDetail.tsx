import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateTicketMutation,
  useUploadTicketAttachmentsMutation,
  useGetAllUsersMutation,
  useUpdateUserMutation,
} from '@serviceops/services';
import {
  IncidentImpact,
  IncidentUrgency,
  IncidentChannel,
  IncidentStatus,
  ServiceRequestStatus,
  CreateIncidentSchema,
} from '@serviceops/interfaces';
import {
  useAuth,
  useFormWithSessionStorage,
  useNotification,
  useTicketConfig,
} from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import {
  getTicketConfig,
  channelOptions,
  generateTicketNumber,
  calculatePriority,
  initialValues,
} from '../util';

export interface CreateTicketDetailProps {
  ticketType: string;
  onCancel?: () => void;
  onSuccess?: (ticketNumber: string) => void;
}

const useCreateTicketDetail = ({ ticketType, onCancel, onSuccess }: CreateTicketDetailProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { AdminPath } = constants;
  const notify = useNotification();
  const config = getTicketConfig(ticketType);
  const { impactOptions, urgencyOptions, priorityOptions, statusOptions } =
    useTicketConfig(ticketType);

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

  const ticketNumber = useMemo(() => generateTicketNumber(config.prefix), [config.prefix]);
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

  const formik = useFormWithSessionStorage(`createTicket_${ticketType}`, {
    initialValues: {
      ...initialValues,
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
    const newPriority = calculatePriority(
      formik.values.impact as IncidentImpact,
      formik.values.urgency as IncidentUrgency,
    );
    if (newPriority !== formik.values.priority) {
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

  /** Build the payload for createTicket mutation — includes ticketType for the unified API */
  const buildTicketData = (
    statusOverride?: IncidentStatus | ServiceRequestStatus,
    uploadedFilenames?: string[],
  ) => ({
    ticketType,
    number: ticketNumber,
    client: formik.values.client || undefined,
    caller: formik.values.caller,
    callerPhone: formik.values.callerPhone || undefined,
    callerEmail: formik.values.callerEmail || undefined,
    callerLocation: formik.values.callerLocation || undefined,
    callerDepartment: formik.values.callerDepartment || undefined,
    callerReportingManager: formik.values.callerReportingManager || undefined,
    additionalContacts: formik.values.additionalContacts || undefined,
    businessCategory: formik.values.businessCategory || undefined,
    serviceLine: formik.values.serviceLine || undefined,
    application: formik.values.application || undefined,
    applicationCategory: formik.values.applicationCategory || undefined,
    applicationSubCategory: formik.values.applicationSubCategory || undefined,
    shortDescription: formik.values.shortDescription || undefined,
    description: formik.values.description || undefined,
    impact: (formik.values.impact as IncidentImpact) || undefined,
    urgency: (formik.values.urgency as IncidentUrgency) || undefined,
    priority: formik.values.priority || undefined,
    channel: (formik.values.channel as IncidentChannel) || undefined,
    status: statusOverride || (formik.values.status as IncidentStatus),
    assignmentGroup: formik.values.assignmentGroup || undefined,
    primaryResource: formik.values.primaryResource || undefined,
    secondaryResources: formik.values.secondaryResources || undefined,
    createdBy: formik.values.createdBy,
    isRecurring: formik.values.isRecurring,
    isMajor: formik.values.isMajor,
    notes: formik.values.notes || undefined,
    relatedRecords: formik.values.relatedRecords || undefined,
    attachments:
      uploadedFilenames && uploadedFilenames.length > 0
        ? JSON.stringify(uploadedFilenames)
        : undefined,
  });

  const handleBack = () => onCancel?.();

  const handleCancel = () => {
    formik.resetForm();
    setAttachedFiles([]);
    onCancel?.();
    navigate(AdminPath.DASHBOARD);
  };

  const triggerValidation = async () => {
    const schemaErrors = await formik.validateForm();
    const allErrors: Record<string, string> = { ...(schemaErrors as Record<string, string>) };

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

    if (Object.keys(allErrors).length > 0) {
      // Pass `false` as second arg so setTouched does NOT re-run Yup validation,
      // which would overwrite allErrors (including our custom manual-section errors) back to schema-only.
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
    };
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
    navigate(AdminPath.SUGGESTED_SOLUTION, { state: { incidentData: ticketData } });
  };

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
    validationFailed,
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleCreateTicket,
    handleSaveAsDraft,
    handleSearchForSolution,
  };
};

export default useCreateTicketDetail;
