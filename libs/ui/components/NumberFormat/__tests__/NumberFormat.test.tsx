import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import NumberFormat from '../NumberFormat';

describe('NumberFormat', () => {
  it('renders correctly', () => {
    const { container } = render(<NumberFormat />);
    expect(container).toBeInTheDocument();
  });
});
