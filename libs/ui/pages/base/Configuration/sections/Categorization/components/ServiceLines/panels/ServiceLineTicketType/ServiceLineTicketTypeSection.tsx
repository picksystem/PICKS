import type {
  IConfigServiceLine,
  IConfigServiceLineTicketType,
  ITicketType,
} from '@serviceops/interfaces';
import { useSharedTicketTypes } from '../../../../../../hooks/useSharedTicketTypes';
import { GenericTogglePanel, TICKET_TYPE_TOGGLE_CONFIG } from '@serviceops/configcatorshared';

interface ServiceLineTicketTypeSectionProps {
  rows?: IConfigServiceLine[];
  onTicketTypeToggle?: (
    ticketTypeKey: string,
    enabled: boolean,
    ticketTypeId: string | number,
  ) => void;
}

export const ServiceLineTicketTypeSection = ({
  rows,
  onTicketTypeToggle,
}: ServiceLineTicketTypeSectionProps) => {
  const { ticketTypes: ticketTypesData } = useSharedTicketTypes();

  const activeTicketTypes: ITicketType[] =
    ticketTypesData && ticketTypesData.length > 0
      ? ticketTypesData.filter((t: ITicketType) => t.isActive)
      : [];

  const allTicketTypeKeys = activeTicketTypes.map((tt) => tt.displayName || tt.name);

  const ticketTypeActivations: IConfigServiceLineTicketType[] = activeTicketTypes.map((tt) => {
    const stored = rows
      ?.flatMap((sl) => sl.ticketTypeActivations || [])
      .find((ta) => ta.ticketTypeId === tt.id);
    return {
      ticketTypeId: tt.id,
      ticketTypeName: tt.displayName || tt.name,
      enabled: stored?.enabled ?? true,
    };
  });

  return (
    <GenericTogglePanel
      config={TICKET_TYPE_TOGGLE_CONFIG}
      allTicketTypeKeys={allTicketTypeKeys}
      selectedParentId={null}
      ticketTypeActivations={ticketTypeActivations}
      onToggle={onTicketTypeToggle || (() => {})}
    />
  );
};
