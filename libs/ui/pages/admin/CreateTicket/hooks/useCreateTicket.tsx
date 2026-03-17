import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@picks/hooks';
import { constants } from '@picks/utils';
import { getRouteSlug } from '../utils/CreateTicket.utils';

const useCreateTicket = () => {
  const navigate = useNavigate();
  const { AdminPath } = constants;
  const [selectedType, setSelectedType] = useState<string>('');
  const notify = useNotification();

  const handleEnterDetails = () => {
    if (!selectedType) {
      notify.warning('Please select a ticket type before entering details.');
      return;
    }
    navigate(AdminPath.CREATE_TICKET_TYPE.replace(':type', getRouteSlug(selectedType)));
  };

  const handleCancelCreation = () => {
    setSelectedType('');
    navigate(AdminPath.DASHBOARD);
  };

  return {
    selectedType,
    setSelectedType,
    handleEnterDetails,
    handleCancelCreation,
  };
};

export default useCreateTicket;
