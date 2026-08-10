import { ReactNode } from 'react';
import {
  IIncident,
  IServiceRequest,
  IAdvisoryRequest,
  IUpdateIncidentInput,
} from '@serviceops/interfaces';

/** A ticket of any of the three types this page supports, as returned by the unified get-by-number endpoint */
export type TicketEntity = (IIncident | IServiceRequest | IAdvisoryRequest) & {
  ticketType: string;
  customFieldValues?: Record<string, string>;
};

/**
 * Edit-form shape shared across ticket types. `status`/`channel` are typed
 * loosely (plain string) here because Incident/ServiceRequest/AdvisoryRequest
 * each have their own status enum with identical string values but distinct
 * TS types — callers cast to the specific input type for whichever update
 * mutation they end up calling.
 */
export type TicketUpdateInput = Omit<IUpdateIncidentInput, 'status' | 'channel'> & {
  status?: string;
};

/** The generic, ticketType-aware update dispatcher returned by useTicketDetail */
export type UpdateTicketFn = (args: { id: number | string; data: TicketUpdateInput }) => {
  unwrap: () => Promise<unknown>;
};

export interface ActionButtonConfig {
  icon: ReactNode;
  label: string;
  onClick?: (e?: any) => void;
  disabled?: boolean;
}

export type ModalType =
  | 'priorityChange'
  | 'assign'
  | 'attachment'
  | 'comment'
  | 'commentInternal'
  | 'commentSelf'
  | 'timeEntry'
  | 'resolve'
  | null;

export interface TimeSummaryData {
  approvedMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  varianceMinutes: number;
}

export type EditModeAction =
  | 'save'
  | 'saveAndClose'
  | 'saveAndResolve'
  | 'saveAndEnterTime'
  | 'saveAndAddComment'
  | 'saveAndFollow'
  | 'addAttachment'
  | 'goToActivity';
