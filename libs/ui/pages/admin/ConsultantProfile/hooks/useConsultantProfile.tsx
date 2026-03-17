import React, { useEffect, useState, useCallback } from 'react';
import { Column } from '@picks/component';
import { Chip, Typography, Stack, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthActionMutation } from '@picks/services';
import { useNotification } from '@picks/hooks';
import { IAuthUser, IConsultantProfile, IConsultantRole } from '@picks/interfaces';
import { ProfileForm, ProfileRow, RoleForm, RoleRow } from '../types/consultantProfile.types';
import {
  emptyProfileForm,
  emptyRoleForm,
  getUserName,
  getProfileFromForm,
} from '../utils/consultantProfile.utils';

export const useConsultantProfile = () => {
  const [authAction] = useAuthActionMutation();
  const notify = useNotification();

  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSearch, setProfileSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');

  // ── Data ──────────────────────────────────────────────────────────────────
  const [consultantUsers, setConsultantUsers] = useState<IAuthUser[]>([]);
  const [profiles, setProfiles] = useState<IConsultantProfile[]>([]);
  const [roles, setRoles] = useState<IConsultantRole[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [appFilter, setAppFilter] = useState('');

  // ── Profile dialog ────────────────────────────────────────────────────────
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Role dialog ───────────────────────────────────────────────────────────
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isDeletingRoleId, setIsDeletingRoleId] = useState<number | null>(null);

  // ── View profile dialog ───────────────────────────────────────────────────
  const [viewProfile, setViewProfile] = useState<IConsultantProfile | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, profilesRes, rolesRes] = await Promise.all([
        authAction({ action: 'get-all-users' }).unwrap(),
        authAction({ action: 'get-consultant-profiles' }).unwrap(),
        authAction({ action: 'get-consultant-roles' }).unwrap(),
      ]);
      const users: IAuthUser[] = usersRes?.data || [];
      setConsultantUsers(users.filter((u) => u.role === 'consultant'));
      setProfiles(profilesRes?.data || []);
      setRoles(rolesRes?.data || []);
    } catch {
      notify.error('Failed to load consultant data');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAction]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Profile actions ───────────────────────────────────────────────────────
  const handleOpenCreateProfile = () => {
    setProfileForm(emptyProfileForm);
    setEditingProfileId(null);
    setProfileDialogOpen(true);
  };

  const handleOpenEditProfile = (profile: IConsultantProfile) => {
    setProfileForm(getProfileFromForm(profile));
    setEditingProfileId(profile.id);
    setProfileDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.userId || !profileForm.application) {
      notify.error('Consultant and Application are required');
      return;
    }
    setIsSavingProfile(true);
    try {
      if (editingProfileId) {
        await authAction({
          action: 'update-consultant-profile',
          profileId: editingProfileId,
          data: profileForm,
        }).unwrap();
        notify.success('Consultant profile updated');
      } else {
        await authAction({
          action: 'create-consultant-profile',
          data: profileForm,
        }).unwrap();
        notify.success('Consultant profile created');
      }
      setProfileDialogOpen(false);
      fetchAll();
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to save profile',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Role actions ──────────────────────────────────────────────────────────
  const handleOpenCreateRole = () => {
    setRoleForm(emptyRoleForm);
    setEditingRoleId(null);
    setRoleDialogOpen(true);
  };

  const handleOpenEditRole = (role: IConsultantRole) => {
    setRoleForm({
      application: role.application,
      roleName: role.roleName,
      description: role.description || '',
    });
    setEditingRoleId(role.id);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.application || !roleForm.roleName) {
      notify.error('Application and Role Name are required');
      return;
    }
    setIsSavingRole(true);
    try {
      if (editingRoleId) {
        await authAction({
          action: 'update-consultant-role',
          roleId: editingRoleId,
          data: roleForm,
        }).unwrap();
        notify.success('Consultant role updated');
      } else {
        await authAction({
          action: 'create-consultant-role',
          data: roleForm,
        }).unwrap();
        notify.success('Consultant role created');
      }
      setRoleDialogOpen(false);
      fetchAll();
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to save role',
      );
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    setIsDeletingRoleId(roleId);
    try {
      await authAction({ action: 'delete-consultant-role', roleId }).unwrap();
      notify.success('Role deleted');
      fetchAll();
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to delete role',
      );
    } finally {
      setIsDeletingRoleId(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const uniqueApps = Array.from(new Set(profiles.map((p) => p.application).filter(Boolean)));

  const filteredProfiles = profiles.filter((p) => {
    if (!showInactive && !p.isActive) return false;
    if (appFilter && p.application !== appFilter) return false;
    if (profileSearch) {
      const q = profileSearch.toLowerCase();
      return (
        getUserName(p.userId, consultantUsers).toLowerCase().includes(q) ||
        p.application.toLowerCase().includes(q) ||
        (p.consultantRole || '').toLowerCase().includes(q) ||
        (p.leadConsultant || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRoles = roles.filter((r) => {
    if (appFilter && r.application !== appFilter) return false;
    if (roleSearch) {
      const q = roleSearch.toLowerCase();
      return (
        r.application.toLowerCase().includes(q) ||
        r.roleName.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const consultantRoleOptions = profileForm.application
    ? roles.filter((r) => r.application === profileForm.application)
    : roles;

  // ── Profile columns ───────────────────────────────────────────────────────
  const profileColumns: Column<ProfileRow>[] = [
    { id: 'sno', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
    {
      id: 'userId',
      label: 'Consultant',
      minWidth: 160,
      format: (v, row): React.ReactNode => (
        <Typography
          variant='body2'
          component='span'
          onClick={(e) => {
            e.stopPropagation();
            setViewProfile(row as ProfileRow);
          }}
          sx={{
            color: 'primary.main',
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {getUserName(v as number, consultantUsers)}
        </Typography>
      ),
    },
    { id: 'application', label: 'Application', minWidth: 140, format: (v) => String(v || '-') },
    { id: 'consultantRole', label: 'Role', minWidth: 130, format: (v) => String(v || '-') },
    {
      id: 'slaWorkingCalendar',
      label: 'Working Calendar',
      minWidth: 150,
      format: (v) => String(v || '-'),
    },
    {
      id: 'leadConsultant',
      label: 'Lead Consultant',
      minWidth: 150,
      format: (v) => String(v || '-'),
    },
    {
      id: 'isPocLead',
      label: 'POC Lead',
      minWidth: 90,
      align: 'center',
      format: (v): React.ReactNode =>
        v ? <Chip label='Yes' color='primary' size='small' /> : <Chip label='No' size='small' />,
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 90,
      align: 'center',
      format: (v): React.ReactNode =>
        v ? (
          <Chip label='Active' color='success' size='small' />
        ) : (
          <Chip label='Inactive' color='default' size='small' />
        ),
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 100,
      align: 'center',
      sortable: false,
      format: (_v, row: ProfileRow): React.ReactNode => (
        <IconButton
          size='small'
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditProfile(row);
          }}
          title='Edit'
        >
          <EditIcon fontSize='small' />
        </IconButton>
      ),
    },
  ];

  // ── Role columns ──────────────────────────────────────────────────────────
  const roleColumns: Column<RoleRow>[] = [
    { id: 'sno', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
    { id: 'application', label: 'Application', minWidth: 140, format: (v) => String(v || '-') },
    { id: 'roleName', label: 'Role Name', minWidth: 150, format: (v) => String(v || '-') },
    { id: 'description', label: 'Description', minWidth: 200, format: (v) => String(v || '-') },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (_v, row: RoleRow): React.ReactNode => (
        <Stack direction='row' spacing={0.5} justifyContent='center'>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditRole(row);
            }}
            title='Edit'
          >
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton
            size='small'
            color='error'
            title='Delete'
            disabled={isDeletingRoleId === row.id}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRole(row.id);
            }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return {
    // State
    tabValue,
    setTabValue,
    isLoading,
    profileSearch,
    setProfileSearch,
    roleSearch,
    setRoleSearch,
    showInactive,
    setShowInactive,
    appFilter,
    setAppFilter,
    consultantUsers,
    profiles,
    roles,
    // Profile dialog
    profileDialogOpen,
    setProfileDialogOpen,
    profileForm,
    setProfileForm,
    editingProfileId,
    isSavingProfile,
    // Role dialog
    roleDialogOpen,
    setRoleDialogOpen,
    roleForm,
    setRoleForm,
    editingRoleId,
    isSavingRole,
    isDeletingRoleId,
    // View profile dialog
    viewProfile,
    setViewProfile,
    // Handlers
    fetchAll,
    handleOpenCreateProfile,
    handleOpenEditProfile,
    handleSaveProfile,
    handleOpenCreateRole,
    handleOpenEditRole,
    handleSaveRole,
    handleDeleteRole,
    // Derived
    uniqueApps,
    filteredProfiles,
    filteredRoles,
    consultantRoleOptions,
    // Columns
    profileColumns,
    roleColumns,
  };
};
