import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';

/** TicketTemplates has moved into Configuration → Ticket Types. */
const TicketTemplatesPage = () => {
  const navigate = useNavigate();
  const { BasePath } = constants;

  useEffect(() => {
    navigate(BasePath.CONFIGURATION, { replace: true });
  }, [navigate, BasePath.CONFIGURATION]);

  return null;
};

export default TicketTemplatesPage;
