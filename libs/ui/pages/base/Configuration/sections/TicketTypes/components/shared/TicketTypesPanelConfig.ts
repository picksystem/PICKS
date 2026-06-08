export const TICKET_TYPE_TABLE_CONFIG = {
  searchPlaceholder: 'Search ticket types...',
  emptyMessage: 'No ticket types configured. Click "Add New Ticket Type" to create one.',
  columns: {
    name: 'Name',
    displayName: 'Display Name',
    type: 'Type',
    prefix: 'Prefix',
    isActive: 'Active',
  },
} as const;

export const TICKET_TYPE_VIEW_CONFIG = {
  ticketTypeConfig: {
    title: 'Ticket Type Configuration',
    subtitle: 'Activate prefixes, numbering, and display settings for each ticket type',
  },
} as const;
