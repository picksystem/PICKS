import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import { getRouteSlug } from '../utils/CreateTicket.utils';

const useCreateTicket = () => {
  const navigate = useNavigate();
  const { BasePath } = constants;
  const [selectedType, setSelectedType] = useState<string>('');
  const notify = useNotification();

  const handleEnterDetails = () => {
    if (!selectedType) {
      notify.warning('Please select a ticket type before entering details.');
      return;
    }
    navigate(BasePath.CREATE_TICKET_TYPE.replace(':type', getRouteSlug(selectedType)));
  };

  const handleCancelCreation = () => {
    setSelectedType('');
    navigate(BasePath.DASHBOARD);
  };

  return {
    selectedType,
    setSelectedType,
    handleEnterDetails,
    handleCancelCreation,
  };
};

export default useCreateTicket;
