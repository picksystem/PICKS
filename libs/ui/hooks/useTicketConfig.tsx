import { useGetConfigurationQuery } from '@serviceops/services';
import { IConfigStatusLevel } from '@serviceops/interfaces';

// ── Option shape used by every Select dropdown in the app ─────────────────────

export interface ITicketConfigOption {
  value: string;
  label: string;
  bgColor?: string; // badge/dot colour for display
  color?: string; // foreground text colour
}

// ── Static fallbacks (used while the API loads or if config is empty) ─────────

const FALLBACK_IMPACT_OPTIONS: ITicketConfigOption[] = [
  { value: 'high', label: '1 - High', bgColor: '#b91c1c' },
  { value: 'medium', label: '2 - Medium', bgColor: '#ca8a04' },
  { value: 'low', label: '3 - Low', bgColor: '#15803d' },
];

const FALLBACK_URGENCY_OPTIONS: ITicketConfigOption[] = [
  { value: 'high', label: '1 - High', bgColor: '#b91c1c' },
  { value: 'medium', label: '2 - Medium', bgColor: '#ca8a04' },
  { value: 'low', label: '3 - Low', bgColor: '#15803d' },
];

const FALLBACK_PRIORITY_OPTIONS: ITicketConfigOption[] = [
  { value: 'critical', label: '1 - Critical', bgColor: '#b91c1c', color: '#fff' },
  { value: 'high', label: '2 - High', bgColor: '#ea580c', color: '#fff' },
  { value: 'medium', label: '3 - Medium', bgColor: '#ca8a04', color: '#fff' },
  { value: 'low', label: '4 - Low', bgColor: '#2563eb', color: '#fff' },
  { value: 'planning', label: '5 - Planning', bgColor: '#0f766e', color: '#fff' },
];

/** Fallback statuses shared by all ticket types until config statuses are set. */
const FALLBACK_STATUS_OPTIONS: ITicketConfigOption[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Central source of truth for all configuration-driven dropdown options.
 *
 * Every create-ticket form, ticket detail screen, and suggested-solution page
 * reads its impact / urgency / priority / status options from here.
 *
 * When the admin adds or removes a level in Configuration → Priorities (or
 * Statuses), those changes are reflected immediately in all forms that call
 * this hook — no code changes needed.
 *
 * @param ticketType  Optional ticket type key (e.g. 'incident', 'service_request').
 *                    When provided, options are filtered to only those enabled
 *                    for that ticket type.
 */
export const useTicketConfig = (ticketType?: string) => {
  const { data: config, isLoading } = useGetConfigurationQuery();
  const p = config?.data?.priorities;

  // ── Impact options ──────────────────────────────────────────────────────────
  const impactOptions: ITicketConfigOption[] = p?.impactLevels?.length
    ? p.impactLevels
        .filter((l) => l.isActive && (!ticketType || l.enabledFor[ticketType] !== false))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => ({ value: l.name, label: l.displayName, bgColor: l.bgColor }))
    : FALLBACK_IMPACT_OPTIONS;

  // ── Urgency options ─────────────────────────────────────────────────────────
  const urgencyOptions: ITicketConfigOption[] = p?.urgencyLevels?.length
    ? p.urgencyLevels
        .filter((l) => l.isActive && (!ticketType || l.enabledFor[ticketType] !== false))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => ({ value: l.name, label: l.displayName, bgColor: l.bgColor }))
    : FALLBACK_URGENCY_OPTIONS;

  // ── Priority options ────────────────────────────────────────────────────────
  const priorityOptions: ITicketConfigOption[] = p?.levels?.length
    ? p.levels
        .filter((l) => !ticketType || l.enabledFor[ticketType] !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => ({ value: l.id, label: l.name, bgColor: l.bgColor, color: l.color }))
    : FALLBACK_PRIORITY_OPTIONS;

  // ── Status options ──────────────────────────────────────────────────────────
  // Falls back to shared defaults until statuses are configured in the admin UI.
  const allStatuses: IConfigStatusLevel[] = config?.data?.statuses?.items ?? [];
  const configStatuses: IConfigStatusLevel[] = ticketType
    ? allStatuses.filter((s) => s.enabledFor[ticketType] !== false)
    : allStatuses;
  const statusOptions: ITicketConfigOption[] = configStatuses.length
    ? configStatuses
        .filter((s: IConfigStatusLevel) => s.isActive)
        .sort((a: IConfigStatusLevel, b: IConfigStatusLevel) => a.sortOrder - b.sortOrder)
        .map((s: IConfigStatusLevel) => ({
          value: s.id,
          label: s.displayName,
          bgColor: s.bgColor,
        }))
    : FALLBACK_STATUS_OPTIONS;

  // ── Lookup helpers (used in detail screens to resolve display labels/colours) ─

  const findPriority = (value: string) => p?.levels?.find((l) => l.id === value) ?? null;

  const findImpact = (value: string) =>
    p?.impactLevels?.find((l) => l.name === value || l.id === value) ?? null;

  const findUrgency = (value: string) =>
    p?.urgencyLevels?.find((l) => l.name === value || l.id === value) ?? null;

  return {
    /** Impact level options, filtered + sorted for the given ticket type. */
    impactOptions,
    /** Urgency level options, filtered + sorted for the given ticket type. */
    urgencyOptions,
    /** Priority level options, filtered + sorted for the given ticket type. */
    priorityOptions,
    /** Status options for the given ticket type (or shared defaults). */
    statusOptions,
    /** Resolve a priority value to its full config record (for colour badges). */
    findPriority,
    /** Resolve an impact value to its full config record (for colour badges). */
    findImpact,
    /** Resolve an urgency value to its full config record (for colour badges). */
    findUrgency,
    /** True while the configuration is being fetched for the first time. */
    isLoading,
  };
};
