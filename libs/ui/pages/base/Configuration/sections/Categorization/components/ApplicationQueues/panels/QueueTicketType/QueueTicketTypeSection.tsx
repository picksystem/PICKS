import type { IConfigServiceLineTicketType, ITicketType } from '@serviceops/interfaces';
import { useSharedTicketTypes } from '../../../../../../hooks/useSharedTicketTypes';
import { GenericTogglePanel } from '@serviceops/generictogglepanel';
import { QUEUE_TICKET_TYPE_CONFIG } from './QueueTicketTypeSection.config';
import { QueueTicketTypeSectionProps } from './QueueTicketTypeSection.types';

export const QueueTicketTypeSection = ({
  rows,
  onTicketTypeToggle,
  hideHeader,
}: QueueTicketTypeSectionProps) => {
  const { ticketTypes: ticketTypesData } = useSharedTicketTypes();

  const activeTicketTypes: ITicketType[] =
    ticketTypesData && ticketTypesData.length > 0
      ? ticketTypesData.filter((t: ITicketType) => t.isActive)
      : [];

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
      config={QUEUE_TICKET_TYPE_CONFIG}
      allTicketTypeKeys={allTicketTypeKeys}
      selectedParentId={null}
      ticketTypeActivations={ticketTypeActivations}
      onToggle={onTicketTypeToggle || (() => {})}
      hideHeader={hideHeader}
    />
  );
};
