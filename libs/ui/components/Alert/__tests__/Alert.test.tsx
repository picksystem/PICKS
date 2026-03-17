import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Alert from '../Alert';

describe('Alert', () => {
  it('renders correctly', () => {
    const { container } = render(<Alert />);
    expect(container).toBeInTheDocument();
  });
});
