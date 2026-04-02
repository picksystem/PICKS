import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { constants } from '@serviceops/utils';

/** TicketTemplates has moved into Configuration → Ticket Types. */
const TicketTemplatesPage = () => {
  const navigate = useNavigate();
  const { AdminPath } = constants;

  useEffect(() => {
    navigate(AdminPath.CONFIGURATION, { replace: true });
  }, [navigate, AdminPath.CONFIGURATION]);

  return null;
};

export default TicketTemplatesPage;
