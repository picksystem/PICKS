import { useGetTicketTypeQuery } from '@serviceops/services';

/**
 * Shared hook for ticket types - prevents duplicate API calls
 * All components should use this instead of calling useGetTicketTypeQuery directly
 */
export const useSharedTicketTypes = () => {
  return useGetTicketTypeQuery(undefined, {
    selectFromResult: (state) => ({
      ticketTypes: state.data ?? [],
      isLoading: state.isLoading,
      isError: state.isError,
    }),
  });
};
