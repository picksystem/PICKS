import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Chip, Switch } from '@mui/material';
import { useThemeContext } from '@serviceops/theme';
import {
  useAuthActionMutation,
  useGetAdminControlsQuery,
  useUpdateAdminControlsMutation,
} from '@serviceops/services';
import {
  useAuth,
  useNotification,
  useFieldError,
  useFormWithSessionStorage,
  useMediaQuery,
} from '@serviceops/hooks';
import { IAuthUser, UserRole } from '@serviceops/interfaces';
import {
  UserRow,
  EditFormShape,
  PageStyles,
  ChangeProfileErrors,
  ResetPwErrors,
  ChangeLogEntry,
} from '../types/userManagement.types';
import {
  buildEditForm,
  initialCreateValues,
  AdminCreateUserSchema,
  generateTempPassword,
  loadNewUserDraft,
  saveNewUserDraft,
  clearNewUserDraft,
  getDraftDaysRemaining,
  fmtDateTime,
  fmtDateUser,
  fmtDateTimeUser,
  fmtDate,
  getTzDisplay,
  LANG_LABELS,
  TIME_FORMAT_LABELS,
  SOURCE_LABELS,
  DRAFT_DAYS,
  UM_SESSION_KEY,
} from '../utils/userManagement.utils';
import { Column } from '@serviceops/component';

