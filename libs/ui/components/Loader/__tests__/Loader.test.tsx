import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Loader from '../Loader';

describe('Loader', () => {
  it('renders correctly', () => {
    const { container } = render(<Loader />);
    expect(container).toBeInTheDocument();
  });
});
