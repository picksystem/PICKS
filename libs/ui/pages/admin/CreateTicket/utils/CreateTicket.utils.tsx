/** Route slug map for known ticket types. New types get auto-derived. */
export const ROUTE_SLUG_MAP: Record<string, string> = {
  incident: 'create-incident-request',
  service_request: 'create-service-request',
  advisory_request: 'create-advisory-request',
  change_request: 'create-change-request',
  problem_request: 'create-problem-request',
  bundle_request: 'create-bundle-request',
  task: 'create-task',
  ticket_template: 'create-ticket-template',
};

export const getRouteSlug = (type: string): string =>
  ROUTE_SLUG_MAP[type] ?? `create-${type.replace(/_/g, '-')}`;
