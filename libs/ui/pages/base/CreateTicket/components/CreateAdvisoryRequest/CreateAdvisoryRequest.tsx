import CreateGenericRequest from '../CreateGenericRequest/CreateGenericRequest';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateAdvisoryRequest = ({ onCancel, onSuccess }: Props) => (
  <CreateGenericRequest
    ticketTypeKey='advisory_request'
    onCancel={onCancel}
    onSuccess={onSuccess}
  />
);

export default CreateAdvisoryRequest;
