import type { IConfigServiceLineTicketType } from '@serviceops/interfaces';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { GenericTogglePanel } from '@serviceops/pages/base/Configuration/shared/GenericTogglePanel/GenericTogglePanel';
import { QueueTicketTypeSectionProps } from './QueueTicketTypeSection.types';

export const QueueTicketTypeSection = ({
  rows,
  onTicketTypeToggle,
}: QueueTicketTypeSectionProps) => {
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const allTicketTypeKeys = activeTicketTypes.map((tt) => tt.displayName || tt.name);

  const ticketTypeActivations: IConfigServiceLineTicketType[] = activeTicketTypes.map((tt) => {
    const stored = rows
      ?.flatMap((q) => q.ticketTypeActivations || [])
      .find((ta) => ta.ticketTypeId === tt.id);
    return {
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      enabled: stored?.enabled ?? true,
    };
  });

  return (
    <GenericTogglePanel
      config={{
        title: 'Enable / Disable Ticket Types',
        subtitle: 'Configure ticket type activations per queue',
        accent: '#0369a1',
        icon: null,
        entity: 'Ticket Type',
        fields: [],
      }}
      allTicketTypeKeys={allTicketTypeKeys}
      selectedParentId={null}
      ticketTypeActivations={ticketTypeActivations}
      onToggle={onTicketTypeToggle || (() => {})}
    />
  );
};
