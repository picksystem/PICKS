import { IAuthUser } from '@picks/interfaces';

export type RoleRequestRow = IAuthUser & { sno: number };
export type ActionType = 'approve' | 'reject';
