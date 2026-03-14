import { render } from '../../../test-utils';
import '@testing-library/jest-dom';
import Toggle from '../Toggle';

describe('Toggle', () => {
  it('renders correctly', () => {
    const { container } = render(<Toggle />);
    expect(container).toBeInTheDocument();
  });
});
