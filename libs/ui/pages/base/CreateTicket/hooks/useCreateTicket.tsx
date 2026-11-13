import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';
import { getRouteSlug } from '../utils/CreateTicket.utils';

const useCreateTicket = () => {
  const navigate = useNavigate();
  const { BasePath } = constants;

  /** Navigate straight to the create form for a given ticket type. */
  const openTypeDetails = (type: string) => {
    navigate(BasePath.CREATE_TICKET_TYPE.replace(':type', getRouteSlug(type)));
  };

  return { openTypeDetails };
};

export default useCreateTicket;
