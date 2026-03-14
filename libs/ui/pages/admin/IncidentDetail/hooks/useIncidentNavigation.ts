import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IIncident } from '@picks/interfaces';
import { constants } from '@picks/utils';
import { useDebounce } from '@picks/hooks';

export const useIncidentNavigation = (
  number: string | undefined,
  allIncidents: IIncident[] | undefined,
) => {
  const navigate = useNavigate();
  const { AdminPath } = constants;

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
    (inc: IIncident) => {
      setShowToolbarResults(false);
      setToolbarSearch('');
      navigate(AdminPath.INCIDENT_DETAIL.replace(':number', inc.number));
    },
    [navigate, AdminPath],
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
      navigate(AdminPath.INCIDENT_DETAIL.replace(':number', incNumber));
    },
    [navigate, AdminPath],
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
    AdminPath,
  };
};
