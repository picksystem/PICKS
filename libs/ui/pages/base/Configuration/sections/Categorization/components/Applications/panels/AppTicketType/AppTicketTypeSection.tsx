import type { IConfigServiceLineTicketType } from '@serviceops/interfaces';
import { useSharedTicketTypes } from '../../../../../../hooks/useSharedTicketTypes';
import { GenericTogglePanel } from '@serviceops/generictogglepanel';
import { TICKET_TYPE_TOGGLE_CONFIG } from './AppTicketTypeSection.config';
import { AppTicketTypeSectionProps } from './AppTicketTypeSection.types';

export const AppTicketTypeSection = ({ rows, onTicketTypeToggle }: AppTicketTypeSectionProps) => {
  const { ticketTypes: ticketTypesData } = useSharedTicketTypes();

  const activeTicketTypes: { id: string | number; displayName?: string; name: string }[] =
    ticketTypesData && ticketTypesData.length > 0
      ? ticketTypesData.filter(
          (t: { id: string | number; displayName?: string; name: string; isActive?: boolean }) =>
            t.isActive,
        )
      : [];

  const allTicketTypeKeys = activeTicketTypes.map((tt) => tt.displayName || tt.name);

  const ticketTypeActivations: IConfigServiceLineTicketType[] = activeTicketTypes.map((tt) => {
    const stored = rows
      ?.flatMap((app) => app.ticketTypeActivations || [])
      .find((ta) => ta.ticketTypeId === tt.id);
    return {
      ticketTypeId: tt.id as number,
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
      onToggle={
        onTicketTypeToggle ||
        (() => {
          /* empty */
        })
      }
    />
  );
};
