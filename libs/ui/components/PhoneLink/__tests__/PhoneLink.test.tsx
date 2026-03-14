import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import PhoneLink from '../PhoneLink';

describe('PhoneLink', () => {
  it('renders correctly', () => {
    const { container } = render(<PhoneLink phoneNumber='1234567890' />);
    expect(container).toBeInTheDocument();
  });
});
