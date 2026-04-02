import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateIncidentMutation,
  useUploadAttachmentsMutation,
  useGetAllUsersMutation,
  useUpdateUserMutation,
} from '@serviceops/services';
import {
  IncidentImpact,
  IncidentUrgency,
  IncidentChannel,
  IncidentStatus,
  ICreateIncidentInput,
  CreateIncidentSchema,
  DraftIncidentSchema,
  calculatePriority,
} from '@serviceops/interfaces';
import { useAuth, useFormWithSessionStorage, useNotification, useTicketConfig } from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import {
  channelOptions,
  generateTicketNumber,
  initialValues,
} from '../util';

export interface CreateIncidentProps {
  onCancel?: () => void;
  onSuccess?: (incidentNumber: string) => void;
}

const useCreateIncident = ({ onCancel, onSuccess }: CreateIncidentProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { AdminPath } = constants;
  const notify = useNotification();
  const { impactOptions, urgencyOptions, priorityOptions, statusOptions } = useTicketConfig('incident');

  const [createIncident, { isLoading }] = useCreateIncidentMutation();
  const [uploadAttachments] = useUploadAttachmentsMutation();
  const [getAllUsers] = useGetAllUsersMutation();
  const [updateUser, { isLoading: isUpdatingCaller }] = useUpdateUserMutation();

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

  const ticketNumber = useMemo(generateTicketNumber, []);
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

  const formik = useFormWithSessionStorage('createIncident', {
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
      const incidentData = buildIncidentData(IncidentStatus.NEW, uploadedFilenames);
      try {
        await createIncident(incidentData).unwrap();
        notify.success(`Incident ${ticketNumber} created successfully!`);
        formik.resetForm();
        setAttachedFiles([]);
        onSuccess?.(ticketNumber);
      } catch (err) {
        console.error('Failed to create incident:', err);
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
    // Combine first + last name into caller field when manually entered
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
      (u) => (u.name || `${u.firstName} ${u.lastName}`) === callerName || u.email === formik.values.callerEmail,
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
      notify.error('Failed to upload attachments. Incident will be saved without files.');
      return [];
    }
  };

  const buildIncidentData = (
    statusOverride?: IncidentStatus,
    uploadedFilenames?: string[],
  ): ICreateIncidentInput & { number: string } => ({
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
    attachments: uploadedFilenames && uploadedFilenames.length > 0
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
      await DraftIncidentSchema.validate(formik.values, { abortEarly: false });
    } catch {
      formik.setTouched({ caller: true, createdBy: true });
      return;
    }
    const draftExpiresAt = new Date();
    draftExpiresAt.setDate(draftExpiresAt.getDate() + 30);
    const uploadedFilenames = await uploadAndGetFilenames();
    const incidentData = {
      ...buildIncidentData(IncidentStatus.DRAFT, uploadedFilenames),
      draftExpiresAt: draftExpiresAt.toISOString(),
    };
    try {
      await createIncident(incidentData).unwrap();
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
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    const uploadedFilenames = await uploadAndGetFilenames();
    const incidentData = buildIncidentData(undefined, uploadedFilenames);
    navigate(AdminPath.SUGGESTED_SOLUTION, { state: { incidentData } });
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
    channelOptions,
    handleCallerChange,
    handleManualCallerUpdate,
    handleBack,
    handleCancel,
    handleSaveAsDraft,
    handleSearchForSolution,
  };
};

export default useCreateIncident;
