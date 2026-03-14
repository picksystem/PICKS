import CreateGenericRequest from '../CreateGenericRequest/CreateGenericRequest';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateServiceRequest = ({ onCancel, onSuccess }: Props) => (
  <CreateGenericRequest ticketTypeKey='service_request' onCancel={onCancel} onSuccess={onSuccess} />
);

export default CreateServiceRequest;
