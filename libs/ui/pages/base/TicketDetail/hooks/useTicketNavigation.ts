import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { useDebounce } from '@serviceops/hooks';
import { TicketEntity } from '../types/ticketDetail.types';

export const useTicketNavigation = (
  number: string | undefined,
  allIncidents: TicketEntity[] | undefined,
) => {
  const navigate = useNavigate();
  const { BasePath } = constants;

  const [toolbarSearch, setToolbarSearch] = useState('');
  const [showToolbarResults, setShowToolbarResults] = useState(false);
  const debouncedToolbarSearch = useDebounce(toolbarSearch, 300);

  const filteredToolbarIncidents = useMemo(() => {
    if (!debouncedToolbarSearch || debouncedToolbarSearch.length < 2 || !allIncidents) return [];
    const query = debouncedToolbarSearch.toLowerCase();
    return allIncidents
      .filter(
        (inc) =>
          inc.number.toLowerCase().includes(query) ||
          (inc.shortDescription || '').toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [debouncedToolbarSearch, allIncidents]);

  const handleToolbarSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setToolbarSearch(e.target.value);
    setShowToolbarResults(true);
  }, []);

  const handleSelectToolbarIncident = useCallback(
    (inc: TicketEntity) => {
      setShowToolbarResults(false);
      setToolbarSearch('');
      navigate(BasePath.TICKET_DETAIL.replace(':number', inc.number));
    },
    [navigate, BasePath],
  );

  const handleCloseToolbarResults = useCallback(() => {
    setShowToolbarResults(false);
  }, []);

  const { prevNumber, nextNumber } = useMemo(() => {
    if (!allIncidents || !number) return { prevNumber: null, nextNumber: null };
    const idx = allIncidents.findIndex((inc) => inc.number === number);
    return {
      prevNumber: idx > 0 ? allIncidents[idx - 1].number : null,
      nextNumber: idx < allIncidents.length - 1 ? allIncidents[idx + 1].number : null,
    };
  }, [allIncidents, number]);

  const navigateToIncident = useCallback(
    (incNumber: string) => {
      navigate(BasePath.TICKET_DETAIL.replace(':number', incNumber));
    },
    [navigate, BasePath],
  );

  return {
    toolbarSearch,
    showToolbarResults,
    filteredToolbarIncidents,
    handleToolbarSearchChange,
    handleSelectToolbarIncident,
    handleCloseToolbarResults,
    prevNumber,
    nextNumber,
    navigateToIncident,
    BasePath,
  };
};
