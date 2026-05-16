import React, { useEffect, useState, useCallback } from 'react';
import { Column } from '@serviceops/component';
import { Chip, Typography, Button, Stack, Tab, Link } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuthActionMutation } from '@serviceops/services';
import { useNotification } from '@serviceops/hooks';
import { IAuthUser } from '@serviceops/interfaces';
import { RoleRequestRow, ActionType } from '../types/roleRequests.types';
import { getFilteredData, getTabLists } from '../utils/roleRequests.utils';

export const useRoleRequests = () => {
  const [authAction] = useAuthActionMutation();
  const notify = useNotification();

  const [requests, setRequests] = useState<IAuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [detailUser, setDetailUser] = useState<IAuthUser | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    user: RoleRequestRow;
    type: ActionType;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await authAction({ action: 'get-role-requests' }).unwrap();
      setRequests(result.data || []);
    } catch {
      notify.error('Failed to load access requests');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAction]);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    all: allRequests,
    pending: pendingRequests,
    approved: approvedRequests,
    rejected: rejectedRequests,
  } = getTabLists(requests);
  const tabLists = [allRequests, pendingRequests, approvedRequests, rejectedRequests];

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    const { user, type } = actionTarget;
    try {
      setActionInProgress(user.id);
      await authAction({
        action: type === 'approve' ? 'approve-role-request' : 'reject-role-request',
        userId: user.id,
        adminNotes: actionNotes || undefined,
      }).unwrap();
      notify.success(
        type === 'approve'
          ? `Access approved for ${user.name}`
          : `Access request from ${user.name} has been rejected`,
      );
      setActionTarget(null);
      setActionNotes('');
      fetchRequests();
    } catch {
      notify.error(`Failed to ${type} request. Please try again.`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenAction = (user: RoleRequestRow, type: ActionType) => {
    setActionTarget({ user, type });
    setActionNotes('');
  };

  const handleCloseAction = () => {
    setActionTarget(null);
    setActionNotes('');
  };

  const columns: Column<RoleRequestRow>[] = [
    { id: 'sno', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
    {
      id: 'name',
      label: 'Name',
      minWidth: 170,
      format: (_v: unknown, row: RoleRequestRow): React.ReactNode => (
        <Link
          component='button'
          variant='body2'
          underline='hover'
          onClick={(e) => {
            e.stopPropagation();
            setDetailUser(row);
          }}
          sx={{ fontWeight: 500, cursor: 'pointer' }}
        >
          {String(row.name || '-')}
        </Link>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 220,
      format: (v: unknown): React.ReactNode => String(v || '-'),
    },
    {
      id: 'department',
      label: 'Department',
      minWidth: 150,
      format: (v: unknown): React.ReactNode => String(v || '-'),
    },
    {
      id: 'requestedRole',
      label: 'Requested Role',
      minWidth: 140,
      align: 'center',
      format: (v: unknown): React.ReactNode => {
        const role = String(v || '-');
        return (
          <Chip
            label={role.charAt(0).toUpperCase() + role.slice(1)}
            color='primary'
            size='small'
            variant='outlined'
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (v: unknown): React.ReactNode => {
        const status = String(v || '').toLowerCase();
        const colorMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
          pending_approval: 'warning',
          invited: 'info',
          active: 'success',
          rejected: 'error',
        };
        const labelMap: Record<string, string> = {
          pending_approval: 'Pending',
          invited: 'Invited',
          active: 'Approved',
          rejected: 'Rejected',
        };
        return (
          <Chip
            label={
              labelMap[status] ||
              String(v || '-')
                .charAt(0)
                .toUpperCase() + String(v || '-').slice(1)
            }
            color={colorMap[status] ?? 'default'}
            size='small'
          />
        );
      },
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 200,
      align: 'center',
      sortable: false,
      format: (_v: unknown, row: RoleRequestRow): React.ReactNode => {
        if (row.status !== 'pending_approval') return <Typography variant='body2'>-</Typography>;
        const isProcessing = actionInProgress === row.id;
        return (
          <Stack direction='row' spacing={1} justifyContent='center'>
            <Button
              variant='contained'
              color='success'
              size='small'
              startIcon={<CheckCircleOutlineIcon />}
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAction(row, 'approve');
              }}
            >
              Approve
            </Button>
            <Button
              variant='outlined'
              color='error'
              size='small'
              startIcon={<CancelOutlinedIcon />}
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAction(row, 'reject');
              }}
            >
              Reject
            </Button>
          </Stack>
        );
      },
    },
  ];

  const tabs = (
    <>
      <Tab
        icon={<GroupIcon />}
        iconPosition='start'
        label={`All Requests (${allRequests.length})`}
      />
      <Tab
        icon={<PendingActionsIcon />}
        iconPosition='start'
        label={`Pending (${pendingRequests.length})`}
      />
      <Tab
        icon={<CheckCircleIcon />}
        iconPosition='start'
        label={`Approved (${approvedRequests.length})`}
      />
      <Tab
        icon={<CancelIcon />}
        iconPosition='start'
        label={`Rejected (${rejectedRequests.length})`}
      />
    </>
  );

  return {
    isLoading,
    tabValue,
    setTabValue,
    tableSearch,
    setTableSearch,
    tabLists,
    columns,
    tabs,
    detailUser,
    setDetailUser,
    actionTarget,
    actionNotes,
    actionInProgress,
    handleConfirmAction,
    handleOpenAction,
    handleCloseAction,
    setActionNotes,
    getFilteredData: (list: IAuthUser[]) => getFilteredData(list, tableSearch),
    allRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
  };
};