const useUserManagement = () => {
  const [authAction] = useAuthActionMutation();
  const { user: currentUser } = useAuth();
  const notify = useNotification();
  const reqError = useFieldError();
  const isMobile = useMediaQuery('(max-width: 599px)');

  // ── Table state ───────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<IAuthUser[]>([]);
  const [admins, setAdmins] = useState<IAuthUser[]>([]);
  const [consultants, setConsultants] = useState<IAuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [selectedRow, setSelectedRow] = useState<UserRow | null>(null);

  // ── Edit dialog ───────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormShape>(buildEditForm({} as IAuthUser));
  const [editOriginal, setEditOriginal] = useState<EditFormShape>(buildEditForm({} as IAuthUser));
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const isDirty = editOpen && JSON.stringify(editForm) !== JSON.stringify(editOriginal);
  const [adminNotes, setAdminNotes] = useState('');

  // ── Create dialog ─────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [isOpenedAsDraft, setIsOpenedAsDraft] = useState(false);
  const [draftMeta, setDraftMeta] = useState<{ savedAt: string; expiresAt: string } | null>(() => {
    const d = loadNewUserDraft();
    return d ? { savedAt: d.savedAt, expiresAt: d.expiresAt } : null;
  });
  const [draftValues, setDraftValues] = useState<typeof initialCreateValues | null>(() => {
    const d = loadNewUserDraft();
    return d ? d.values : null;
  });
  const [genPassword, setGenPassword] = useState('');
  const [showGenPw, setShowGenPw] = useState(false);

  // ── Changes log dialog ────────────────────────────────────────────────────────
  const [changesLogOpen, setChangesLogOpen] = useState(false);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');
  const [logFilterField, setLogFilterField] = useState('');
  const [logFilterReason, setLogFilterReason] = useState('');
  const [logSortBy, setLogSortBy] = useState('createdAt');
  const [logSortOrder, setLogSortOrder] = useState<'asc' | 'desc'>('desc');
  const [logPage, setLogPage] = useState(0);
  const [logRowsPerPage, setLogRowsPerPage] = useState(25);
  const [logMaximized, setLogMaximized] = useState(false);
  const [logShowFilters, setLogShowFilters] = useState(true);

  // ── Login data dialog ─────────────────────────────────────────────────────────
  const [loginDataOpen, setLoginDataOpen] = useState(false);

  // ── Consultant profile dialog ─────────────────────────────────────────────────
  const [consultantProfileOpen, setConsultantProfileOpen] = useState(false);

  // ── Change profile (role) dialog ──────────────────────────────────────────────
  const [changeProfileOpen, setChangeProfileOpen] = useState(false);
  const [changeProfileRole, setChangeProfileRole] = useState('');
  const [changeProfileReasonCode, setChangeProfileReasonCode] = useState('');
  const [changeProfileNoteText, setChangeProfileNoteText] = useState('');
  const [changeProfileAttachment, setChangeProfileAttachment] = useState<File | null>(null);
  const [changeProfileErrors, setChangeProfileErrors] = useState<ChangeProfileErrors>({});
  const [changeProfileConfirmOpen, setChangeProfileConfirmOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const changeProfileNoteRef = useRef<HTMLTextAreaElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // ── Generate temp password ────────────────────────────────────────────────────
  const [tempPwOpen, setTempPwOpen] = useState(false);
  const [isGeneratingTempPw, setIsGeneratingTempPw] = useState(false);
  const [tempPwBulkMode, setTempPwBulkMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [tempPwValidity, setTempPwValidity] = useState('24h');
  const [tempPwForceReset, setTempPwForceReset] = useState(true);
  const [tempPwNote, setTempPwNote] = useState('');

  // ── Reset password dialog ─────────────────────────────────────────────────────
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isResettingPw, setIsResettingPw] = useState(false);
  const [resetPwMode, setResetPwMode] = useState<'auto' | 'manual'>('auto');
  const [autoResetPw, setAutoResetPw] = useState('');
  const [showAutoResetPw, setShowAutoResetPw] = useState(false);
  const [showManualPw, setShowManualPw] = useState(false);
  const [showManualPwConfirm, setShowManualPwConfirm] = useState(false);
  const [resetPwForceChange, setResetPwForceChange] = useState(true);
  const [resetPwReason, setResetPwReason] = useState('');
  const [resetPwErrors, setResetPwErrors] = useState<ResetPwErrors>({});

  // ── Admin controls ────────────────────────────────────────────────────────────
  const [adminTwoLevel, setAdminTwoLevel] = useState(false);
  const [adminManagerOnly, setAdminManagerOnly] = useState(false);
  const [adminAdditionalApproval, setAdminAdditionalApproval] = useState(false);
  const [adminApprover, setAdminApprover] = useState('');
  const [adminControlsOpen, setAdminControlsOpen] = useState(false);
  const [pageStyles, setPageStyles] = useState<PageStyles>({
    signIn: 'new',
    signUp: 'new',
    forgotPassword: 'new',
  });

  const { themeName: selectedTheme, setThemeName } = useThemeContext();
  const { data: adminControlsData } = useGetAdminControlsQuery();
  const [updateAdminControls, { isLoading: isSavingControls }] = useUpdateAdminControlsMutation();

  // Load admin controls from DB on mount
  useEffect(() => {
    if (adminControlsData) {
      setAdminTwoLevel(adminControlsData.adminTwoLevel);
      setAdminManagerOnly(adminControlsData.adminManagerOnly);
      setAdminAdditionalApproval(adminControlsData.adminAdditionalApproval);
      setAdminApprover(adminControlsData.adminApprover ?? '');
      setPageStyles({
        signIn: (adminControlsData.signInStyle as 'old' | 'new') || 'new',
        signUp: (adminControlsData.signUpStyle as 'old' | 'new') || 'new',
        forgotPassword: (adminControlsData.forgotPasswordStyle as 'old' | 'new') || 'new',
      });
      // Apply theme from DB if not already set in localStorage
      const storedTheme = localStorage.getItem('serivceops_selected_theme');
      if (!storedTheme || storedTheme === 'System') {
        setThemeName(adminControlsData.theme);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminControlsData]);

  const handlePageStyleChange = (
    page: 'signIn' | 'signUp' | 'forgotPassword',
    value: 'old' | 'new',
  ) => {
    const next = { ...pageStyles, [page]: value };
    setPageStyles(next);
    updateAdminControls({
      signInStyle: next.signIn,
      signUpStyle: next.signUp,
      forgotPasswordStyle: next.forgotPassword,
    }).catch(() => notify.error('Failed to save layout settings'));
  };

  const handleThemeChange = (theme: string) => {
    setThemeName(theme);
    updateAdminControls({ theme }).catch(() => notify.error('Failed to save theme'));
  };

  const handleAdminTwoLevelChange = (v: boolean) => {
    setAdminTwoLevel(v);
    updateAdminControls({ adminTwoLevel: v }).catch(() =>
      notify.error('Failed to save approval settings'),
    );
  };

  const handleAdminManagerOnlyChange = (v: boolean) => {
    setAdminManagerOnly(v);
    updateAdminControls({ adminManagerOnly: v }).catch(() =>
      notify.error('Failed to save approval settings'),
    );
  };

  const handleAdminAdditionalApprovalChange = (v: boolean) => {
    setAdminAdditionalApproval(v);
    updateAdminControls({ adminAdditionalApproval: v }).catch(() =>
      notify.error('Failed to save approval settings'),
    );
  };

  const handleAdminApproverChange = (v: string) => {
    setAdminApprover(v);
  };

  const handleAdminApproverBlur = () => {
    updateAdminControls({ adminApprover }).catch(() => notify.error('Failed to save approver'));
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await authAction({ action: 'get-all-users' }).unwrap();
      const users: IAuthUser[] = result.data || [];
      setAllUsers(users);
      setAdmins(users.filter((u) => u.role === 'admin'));
      setConsultants(users.filter((u) => u.role === 'consultant'));
      setSelectedRow((prev) => {
        if (!prev) return null;
        const fresh = users.find((u) => u.id === prev.id);
        return fresh ? { ...fresh, sno: prev.sno } : null;
      });
    } catch {
      notify.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAction]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRowClick = (row: UserRow) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  };

  const handleToggleAccess = async (row: UserRow, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVal = e.target.checked;
    setTogglingIds((prev) => new Set(prev).add(row.id));
    try {
      await authAction({
        action: newVal ? 'activate-user' : 'deactivate-user',
        userId: row.id,
      }).unwrap();
      const patch = (u: IAuthUser) => (u.id === row.id ? { ...u, isActive: newVal } : u);
      setAllUsers((p) => p.map(patch));
      setAdmins((p) => p.map(patch));
      setConsultants((p) => p.map(patch));
      if (selectedRow?.id === row.id) setSelectedRow((p) => (p ? { ...p, isActive: newVal } : p));
    } catch {
      notify.error(`Failed to update access for ${row.name}`);
    } finally {
      setTogglingIds((prev) => {
        const n = new Set(prev);
        n.delete(row.id);
        return n;
      });
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleOpenEdit = () => {
    if (!selectedRow) return;
    const form = buildEditForm(selectedRow);
    setEditForm(form);
    setEditOriginal(form);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRow) return;
    setIsSavingEdit(true);
    try {
      const updateData: Record<string, unknown> = {
        ...editForm,
        name: `${editForm.firstName} ${editForm.lastName}`,
        accessFromDate: editForm.accessFromDate
          ? new Date(editForm.accessFromDate).toISOString()
          : null,
        accessToDate: editForm.accessToDate ? new Date(editForm.accessToDate).toISOString() : null,
      };
      await authAction({
        action: 'update-user',
        userId: selectedRow.id,
        data: updateData,
      }).unwrap();
      notify.success('User updated successfully');
      setEditOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update user',
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────────
  const createFormik = useFormWithSessionStorage('um_new_user', {
    initialValues: initialCreateValues,
    validationSchema: AdminCreateUserSchema,
    enableReinitialize: false,
    onSubmit: async (values, helpers) => {
      try {
        await authAction({ action: 'create-user', ...values }).unwrap();
        notify.success(
          'User created successfully. A welcome email with credentials has been sent.',
        );
        clearNewUserDraft();
        setDraftMeta(null);
        setDraftValues(null);
        setCreateOpen(false);
        helpers.resetForm();
        fetchUsers();
      } catch (err: unknown) {
        notify.error(
          (err as { data?: { message?: string } })?.data?.message || 'Failed to create user',
        );
        helpers.setSubmitting(false);
      }
    },
  });

  const handleOpenNew = () => {
    const pw = generateTempPassword();
    setGenPassword(pw);
    setShowGenPw(false);
    setIsOpenedAsDraft(false);
    try {
      const raw = sessionStorage.getItem(UM_SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        createFormik.resetForm({
          values: { ...initialCreateValues, ...saved, password: '', confirmPassword: '' },
        });
      } else {
        createFormik.resetForm({
          values: { ...initialCreateValues, password: '', confirmPassword: '' },
        });
      }
    } catch {
      createFormik.resetForm({
        values: { ...initialCreateValues, password: '', confirmPassword: '' },
      });
    }
    setCreateOpen(true);
  };

  const handleOpenDraft = () => {
    if (!draftValues) return;
    const pw = generateTempPassword();
    setGenPassword(pw);
    setShowGenPw(false);
    setIsOpenedAsDraft(true);
    createFormik.resetForm({ values: { ...draftValues, password: '', confirmPassword: '' } });
    setCreateOpen(true);
  };

  const handleRegeneratePw = () => {
    setGenPassword(generateTempPassword());
  };

  const handleApplyGenPw = () => {
    createFormik.setFieldValue('password', genPassword);
    createFormik.setFieldValue('confirmPassword', genPassword);
    notify.success('Temporary password applied to the fields above');
  };

  const handleSaveDraft = () => {
    const draft = saveNewUserDraft(createFormik.values);
    setDraftMeta({ savedAt: draft.savedAt, expiresAt: draft.expiresAt });
    setDraftValues(createFormik.values);
    setCreateOpen(false);
    const expiryDate = new Date(draft.expiresAt).toLocaleDateString();
    notify.success(
      `Draft saved — available until ${expiryDate}. It will be deleted automatically after ${DRAFT_DAYS} days.`,
    );
  };

  const handleCancelCreate = () => {
    setCreateOpen(false);
  };

  // ── Changes log ───────────────────────────────────────────────────────────────
  const handleOpenChangesLog = async () => {
    if (!selectedRow) return;
    setLogSearch('');
    setLogDateFrom('');
    setLogDateTo('');
    setLogFilterField('');
    setLogFilterReason('');
    setLogSortBy('createdAt');
    setLogSortOrder('desc');
    setLogPage(0);
    setLogRowsPerPage(25);
    setLogMaximized(false);
    setLogShowFilters(true);
    setChangesLogOpen(true);
    setIsLoadingLog(true);
    try {
      const result = await authAction({
        action: 'get-change-log',
        userId: selectedRow.id,
      }).unwrap();
      setChangeLog((result?.data as ChangeLogEntry[]) || []);
    } catch {
      setChangeLog([]);
    } finally {
      setIsLoadingLog(false);
    }
  };

  const uniqueLogFields = useMemo(
    () => [...new Set(changeLog.map((l) => l.fieldName).filter((v): v is string => !!v))].sort(),
    [changeLog],
  );

  const filteredLog = useMemo(() => {
    let logs = [...changeLog];
    if (logSearch) {
      const q = logSearch.toLowerCase();
      logs = logs.filter((l) =>
        [
          l.changeType,
          l.fieldName,
          l.previousValue,
          l.newValue,
          l.changedByName,
          l.reasonCode,
          l.reasonNotes,
        ].some((v) => v && String(v).toLowerCase().includes(q)),
      );
    }
    if (logDateFrom) {
      logs = logs.filter((l) => l.createdAt && new Date(l.createdAt) >= new Date(logDateFrom));
    }
    if (logDateTo) {
      logs = logs.filter(
        (l) => l.createdAt && new Date(l.createdAt) <= new Date(`${logDateTo}T23:59:59`),
      );
    }
    if (logFilterField) {
      logs = logs.filter((l) => l.fieldName === logFilterField);
    }
    if (logFilterReason) {
      logs = logs.filter((l) => l.reasonCode === logFilterReason);
    }
    logs.sort((a, b) => {
      const aVal = String(a[logSortBy as keyof ChangeLogEntry] ?? '');
      const bVal = String(b[logSortBy as keyof ChangeLogEntry] ?? '');
      if (aVal === bVal) return 0;
      return (logSortOrder === 'asc' ? 1 : -1) * (aVal < bVal ? -1 : 1);
    });
    return logs;
  }, [
    changeLog,
    logSearch,
    logDateFrom,
    logDateTo,
    logFilterField,
    logFilterReason,
    logSortBy,
    logSortOrder,
  ]);

  const paginatedLog = useMemo(
    () => filteredLog.slice(logPage * logRowsPerPage, logPage * logRowsPerPage + logRowsPerPage),
    [filteredLog, logPage, logRowsPerPage],
  );

  const hasLogFilters = !!(
    logSearch ||
    logDateFrom ||
    logDateTo ||
    logFilterField ||
    logFilterReason
  );

  const handleLogSort = (col: string) => {
    if (logSortBy === col) {
      setLogSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setLogSortBy(col);
      setLogSortOrder('asc');
    }
    setLogPage(0);
  };

  const clearLogFilters = () => {
    setLogSearch('');
    setLogDateFrom('');
    setLogDateTo('');
    setLogFilterField('');
    setLogFilterReason('');
    setLogPage(0);
  };

  const handleExportCsv = () => {
    const headers = [
      'Date/Time',
      'Change Type',
      'Field Changed',
      'Previous Value',
      'New Value',
      'Changed By',
      'Reason Code',
      'Reason Note',
    ];
    const rows = filteredLog.map((log) => [
      fmtDateTime(log.createdAt),
      log.changeType || '-',
      log.fieldName || '-',
      log.previousValue || '-',
      log.newValue || '-',
      log.changedByName || '-',
      log.reasonCode || '-',
      (log.reasonNotes || '-').replace(/\n/g, ' '),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changes-log-${(selectedRow?.name || 'user').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Change profile ────────────────────────────────────────────────────────────
  const handleOpenChangeProfile = () => {
    if (!selectedRow) return;
    setChangeProfileRole('');
    setChangeProfileReasonCode('');
    setChangeProfileNoteText('');
    setChangeProfileAttachment(null);
    setChangeProfileErrors({});
    setChangeProfileConfirmOpen(false);
    setChangeProfileOpen(true);
  };

  const handleChangeProfileSubmit = () => {
    const errors: ChangeProfileErrors = {};
    if (!changeProfileRole) {
      errors.role = 'required';
    } else if (changeProfileRole === selectedRow?.role) {
      errors.role = 'Must be different from current role';
    }
    if (!changeProfileReasonCode) {
      errors.reasonCode = 'required';
    }
    if (!changeProfileNoteText.trim()) {
      errors.note = 'required';
    }
    if (Object.keys(errors).length > 0) {
      setChangeProfileErrors(errors);
      return;
    }
    setChangeProfileConfirmOpen(true);
  };

  const handleSaveChangeProfile = async () => {
    if (!selectedRow) return;
    setIsSavingProfile(true);
    try {
      await authAction({
        action: 'update-user',
        userId: selectedRow.id,
        data: { role: changeProfileRole },
        reasonCode: changeProfileReasonCode,
        reasonNotes: changeProfileNoteText,
      }).unwrap();
      notify.success(`Role changed to ${changeProfileRole}`);
      setChangeProfileOpen(false);
      setChangeProfileConfirmOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to change role',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Temp password ─────────────────────────────────────────────────────────────
  const handleOpenTempPw = () => {
    setTempPwBulkMode(false);
    setBulkSelectedIds(selectedRow ? [selectedRow.id] : []);
    setTempPwValidity('24h');
    setTempPwForceReset(true);
    setTempPwNote('');
    setTempPwOpen(true);
  };

  const handleGenerateTempPw = async () => {
    const ids = tempPwBulkMode ? bulkSelectedIds : selectedRow ? [selectedRow.id] : [];
    if (ids.length === 0) return;
    setIsGeneratingTempPw(true);
    try {
      await authAction({
        action: 'generate-temp-password',
        userIds: ids,
        validity: tempPwValidity,
        forceReset: tempPwForceReset,
        note: tempPwNote,
      }).unwrap();
      notify.success(
        `Temporary password generated and emailed to ${ids.length} user${ids.length > 1 ? 's' : ''}`,
      );
      setTempPwOpen(false);
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message ||
          'Failed to generate temporary password',
      );
    } finally {
      setIsGeneratingTempPw(false);
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────────
  const handleOpenResetPw = () => {
    const pw = generateTempPassword();
    setResetPwMode('auto');
    setAutoResetPw(pw);
    setShowAutoResetPw(false);
    setNewPassword('');
    setNewPasswordConfirm('');
    setShowManualPw(false);
    setShowManualPwConfirm(false);
    setResetPwForceChange(true);
    setResetPwReason('');
    setResetPwErrors({});
    setResetPwOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedRow) return;
    let password: string;
    if (resetPwMode === 'auto') {
      password = autoResetPw;
    } else {
      const errs: ResetPwErrors = {};
      if (!newPassword || newPassword.length < 8) errs.password = 'Must be at least 8 characters';
      if (!/[A-Z]/.test(newPassword))
        errs.password = errs.password || 'Must contain an uppercase letter';
      if (!/[0-9]/.test(newPassword)) errs.password = errs.password || 'Must contain a number';
      if (newPassword !== newPasswordConfirm) errs.confirm = 'Passwords do not match';
      if (Object.keys(errs).length > 0) {
        setResetPwErrors(errs);
        return;
      }
      password = newPassword;
    }
    setIsResettingPw(true);
    try {
      await authAction({
        action: 'reset-user-password',
        userId: selectedRow.id,
        newPassword: password,
        forceChange: resetPwForceChange,
        reason: resetPwReason,
      }).unwrap();
      notify.success(
        `Password reset successfully.${resetPwForceChange ? ' User must change it on next login.' : ''}`,
      );
      setResetPwOpen(false);
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to reset password',
      );
    } finally {
      setIsResettingPw(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: Column<UserRow>[] = useMemo(
    () => [
      { id: 'sno', label: 'S.No', minWidth: 60, sortable: false },
      {
        id: 'name',
        label: 'Name',
        minWidth: 160,
        format: (_v: unknown, row: UserRow): React.ReactNode =>
          React.createElement(
            'span',
            {
              role: 'button',
              tabIndex: 0,
              style: {
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: selectedRow?.id === row.id ? 'underline' : 'none',
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleRowClick(row);
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter') handleRowClick(row);
              },
            },
            String(row.name || '-'),
          ),
      },
      { id: 'email', label: 'Work Email', minWidth: 180, format: (v) => String(v || '-') },
      { id: 'department', label: 'Department', minWidth: 160, format: (v) => String(v || '-') },
      {
        id: 'workLocation' as keyof UserRow,
        label: 'Work Location',
        minWidth: 150,
        format: (v) => String(v || '-'),
      },
      {
        id: 'managerName' as keyof UserRow,
        label: 'Reporting Manager',
        minWidth: 200,
        format: (v) => String(v || '-'),
      },
      {
        id: 'role',
        label: 'User Role',
        minWidth: 150,
        format: (v): React.ReactNode => {
          const role = String(v || '');
          if (!role || role === '-') return '-';
          const colorMap: Record<string, 'warning' | 'success' | 'primary'> = {
            admin: 'warning',
            consultant: 'success',
            user: 'primary',
          };
          return (
            <Chip
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              color={colorMap[role] || 'default'}
              size='small'
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          );
        },
      },
      {
        id: 'status' as keyof UserRow,
        label: 'Status',
        minWidth: 120,
        format: (v): React.ReactNode => {
          const status = String(v || '');
          if (!status || status === '-') return '-';
          const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const color =
            status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'warning';
          return (
            <Chip
              label={label}
              color={color as 'success' | 'default' | 'warning'}
              size='small'
              variant='outlined'
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          );
        },
      },
      {
        id: 'isActive' as keyof UserRow,
        label: 'Access',
        minWidth: 90,
        sortable: false,
        format: (_v, row: UserRow): React.ReactNode => (
          <Switch
            size='small'
            checked={!!row.isActive}
            color='success'
            disabled={togglingIds.has(row.id) || row.id === currentUser?.id}
            onChange={(e) => handleToggleAccess(row, e)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        id: 'accessFromDate' as keyof UserRow,
        label: 'Access Start Date',
        minWidth: 180,
        format: (v) => fmtDate(v as string),
      },
      {
        id: 'accessToDate' as keyof UserRow,
        label: 'Access End Date',
        minWidth: 180,
        format: (v) => fmtDate(v as string),
      },
      {
        id: 'timezone' as keyof UserRow,
        label: 'Timezone',
        minWidth: 210,
        format: (v) => getTzDisplay(v as string),
      },
      {
        id: 'dateFormat' as keyof UserRow,
        label: 'Date Format',
        minWidth: 150,
        format: (v) => String(v || '-'),
      },
      {
        id: 'timeFormat' as keyof UserRow,
        label: 'Time Format',
        minWidth: 160,
        format: (v) => TIME_FORMAT_LABELS[String(v)] || String(v || '-'),
      },
      {
        id: 'language' as keyof UserRow,
        label: 'Language',
        minWidth: 120,
        format: (v) => LANG_LABELS[String(v)] || String(v || '-'),
      },
      {
        id: 'slaWorkingCalendar' as keyof UserRow,
        label: 'Working Calendar',
        minWidth: 180,
        format: (v) => String(v || '-'),
      },
      {
        id: 'slaExceptionGroup' as keyof UserRow,
        label: 'Leave Calendar',
        minWidth: 180,
        format: (v) => String(v || '-'),
      },
      {
        id: 'source' as keyof UserRow,
        label: 'Source',
        minWidth: 140,
        format: (v) => SOURCE_LABELS[String(v).toLowerCase()] || (v ? String(v) : '-'),
      },
      {
        id: 'createdAt' as keyof UserRow,
        label: 'Joined',
        minWidth: 140,
        format: (v, row) => fmtDateUser(v as string, row.timezone, row.dateFormat),
      },
      {
        id: 'lastActivityAt' as keyof UserRow,
        label: 'Last Activity',
        minWidth: 180,
        format: (v, row) =>
          fmtDateTimeUser(v as string, row.timezone, row.dateFormat, row.timeFormat),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRow],
  );

  const getTableData = (users: IAuthUser[], startFrom = 1): UserRow[] =>
    users.map((u, i) => ({ ...u, sno: startFrom + i }));

  const draftRow: UserRow | null =
    draftMeta && draftValues
      ? ({
          id: -1,
          sno: 0,
          firstName: draftValues.firstName || '',
          lastName: draftValues.lastName || '',
          name:
            [draftValues.firstName, draftValues.lastName].filter(Boolean).join(' ') ||
            '(Draft User)',
          email: draftValues.email || '—',
          phone: draftValues.phone || null,
          workLocation: draftValues.workLocation || null,
          department: draftValues.department || null,
          businessUnit: draftValues.businessUnit || null,
          employeeId: draftValues.employeeId || null,
          managerName: draftValues.managerName || null,
          dateOfBirth: null,
          profilePicture: null,
          reasonForAccess: draftValues.reasonForAccess || null,
          role: draftValues.role as UserRole,
          requestedRole: null,
          status: 'draft',
          reviewedBy: null,
          reviewedAt: null,
          adminNotes: `Draft saved ${new Date(draftMeta.savedAt).toLocaleDateString()} · Expires in ${getDraftDaysRemaining(draftMeta.expiresAt)} days`,
          isActive: false,
          createdAt: draftMeta.savedAt,
          updatedAt: draftMeta.savedAt,
          accessFromDate: draftMeta.savedAt,
          accessToDate: draftMeta.expiresAt,
          timezone: null,
          dateFormat: null,
          timeFormat: null,
          language: null,
          slaWorkingCalendar: null,
          slaExceptionGroup: null,
          application: null,
          applicationLead: null,
          consultantProfileUpdated: false,
          mustResetPassword: false,
          source: 'draft',
          lastActivityAt: null,
        } as unknown as UserRow)
      : null;

  return {
    // table
    allUsers,
    admins,
    consultants,
    isLoading,
    isMobile,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    togglingIds,
    selectedRow,
    setSelectedRow,
    fetchUsers,
    handleRowClick,
    handleToggleAccess,
    columns,
    getTableData,
    draftRow,
    currentUser,
    // edit
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    isSavingEdit,
    isDirty,
    adminNotes,
    setAdminNotes,
    handleOpenEdit,
    handleSaveEdit,
    // create
    createOpen,
    setCreateOpen,
    isOpenedAsDraft,
    setIsOpenedAsDraft,
    draftMeta,
    setDraftMeta,
    draftValues,
    setDraftValues,
    genPassword,
    setGenPassword,
    showGenPw,
    setShowGenPw,
    createFormik,
    handleOpenNew,
    handleOpenDraft,
    handleRegeneratePw,
    handleApplyGenPw,
    handleSaveDraft,
    handleCancelCreate,
    reqError,
    // changes log
    changesLogOpen,
    setChangesLogOpen,
    changeLog,
    isLoadingLog,
    logSearch,
    setLogSearch,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    logFilterField,
    setLogFilterField,
    logFilterReason,
    setLogFilterReason,
    logSortBy,
    logSortOrder,
    logPage,
    setLogPage,
    logRowsPerPage,
    setLogRowsPerPage,
    logMaximized,
    setLogMaximized,
    logShowFilters,
    setLogShowFilters,
    uniqueLogFields,
    filteredLog,
    paginatedLog,
    hasLogFilters,
    handleOpenChangesLog,
    handleLogSort,
    clearLogFilters,
    handleExportCsv,
    // login data
    loginDataOpen,
    setLoginDataOpen,
    // consultant profile
    consultantProfileOpen,
    setConsultantProfileOpen,
    // change profile
    changeProfileOpen,
    setChangeProfileOpen,
    changeProfileRole,
    setChangeProfileRole,
    changeProfileReasonCode,
    setChangeProfileReasonCode,
    changeProfileNoteText,
    setChangeProfileNoteText,
    changeProfileAttachment,
    setChangeProfileAttachment,
    changeProfileErrors,
    setChangeProfileErrors,
    changeProfileConfirmOpen,
    setChangeProfileConfirmOpen,
    isSavingProfile,
    changeProfileNoteRef,
    attachmentInputRef,
    handleOpenChangeProfile,
    handleChangeProfileSubmit,
    handleSaveChangeProfile,
    // temp password
    tempPwOpen,
    setTempPwOpen,
    isGeneratingTempPw,
    tempPwBulkMode,
    setTempPwBulkMode,
    bulkSelectedIds,
    setBulkSelectedIds,
    tempPwValidity,
    setTempPwValidity,
    tempPwForceReset,
    setTempPwForceReset,
    tempPwNote,
    setTempPwNote,
    handleOpenTempPw,
    handleGenerateTempPw,
    // reset password
    resetPwOpen,
    setResetPwOpen,
    newPassword,
    setNewPassword,
    newPasswordConfirm,
    setNewPasswordConfirm,
    isResettingPw,
    resetPwMode,
    setResetPwMode,
    autoResetPw,
    setAutoResetPw,
    showAutoResetPw,
    setShowAutoResetPw,
    showManualPw,
    setShowManualPw,
    showManualPwConfirm,
    setShowManualPwConfirm,
    resetPwForceChange,
    setResetPwForceChange,
    resetPwReason,
    setResetPwReason,
    resetPwErrors,
    setResetPwErrors,
    handleOpenResetPw,
    handleResetPassword,
    // admin controls
    adminControlsOpen,
    setAdminControlsOpen,
    adminTwoLevel,
    handleAdminTwoLevelChange,
    adminManagerOnly,
    handleAdminManagerOnlyChange,
    adminAdditionalApproval,
    handleAdminAdditionalApprovalChange,
    adminApprover,
    setAdminApprover,
    handleAdminApproverChange,
    handleAdminApproverBlur,
    isSavingControls,
    pageStyles,
    handlePageStyleChange,
    selectedTheme,
    handleThemeChange,
  };
};

export default useUserManagement;
