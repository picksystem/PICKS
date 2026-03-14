import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateServiceRequestMutation,
  useUploadServiceRequestAttachmentsMutation,
  useCreateAdvisoryRequestMutation,
  useUploadAdvisoryRequestAttachmentsMutation,
  useGetAllUsersMutation,
  useUpdateUserMutation,
} from '../../../../../../../services';
import {
  IncidentImpact,
  IncidentUrgency,
  ICreateServiceRequestInput,
  ICreateAdvisoryRequestInput,
  CreateServiceRequestSchema,
  DraftServiceRequestSchema,
  CreateAdvisoryRequestSchema,
  DraftAdvisoryRequestSchema,
  calculatePriority,
} from '@picks/interfaces';
import { useAuth, useFormWithSessionStorage, useNotification, useTicketConfig } from '@picks/hooks';
import { constants } from '@picks/utils';
import {
  generateTicketNumber,
  srInitialValues,
} from '../util';

export interface CreateGenericRequestProps {
  ticketTypeKey: 'service_request' | 'advisory_request';
  onCancel?: () => void;
  onSuccess?: (ticketNumber: string) => void;
}

const useCreateGenericRequest = ({ ticketTypeKey, onCancel, onSuccess }: CreateGenericRequestProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { AdminPath } = constants;
  const notify = useNotification();
  const { impactOptions, urgencyOptions, priorityOptions, statusOptions } = useTicketConfig(ticketTypeKey);

  const isSR = ticketTypeKey === 'service_request';
  const prefix = isSR ? 'SRQ' : 'ADV';
  const storageKey = isSR ? 'sr_draft' : 'ar_draft';
  const createSchema = isSR ? CreateServiceRequestSchema : CreateAdvisoryRequestSchema;
  const draftSchema = isSR ? DraftServiceRequestSchema : DraftAdvisoryRequestSchema;

  const [createServiceRequest, { isLoading: isLoadingSR }] = useCreateServiceRequestMutation();
  const [uploadSRAttachments] = useUploadServiceRequestAttachmentsMutation();
  const [createAdvisoryRequest, { isLoading: isLoadingAR }] = useCreateAdvisoryRequestMutation();
  const [uploadARAttachments] = useUploadAdvisoryRequestAttachmentsMutation();
  const [getAllUsers] = useGetAllUsersMutation();
  const [updateUser, { isLoading: isUpdatingCaller }] = useUpdateUserMutation();

  const isLoading = isSR ? isLoadingSR : isLoadingAR;

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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

  const ticketNumber = useMemo(() => generateTicketNumber(prefix as 'SRQ' | 'ADV'), [prefix]);
  const createdDateTime = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers().unwrap();
        if (Array.isArray(result)) {
          setUsers(result);
        }
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

  const formik = useFormWithSessionStorage(storageKey, {
    initialValues: {
      ...srInitialValues,
      createdBy: defaultCreatedBy,
      caller: defaultCreatedBy,
    },
    validationSchema: createSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async () => {
      const uploadedFilenames = await uploadAndGetFilenames();
      const ticketData = buildTicketData('new', uploadedFilenames);
      try {
        if (isSR) {
          await createServiceRequest(ticketData as ICreateServiceRequestInput).unwrap();
        } else {
          await createAdvisoryRequest(ticketData as ICreateAdvisoryRequestInput).unwrap();
        }
        const label = isSR ? 'Service Request' : 'Advisory Request';
        notify.success(`${label} ${ticketNumber} created successfully!`);
        formik.resetForm();
        setAttachedFiles([]);
        onSuccess?.(ticketNumber);
      } catch (err) {
        console.error('Failed to create ticket:', err);
      }
    },
  });

  useEffect(() => {
    const newPriority = calculatePriority(
      formik.values.impact as IncidentImpact,
      formik.values.urgency as IncidentUrgency,
    );
    if (newPriority !== formik.values.priority) {
      formik.setFieldValue('priority', newPriority);
    }
  }, [formik, formik.values.impact, formik.values.urgency]);

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
      if (isSR) {
        return await uploadSRAttachments(formData).unwrap();
      } else {
        return await uploadARAttachments(formData).unwrap();
      }
    } catch {
      notify.error('Failed to upload attachments. Ticket will be saved without files.');
      return [];
    }
  };

  const buildTicketData = (
    statusOverride?: string,
    uploadedFilenames?: string[],
  ) => ({
    number: ticketNumber,
    client: formik.values.client || undefined,
    caller: formik.values.caller,
    callerPhone: formik.values.callerPhone || undefined,
    callerEmail: formik.values.callerEmail || undefined,
    callerLocation: formik.values.callerLocation || undefined,
    callerDepartment: formik.values.callerDepartment || undefined,
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
    status: statusOverride || formik.values.status,
    assignmentGroup: formik.values.assignmentGroup || undefined,
    primaryResource: formik.values.primaryResource || undefined,
    secondaryResources: formik.values.secondaryResources || undefined,
    createdBy: formik.values.createdBy,
    isRecurring: formik.values.isRecurring,
    notes: formik.values.notes || undefined,
    relatedRecords: formik.values.relatedRecords || undefined,
    attachments:
      uploadedFilenames && uploadedFilenames.length > 0
        ? JSON.stringify(uploadedFilenames)
        : undefined,
  });

  const handleBack = () => {
    onCancel?.();
  };

  const handleCancel = () => {
    formik.resetForm();
    setAttachedFiles([]);
    onCancel?.();
    navigate(AdminPath.DASHBOARD);
  };

  const handleSaveAsDraft = async () => {
    try {
      await draftSchema.validate(formik.values, { abortEarly: false });
    } catch {
      formik.setTouched({ caller: true, createdBy: true });
      return;
    }
    const draftExpiresAt = new Date();
    draftExpiresAt.setDate(draftExpiresAt.getDate() + 30);
    const uploadedFilenames = await uploadAndGetFilenames();
    const ticketData = {
      ...buildTicketData('draft', uploadedFilenames),
      draftExpiresAt: draftExpiresAt.toISOString(),
    };
    try {
      if (isSR) {
        await createServiceRequest(ticketData as ICreateServiceRequestInput).unwrap();
      } else {
        await createAdvisoryRequest(ticketData as ICreateAdvisoryRequestInput).unwrap();
      }
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

  return {
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
  };
};

export default useCreateGenericRequest;
