import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import PartnerLogo from '../PartnerLogo';

describe('PartnerLogo', () => {
  it('renders correctly', () => {
    const { container } = render(<PartnerLogo src='logo.png' alt='Logo' />);
    expect(container).toBeInTheDocument();
  });
});
