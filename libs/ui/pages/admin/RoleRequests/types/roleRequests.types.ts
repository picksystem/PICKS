import { IAuthUser } from '@serviceops/interfaces';

export type RoleRequestRow = IAuthUser & { sno: number };
export type ActionType = 'approve' | 'reject';
